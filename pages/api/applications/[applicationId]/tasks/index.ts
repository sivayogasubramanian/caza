import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse, StatusMessageType } from '../../../../../types/apiResponse';
import { TaskData, TaskPostData } from '../../../../../types/task';
import { Nullable } from '../../../../../types/utils';
import { withVerifiedUser } from '../../../../../utils/auth/jwtHelpers';
import { isValidDate } from '../../../../../utils/date/validations';
import { createJsonResponse, HttpMethod, HttpStatus, rejectHttpMethod } from '../../../../../utils/http/httpHelpers';
import { isInteger } from '../../../../../utils/numbers/validations';
import { withPrismaErrorHandling } from '../../../../../utils/prisma/prismaHelpers';
import { isEmpty } from '../../../../../utils/strings/validations';

const prisma = new PrismaClient();

enum MessageType {
  EMPTY_TITLE,
  INVALID_DUE_DATE,
  INVALID_NOTIFICATION_DATETIME,
  TASK_APPLICATION_ID_INVALID,
  TASK_APPLICATION_NOT_FOUND,
  TASK_APPLICATION_DOES_NOT_BELONG_TO_USER,
  TASK_CREATED_SUCCESSFULLY,
}

const messages = Object.freeze({
  [MessageType.EMPTY_TITLE]: { type: StatusMessageType.ERROR, message: 'Task title is empty.' },
  [MessageType.INVALID_DUE_DATE]: {
    type: StatusMessageType.ERROR,
    message: 'Task notification date and time is invalid.',
  },
  [MessageType.INVALID_NOTIFICATION_DATETIME]: {
    type: StatusMessageType.ERROR,
    message: 'Task notification date and time is invalid.',
  },
  [MessageType.TASK_APPLICATION_ID_INVALID]: {
    type: StatusMessageType.ERROR,
    message: 'Application id for this task is invalid.',
  },
  [MessageType.TASK_APPLICATION_NOT_FOUND]: {
    type: StatusMessageType.ERROR,
    message: 'Application for this task cannot be found.',
  },
  [MessageType.TASK_APPLICATION_DOES_NOT_BELONG_TO_USER]: {
    type: StatusMessageType.ERROR,
    message: 'Application for this task cannot be found.',
  },
  [MessageType.TASK_CREATED_SUCCESSFULLY]: { type: StatusMessageType.SUCCESS, message: 'Task created successfully.' },
});

function handler(userId: string, req: NextApiRequest, res: NextApiResponse) {
  const method = req.method;

  switch (method) {
    case HttpMethod.POST:
      handlePost(userId, req, res);
      break;
    default:
      rejectHttpMethod(res, method);
  }
}

async function handlePost(userId: string, req: NextApiRequest, res: NextApiResponse<ApiResponse<TaskData>>) {
  if (!isInteger(req.query.applicationId as string)) {
    res.status(HttpStatus.BAD_REQUEST).json(createJsonResponse({}, messages[MessageType.TASK_APPLICATION_ID_INVALID]));
    return;
  }

  const applicationId = Number(req.query.applicationId);
  const application = await prisma.application.findUnique({ where: { id: applicationId } });

  if (!application) {
    res.status(HttpStatus.NOT_FOUND).json(createJsonResponse({}, messages[MessageType.TASK_APPLICATION_NOT_FOUND]));
    return;
  }

  if (application.userId !== userId) {
    res
      .status(HttpStatus.FORBIDDEN)
      .json(createJsonResponse({}, messages[MessageType.TASK_APPLICATION_DOES_NOT_BELONG_TO_USER]));
    return;
  }

  const errorMessageType = validateRequest(req);
  if (errorMessageType) {
    res.status(HttpStatus.BAD_REQUEST).json(createJsonResponse({}, messages[errorMessageType]));
    return;
  }

  const taskPostData: TaskPostData = {
    ...req.body,
    dueDate: new Date(req.body.dueDate),
    notificationDateTime: req.body.notificationDateTime ? new Date(req.body.notificationDateTime) : null,
  };

  const newTask = await prisma.task.create({
    data: {
      applicationId,
      ...taskPostData,
    },
    select: { id: true, title: true, dueDate: true, notificationDateTime: true, isDone: true },
  });

  res.status(HttpStatus.CREATED).json(createJsonResponse(newTask, messages[MessageType.TASK_CREATED_SUCCESSFULLY]));
}

function validateRequest(req: NextApiRequest): Nullable<MessageType> {
  if (isEmpty(req.body.title)) {
    return MessageType.EMPTY_TITLE;
  }

  if (!isValidDate(req.body.dueDate)) {
    return MessageType.INVALID_DUE_DATE;
  }

  if (
    (req.body.notification || req.body.notificationDateTime !== undefined) &&
    !isValidDate(req.body.notificationDateTime)
  ) {
    return MessageType.INVALID_NOTIFICATION_DATETIME;
  }

  return null;
}

export default withPrismaErrorHandling(withVerifiedUser(handler));
