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
import { combineDefinedArrays, getArrayOrUndefined } from '../../../utils/arrays';

enum MessageType {
  APPLICATION_CREATED_SUCCESSFULLY,
  DUPLICATE_APPLICATION,
  MISSING_ROLE_ID,
  INVALID_ROLE_ID,
  INVALID_QUERY_APPLICATION_STAGE_TYPE,
  INVALID_QUERY_ROLE_TYPE,
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
  [MessageType.INVALID_QUERY_ROLE_TYPE]: {
    type: StatusMessageType.ERROR,
    message: 'Application query role type is invalid.',
  },
  [MessageType.INVALID_QUERY_APPLICATION_STAGE_TYPE]: {
    type: StatusMessageType.ERROR,
    message: 'Application query stage type is invalid.',
  },
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
  const errorMessageType = validateGetQueryParams(queryParams);
  if (errorMessageType !== null) {
    res.status(HttpStatus.BAD_REQUEST).json(createJsonResponse({}, messages[errorMessageType]));
    return;
  }

  const companyNameFilters = makeCompanyNameFilters(queryParams.searchWords);
  const roleTitleFilters = makeRoleTitleFilters(queryParams.searchWords);
  const roleYearFilters = makeRoleYearFilters(queryParams.searchWords);
  // Safe to typecast as validation is done above.
  const roleTypeFilters = makeRoleTypeFilters(queryParams.roleTypeWords as RoleType[]);
  const selectedApplicationStageTypes = queryParams.stageTypeWords;
  const hasSelectedApplicationStageTypes = selectedApplicationStageTypes && selectedApplicationStageTypes.length > 0;
  const companyOrFilters = companyNameFilters?.map((filter) => ({ company: filter }));
  const roleOrFilters = getArrayOrUndefined<Prisma.RoleWhereInput>(
    combineDefinedArrays<Prisma.RoleWhereInput>([companyOrFilters, roleTitleFilters]),
  );

  const queriedApplications = await prisma.application.findMany({
    where: {
      userId: userId,
      role: {
        AND: [{ OR: roleTypeFilters }, { OR: roleYearFilters }, { OR: roleOrFilters }],
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

function parseGetQueryParams(req: NextApiRequest) {
  const searchWords =
    req.query.searchQuery === undefined
      ? []
      : Array.isArray(req.query.searchQuery)
      ? req.query.searchQuery
      : req.query.searchQuery.trim().split(/\s+/);

  const roleTypeWords =
    req.query.roleTypes === undefined
      ? []
      : Array.isArray(req.query.roleTypes)
      ? req.query.roleTypes
      : req.query.roleTypes.trim().split(/\s*,\s*/);

  const stageTypeWords =
    req.query.stageTypes === undefined
      ? []
      : Array.isArray(req.query.stageTypes)
      ? req.query.stageTypes
      : req.query.stageTypes.trim().split(/\s*,\s*/);

  return { searchWords, roleTypeWords, stageTypeWords };
}

function validateGetQueryParams(queryParams: ApplicationQueryParams): Nullable<MessageType> {
  if (!queryParams.roleTypeWords.every((type) => type in RoleType)) {
    return MessageType.INVALID_QUERY_ROLE_TYPE;
  }

  if (!queryParams.stageTypeWords.every((type) => type in ApplicationStageType)) {
    return MessageType.INVALID_QUERY_APPLICATION_STAGE_TYPE;
  }

  return null;
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
