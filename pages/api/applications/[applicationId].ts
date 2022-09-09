import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse, EmptyPayload, StatusMessageType } from '../../../types/apiResponse';
import { ApplicationData } from '../../../types/application';
import { Nullable } from '../../../types/utils';
import { withAuthUser } from '../../../utils/auth/jwtHelpers';
import { createJsonResponse, HttpMethod, HttpStatus, rejectHttpMethod } from '../../../utils/http/httpHelpers';
import { isInteger } from '../../../utils/numbers/validations';
import { withPrismaErrorHandling } from '../../../utils/prisma/prismaHelpers';

const prisma = new PrismaClient();

enum MessageType {
  APPLICATION_ID_INVALID,
  APPLICATION_NOT_FOUND,
  APPLICATION_DOES_NOT_BELONG_TO_USER,
  APPLICATION_DELETED_SUCCESSFULLY,
}

const messages = Object.freeze({
  [MessageType.APPLICATION_ID_INVALID]: { type: StatusMessageType.ERROR, message: 'Application id is invalid.' },
  [MessageType.APPLICATION_NOT_FOUND]: { type: StatusMessageType.ERROR, message: 'Application cannot be found.' },
  [MessageType.APPLICATION_DOES_NOT_BELONG_TO_USER]: {
    type: StatusMessageType.ERROR,
    message: 'Application does not belong to you.',
  },
  [MessageType.APPLICATION_DELETED_SUCCESSFULLY]: {
    type: StatusMessageType.SUCCESS,
    message: 'Application was deleted successfully.',
  },
});

function handler(userId: string, req: NextApiRequest, res: NextApiResponse) {
  const method = req.method;

  switch (method) {
    case HttpMethod.GET:
      handleGet(userId, req, res);
      break;
    case HttpMethod.DELETE:
      handleDelete(userId, req, res);
      break;
    default:
      rejectHttpMethod(res, method);
  }
}

async function handleGet(userId: string, req: NextApiRequest, res: NextApiResponse<ApiResponse<ApplicationData>>) {
  if (!isInteger(req.query.applicationId as string)) {
    res.status(HttpStatus.BAD_REQUEST).json(createJsonResponse({}, messages[MessageType.APPLICATION_ID_INVALID]));
    return;
  }

  const applicationId = Number(req.query.applicationId);

  const application: Nullable<ApplicationData> = await prisma.application.findFirst({
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
        orderBy: {
          date: 'desc',
        },
        select: {
          id: true,
          type: true,
          date: true,
          emojiUnicodeHex: true,
          remark: true,
        },
      },
      tasks: {
        orderBy: {
          dueDate: 'desc',
        },
        select: { id: true, title: true, dueDate: true, notificationDateTime: true, isDone: true },
      },
    },
  });

  if (!application) {
    res.status(HttpStatus.NOT_FOUND).json(createJsonResponse({}, messages[MessageType.APPLICATION_NOT_FOUND]));
    return;
  }

  res.status(HttpStatus.OK).json(createJsonResponse(application));
}

async function handleDelete(userId: string, req: NextApiRequest, res: NextApiResponse<ApiResponse<EmptyPayload>>) {
  if (!isInteger(req.query.applicationId as string)) {
    res.status(HttpStatus.BAD_REQUEST).json(createJsonResponse({}, messages[MessageType.APPLICATION_ID_INVALID]));
    return;
  }

  const applicationId = Number(req.query.applicationId);

  // As applicationId is a primary key, count will only match 0 or 1. This is effectively 'delete if exists' behavior.
  const { count } = await prisma.application.deleteMany({ where: { id: applicationId, userId } });

  if (count === 0) {
    res
      .status(HttpStatus.UNAUTHORIZED)
      .json(createJsonResponse({}, messages[MessageType.APPLICATION_DOES_NOT_BELONG_TO_USER]));
    return;
  }

  res.status(HttpStatus.OK).json(createJsonResponse({}, messages[MessageType.APPLICATION_DELETED_SUCCESSFULLY]));
}

export default withPrismaErrorHandling(withAuthUser(handler));
