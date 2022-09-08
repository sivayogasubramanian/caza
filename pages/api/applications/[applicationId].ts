import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse, EmptyPayload, StatusMessage, StatusMessageType } from '../../../types/apiResponse';
import { ApplicationData } from '../../../types/application';
import { withAuthUser } from '../../../utils/auth/jwtHelpers';
import {
  createJsonResponse,
  HTTP_DELETE_METHOD,
  HTTP_GET_METHOD,
  HTTP_STATUS_NOT_FOUND,
  HTTP_STATUS_OK,
  HTTP_STATUS_UNAUTHORIZED,
  rejectHttpMethod,
} from '../../../utils/http/httpHelpers';

const prisma = new PrismaClient();

enum MessageType {
  APPLICATION_NOT_FOUND,
  APPLICATION_DOES_NOT_BELONG_TO_USER,
  APPLICATION_DELETED_SUCCESSFULLY,
}

const messages = new Map<MessageType, StatusMessage[]>([
  [MessageType.APPLICATION_NOT_FOUND, [{ type: StatusMessageType.Error, message: 'Application cannot be found.' }]],
  [
    MessageType.APPLICATION_DOES_NOT_BELONG_TO_USER,
    [{ type: StatusMessageType.Error, message: 'Application does not belong to you.' }],
  ],
  [
    MessageType.APPLICATION_DELETED_SUCCESSFULLY,
    [{ type: StatusMessageType.Success, message: 'Application was deleted successfully.' }],
  ],
]);

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
      rejectHttpMethod(res, method);
  }
}

async function handleGet(
  userId: string,
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<ApplicationData | EmptyPayload>>,
) {
  const applicationId = Number(req.query.applicationId);

  const application: ApplicationData | null = await prisma.application.findFirst({
    where: {
      id: applicationId,
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
    res.status(HTTP_STATUS_NOT_FOUND).json(createJsonResponse({}, messages.get(MessageType.APPLICATION_NOT_FOUND)));
    return;
  }

  res.status(HTTP_STATUS_OK).json(createJsonResponse(application));
}

async function handleDelete(userId: string, req: NextApiRequest, res: NextApiResponse<ApiResponse<EmptyPayload>>) {
  const applicationId = Number(req.query.applicationId);

  const { count } = await prisma.application.deleteMany({ where: { id: applicationId, userId } });

  if (count === 0) {
    res
      .status(HTTP_STATUS_UNAUTHORIZED)
      .json(createJsonResponse({}, messages.get(MessageType.APPLICATION_DOES_NOT_BELONG_TO_USER)));
    return;
  }

  res.status(HTTP_STATUS_OK).json(createJsonResponse({}, messages.get(MessageType.APPLICATION_DELETED_SUCCESSFULLY)));
}

export default withAuthUser(handler);
