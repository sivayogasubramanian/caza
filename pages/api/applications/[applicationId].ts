import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse, EmptyPayload, StatusMessageType } from '../../../types/apiResponse';
import { ApplicationData } from '../../../types/application';
import { withVerifiedUser } from '../../../utils/auth/jwtHelpers';
import {
  HTTP_DELETE_METHOD,
  HTTP_GET_METHOD,
  HTTP_STATUS_NOT_FOUND,
  HTTP_STATUS_OK,
  HTTP_STATUS_UNAUTHORIZED,
} from '../../../utils/http/httpHelper';
import { rejectHttpMethodsNotIn } from '../../../utils/http/rejectHttpMethodsNotIn';

const prisma = new PrismaClient();

function handler(userId: string, req: NextApiRequest, res: NextApiResponse) {
  const method = req.method;

  switch (method) {
    case HTTP_GET_METHOD:
      handleGet(userId, req, res);
      break;
    case HTTP_DELETE_METHOD:
      handleDelete(userId, req, res);
      break;
    default:
      rejectHttpMethodsNotIn(res, HTTP_GET_METHOD, HTTP_DELETE_METHOD);
  }
}

async function handleGet(userId: string, req: NextApiRequest, res: NextApiResponse<ApiResponse<ApplicationData>>) {
  const applicationId = Number(req.query.applicationId);

  const application: ApplicationData | null = await prisma.application.findFirst({
    where: {
      id: applicationId,
      userId,
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
      applicationStages: {
        select: {
          id: true,
          type: true,
          date: true,
          emojiUnicodeHex: true,
          remark: true,
        },
      },
      tasks: {
        select: { id: true, title: true, dueDate: true, notificationDateTime: true, isDone: true },
      },
    },
  });

  if (!application) {
    const response: ApiResponse<ApplicationData> = {
      payload: {},
      messages: [{ type: StatusMessageType.Error, message: `Application ${applicationId} was not found.` }],
    };

    res.status(HTTP_STATUS_NOT_FOUND).json(response);
    return;
  }

  const response: ApiResponse<ApplicationData> = {
    payload: application,
    messages: [],
  };

  res.status(HTTP_STATUS_OK).json(response);
}

async function handleDelete(userId: string, req: NextApiRequest, res: NextApiResponse<ApiResponse<EmptyPayload>>) {
  const applicationId = Number(req.query.applicationId);

  const { count } = await prisma.application.deleteMany({ where: { id: applicationId, userId } });

  if (count === 0) {
    const response: ApiResponse<EmptyPayload> = {
      payload: {},
      messages: [{ type: StatusMessageType.Error, message: `Application ${applicationId} does not belong to you.` }],
    };

    res.status(HTTP_STATUS_UNAUTHORIZED).json(response);
    return;
  }

  const response: ApiResponse<EmptyPayload> = {
    payload: {},
    messages: [{ type: StatusMessageType.Success, message: `Application ${applicationId} was deleted successfully.` }],
  };

  res.status(HTTP_STATUS_OK).json(response);
}

export default withVerifiedUser(handler);
