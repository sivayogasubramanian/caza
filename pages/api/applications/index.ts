import type { NextApiRequest, NextApiResponse } from 'next';
import {
  ApplicationListData,
  ApplicationPostData,
  ApplicationQueryParams,
  ApplicationRoleData,
} from '../../../types/application';
import { ApplicationStageType, Prisma, PrismaClient, RoleType } from '@prisma/client';
import { createJsonResponse, HttpMethod, HttpStatus, rejectHttpMethod } from '../../../utils/http/httpHelpers';
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

enum MessageType {
  APPLICATION_CREATED_SUCCESSFULLY,
  DUPLICATE_APPLICATION,
  MISSING_ROLE_ID,
  INVALID_ROLE_ID,
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
});

async function handler(userId: string, req: NextApiRequest, res: NextApiResponse) {
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
      role: {
        select: {
          id: true,
          title: true,
          type: true,
          year: true,
          company: {
            select: {
              id: true,
              name: true,
              companyUrl: true,
            },
          },
        },
      },
      applicationStages: {
        orderBy: {
          date: 'desc',
        },
        take: 1,
        select: {
          id: true,
          type: true,
          date: true,
          emojiUnicodeHex: true,
        },
      },
      _count: {
        select: {
          tasks: {
            where: {
              notificationDateTime: {
                lte: new Date(),
              },
              isDone: false,
            },
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
      latestStage: application.applicationStages[0],
      taskNotificationCount: application._count.tasks,
    }))
    .filter(
      (application) =>
        !hasSelectedApplicationStageTypes || application.latestStage?.type in selectedApplicationStageTypes,
    )
    .sort(
      (firstApplication, secondApplication) =>
        secondApplication.taskNotificationCount - firstApplication.taskNotificationCount ||
        (secondApplication.latestStage?.date || MIN_DATE).valueOf() -
          (firstApplication.latestStage?.date || MIN_DATE).valueOf(),
    );

  res.status(HttpStatus.OK).json(createJsonResponse(applications));
}

async function handlePost(userId: string, req: NextApiRequest, res: NextApiResponse<ApiResponse<ApplicationRoleData>>) {
  const errorMessageType = validatePostRequest(req);
  if (errorMessageType !== null) {
    res.status(HttpStatus.BAD_REQUEST).json(createJsonResponse({}, messages[errorMessageType]));
    return;
  }

  const applicationPostData: ApplicationPostData = {
    roleId: req.body.roleId,
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
    },
    select: {
      id: true,
      role: {
        select: {
          id: true,
          title: true,
          type: true,
          year: true,
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
  const searchWords =
    req.query.searchQuery === undefined
      ? []
      : Array.isArray(req.query.searchQuery)
      ? req.query.searchQuery
      : req.query.searchQuery.trim().split(/\s+/);

  const roleTypeUncheckedWords =
    req.query.roleTypes === undefined
      ? []
      : Array.isArray(req.query.roleTypes)
      ? req.query.roleTypes
      : req.query.roleTypes.trim().split(/\s*,\s*/);

  // Safe to typecast due to the filter check.
  const roleTypeWords: RoleType[] = roleTypeUncheckedWords.filter((word) => word in RoleType) as RoleType[];

  const stageTypeUncheckedWords =
    req.query.stageTypes === undefined
      ? []
      : Array.isArray(req.query.stageTypes)
      ? req.query.stageTypes
      : req.query.stageTypes.trim().split(/\s*,\s*/);

  // Safe to typecast due to the filter check.
  const stageTypeWords: ApplicationStageType[] = stageTypeUncheckedWords.filter(
    (word) => word in ApplicationStageType,
  ) as ApplicationStageType[];

  return { searchWords, roleTypeWords, stageTypeWords };
}

function validatePostRequest(req: NextApiRequest): Nullable<MessageType> {
  if (req.body.roleId === undefined) {
    return MessageType.MISSING_ROLE_ID;
  }

  if (req.body.roleId === null || !Number.isInteger(req.body.roleId)) {
    return MessageType.INVALID_ROLE_ID;
  }

  return null;
}

export default withPrismaErrorHandling(withAuthUser(handler));
