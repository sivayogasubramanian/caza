import type { NextApiRequest, NextApiResponse } from 'next';
import { ApplicationListData, ApplicationPostData, ApplicationRoleData } from '../../../types/application';
import { PrismaClient } from '@prisma/client';
import { createJsonResponse, HttpMethod, HttpStatus, rejectHttpMethod } from '../../../utils/http/httpHelpers';
import { withAuthUser } from '../../../utils/auth/jwtHelpers';
import { ApiResponse, StatusMessageType } from '../../../types/apiResponse';
import { Nullable } from '../../../types/utils';
import { MIN_DATE } from '../../../utils/constants';

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
  const queriedApplications = await prisma.application.findMany({
    where: {
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
    userId,
  };

  const duplicateCount = await prisma.application.count({
    where: {
      roleId: applicationPostData.roleId,
      userId: applicationPostData.userId,
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

function validatePostRequest(req: NextApiRequest): Nullable<MessageType> {
  if (req.body.roleId === undefined) {
    return MessageType.MISSING_ROLE_ID;
  }

  if (req.body.roleId === null || !Number.isInteger(req.body.roleId)) {
    return MessageType.INVALID_ROLE_ID;
  }

  return null;
}

export default withAuthUser(handler);
