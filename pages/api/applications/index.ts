import type { NextApiRequest, NextApiResponse } from 'next';
import { ApplicationListData, ApplicationQueryParams, ApplicationRoleData } from '../../../types/application';
import { ApplicationStage, ApplicationStageType, Company, Prisma, PrismaClient, Role, RoleType } from '@prisma/client';
import {
  convertQueryParamToStringArray,
  createJsonResponse,
  HttpMethod,
  HttpStatus,
  rejectHttpMethod,
} from '../../../utils/http/httpHelpers';
import { withAuthUser } from '../../../utils/auth/jwtHelpers';
import { ApiResponse, StatusMessageType } from '../../../types/apiResponse';
import { Nullable } from '../../../types/utils';
import { MIN_DATE } from '../../../utils/constants';
import { withPrismaErrorHandling } from '../../../utils/prisma/prismaHelpers';
import {
  makeCompanyNameFilters,
  makeRoleTitleFilters,
  makeRoleTypeFilters,
  makeRoleYearFilters,
} from '../../../utils/filters/filterHelpers';
import { combineDefinedArrays, getNonEmptyArrayOrUndefined } from '../../../utils/arrays';
import { splitByCommaRemovingWhitespacesAround, splitByWhitespaces } from '../../../utils/strings/formatters';
import { convertApplicationStageToPayload } from '../../../utils/applicationStage/converter';
import { isValidDate } from '../../../utils/date/validations';
import { canBecomeInteger } from '../../../utils/numbers/validations';

enum MessageType {
  APPLICATION_CREATED_SUCCESSFULLY,
  DUPLICATE_APPLICATION,
  MISSING_ROLE_ID,
  INVALID_ROLE_ID,
  INVALID_DATE,
}

const prisma = new PrismaClient();

const messages = Object.freeze({
  [MessageType.APPLICATION_CREATED_SUCCESSFULLY]: {
    type: StatusMessageType.SUCCESS,
    message: 'Application created successfully.',
  },
  [MessageType.DUPLICATE_APPLICATION]: {
    type: StatusMessageType.ERROR,
    message: 'An application with the same role and user already exists.',
  },
  [MessageType.MISSING_ROLE_ID]: { type: StatusMessageType.ERROR, message: 'Application role id is missing.' },
  [MessageType.INVALID_ROLE_ID]: { type: StatusMessageType.ERROR, message: 'Application role id is invalid.' },
  [MessageType.INVALID_DATE]: { type: StatusMessageType.ERROR, message: 'Application date is invalid.' },
});

async function handler(
  userId: string,
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<ApplicationListData[] | ApplicationRoleData>>,
) {
  const method = req.method;
  switch (method) {
    case HttpMethod.GET:
      return handleGet(userId, req, res);
    case HttpMethod.POST:
      return handlePost(userId, req, res);
    default:
      return rejectHttpMethod(res, method);
  }
}

async function handleGet(
  userId: string,
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<ApplicationListData[]>>,
) {
  const queryParams: ApplicationQueryParams = parseGetQueryParams(req);

  const companyNameFilters = makeCompanyNameFilters(queryParams.searchWords);
  const roleTitleFilters = makeRoleTitleFilters(queryParams.searchWords);
  const roleYearFilters = makeRoleYearFilters(queryParams.searchWords);
  const roleTypeFilters = makeRoleTypeFilters(queryParams.roleTypeWords);
  const companyOrFilters = companyNameFilters?.map((filter) => ({ company: filter }));
  const roleTitleOrCompanyFilters = getNonEmptyArrayOrUndefined<Prisma.RoleWhereInput>(
    combineDefinedArrays<Prisma.RoleWhereInput>([roleTitleFilters, companyOrFilters]),
  );

  const queriedApplications = await prisma.application.findMany({
    where: {
      userId: userId,
      role: {
        AND: [{ OR: roleTypeFilters }, { OR: roleTitleOrCompanyFilters }, { OR: roleYearFilters }],
      },
    },
    select: {
      id: true,
      role: { include: { company: true } },
      applicationStages: { orderBy: { date: 'desc' }, take: 1 },
      _count: {
        select: {
          tasks: {
            where: { notificationDateTime: { lte: new Date() }, isDone: false },
          },
        },
      },
    },
  });

  // Used in filters for applications whose latest stage type matches any of the query stage types.
  // Done in application layer as prisma does not support such queries.
  const selectedApplicationStageTypes = queryParams.stageTypeWords;
  const hasSelectedApplicationStageTypes = selectedApplicationStageTypes && selectedApplicationStageTypes.length > 0;

  const applications: ApplicationListData[] = queriedApplications
    .map((application) => ({
      id: application.id,
      role: application.role,
      latestStage: application.applicationStages.length > 0 ? application.applicationStages[0] : undefined,
      taskNotificationCount: application._count.tasks,
    }))
    .filter(
      (application) =>
        !hasSelectedApplicationStageTypes ||
        (application.latestStage && selectedApplicationStageTypes.includes(application.latestStage?.type)),
    )
    .sort(
      (firstApplication, secondApplication) =>
        secondApplication.taskNotificationCount - firstApplication.taskNotificationCount ||
        (secondApplication.latestStage?.date || MIN_DATE).valueOf() -
          (firstApplication.latestStage?.date || MIN_DATE).valueOf(),
    )
    .map(convertApplicationListDataToPayload);

  res.status(HttpStatus.OK).json(createJsonResponse(applications));
}

async function handlePost(userId: string, req: NextApiRequest, res: NextApiResponse<ApiResponse<ApplicationRoleData>>) {
  const errorMessageType = validatePostRequest(req);
  if (errorMessageType !== null) {
    res.status(HttpStatus.BAD_REQUEST).json(createJsonResponse({}, messages[errorMessageType]));
    return;
  }

  const applicationPostData = {
    roleId: req.body.roleId,
    applicationDate: new Date(req.body.applicationDate),
  };

  const duplicateCount = await prisma.application.count({
    where: {
      roleId: applicationPostData.roleId,
      userId: userId,
    },
  });

  if (duplicateCount > 0) {
    res.status(HttpStatus.BAD_REQUEST).json(createJsonResponse({}, messages[MessageType.DUPLICATE_APPLICATION]));
    return;
  }

  const newApplication = await prisma.application.create({
    data: {
      roleId: applicationPostData.roleId,
      userId: userId,
      applicationStages: {
        create: {
          type: ApplicationStageType.APPLIED,
          date: applicationPostData.applicationDate,
        },
      },
    },
    select: {
      id: true,
      role: {
        select: {
          id: true,
          title: true,
          type: true,
          year: true,
          isVerified: true,
          company: { select: { id: true, name: true, companyUrl: true } },
        },
      },
    },
  });

  res
    .status(HttpStatus.CREATED)
    .json(createJsonResponse(newApplication, messages[MessageType.APPLICATION_CREATED_SUCCESSFULLY]));
}

function parseGetQueryParams(req: NextApiRequest): ApplicationQueryParams {
  const { roleTypes, stageTypes, searchWords } = req.query;

  const searchWordsArr = convertQueryParamToStringArray(searchWords, splitByWhitespaces);
  const roleTypeUncheckedWords = convertQueryParamToStringArray(roleTypes, splitByCommaRemovingWhitespacesAround);

  // Safe to typecast due to the filter check.
  const roleTypeWords: RoleType[] = roleTypeUncheckedWords.filter((word) => word in RoleType) as RoleType[];

  const stageTypeUncheckedWords = convertQueryParamToStringArray(stageTypes, splitByCommaRemovingWhitespacesAround);

  // Safe to typecast due to the filter check.
  const stageTypeWords: ApplicationStageType[] = stageTypeUncheckedWords.filter(
    (word) => word in ApplicationStageType,
  ) as ApplicationStageType[];

  return { searchWords: searchWordsArr, roleTypeWords, stageTypeWords };
}

function validatePostRequest(req: NextApiRequest): Nullable<MessageType> {
  const { roleId, applicationDate } = req.body;
  if (roleId === undefined) {
    return MessageType.MISSING_ROLE_ID;
  }

  if (!canBecomeInteger(roleId)) {
    return MessageType.INVALID_ROLE_ID;
  }

  if (applicationDate === null || applicationDate === undefined || !isValidDate(applicationDate + '')) {
    return MessageType.INVALID_DATE;
  }

  return null;
}

function convertApplicationListDataToPayload({
  id,
  role,
  latestStage,
  taskNotificationCount,
}: {
  id: number;
  role: Role & { company: Company };
  latestStage: ApplicationStage | undefined;
  taskNotificationCount: number;
}): ApplicationListData {
  const { company, title, type, year, isVerified } = role;
  return {
    id,
    taskNotificationCount,
    role: {
      type,
      title,
      year,
      isVerified,
      id: role.id,
      company: { id: company.id, name: company.name, companyUrl: company.companyUrl },
    },
    latestStage: latestStage ? convertApplicationStageToPayload(latestStage) : undefined,
  };
}

export default withPrismaErrorHandling(withAuthUser(handler));
