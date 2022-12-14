import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse, StatusMessageType } from '../../../../../types/apiResponse';
import { TaskData } from '../../../../../types/task';
import { Nullable } from '../../../../../types/utils';
import { withAuthUser } from '../../../../../utils/auth/jwtHelpers';
import { isValidDate } from '../../../../../utils/date/validations';
import { createJsonResponse, HttpMethod, HttpStatus, rejectHttpMethod } from '../../../../../utils/http/httpHelpers';
import { withPrismaErrorHandling } from '../../../../../utils/prisma/prismaHelpers';
import { isEmpty } from '../../../../../utils/strings/validations';
import { canBecomeInteger } from '../../../../../utils/numbers/validations';
import { convertTaskToPayload } from '../../../../../utils/task/converter';

const prisma = new PrismaClient();

enum MessageType {
  MISSING_TITLE,
  INVALID_TITLE,
  EMPTY_TITLE,
  MISSING_DUE_DATE,
  INVALID_DUE_DATE,
  INVALID_NOTIFICATION_DATETIME,
  TASK_APPLICATION_ID_INVALID,
  TASK_APPLICATION_NOT_FOUND,
  TASK_APPLICATION_DOES_NOT_BELONG_TO_USER,
  TASK_CREATED_SUCCESSFULLY,
}

const messages = Object.freeze({
  [MessageType.MISSING_TITLE]: { type: StatusMessageType.ERROR, message: 'Task title is missing.' },
  [MessageType.INVALID_TITLE]: { type: StatusMessageType.ERROR, message: 'Task title is invalid.' },
  [MessageType.EMPTY_TITLE]: { type: StatusMessageType.ERROR, message: 'Task title is empty.' },
  [MessageType.MISSING_DUE_DATE]: {
    type: StatusMessageType.ERROR,
    message: 'Task due date is missing.',
  },
  [MessageType.INVALID_DUE_DATE]: {
    type: StatusMessageType.ERROR,
    message: 'Task due date is invalid.',
  },
  [MessageType.INVALID_NOTIFICATION_DATETIME]: {
    type: StatusMessageType.ERROR,
    message: 'Task notification date and/or time is invalid.',
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
    message: 'Application for this task does not belong to you.',
  },
  [MessageType.TASK_CREATED_SUCCESSFULLY]: { type: StatusMessageType.SUCCESS, message: 'Task created successfully.' },
});

async function handler(userId: string, req: NextApiRequest, res: NextApiResponse) {
  const method = req.method;

  switch (method) {
    case HttpMethod.POST:
      return handlePost(userId, req, res);
    default:
      return rejectHttpMethod(res, method);
  }
}

async function handlePost(userId: string, req: NextApiRequest, res: NextApiResponse<ApiResponse<TaskData>>) {
  if (!canBecomeInteger(req.query.applicationId)) {
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

  const errorMessageType = validatePostRequest(req);
  if (errorMessageType !== null) {
    res.status(HttpStatus.BAD_REQUEST).json(createJsonResponse({}, messages[errorMessageType]));
    return;
  }

  const taskPostData = {
    title: req.body.title,
    dueDate: new Date(req.body.dueDate),
    notificationDateTime: req.body.notificationDateTime ? new Date(req.body.notificationDateTime) : null,
  };

  const newTask = await prisma.task.create({
    data: {
      applicationId,
      ...taskPostData,
    },
  });

  res
    .status(HttpStatus.CREATED)
    .json(createJsonResponse(convertTaskToPayload(newTask), messages[MessageType.TASK_CREATED_SUCCESSFULLY]));
}

function validatePostRequest(req: NextApiRequest): Nullable<MessageType> {
  if (req.body.title === undefined) {
    return MessageType.MISSING_TITLE;
  }

  if (req.body.title === null || typeof req.body.title !== 'string') {
    return MessageType.INVALID_TITLE;
  }

  if (isEmpty(req.body.title)) {
    return MessageType.EMPTY_TITLE;
  }

  if (req.body.dueDate === undefined) {
    return MessageType.MISSING_DUE_DATE;
  }

  if (req.body.dueDate === null || typeof req.body.dueDate !== 'string' || !isValidDate(req.body.dueDate)) {
    return MessageType.INVALID_DUE_DATE;
  }

  if (req.body.notificationDateTime != null && !isValidDate(req.body.notificationDateTime)) {
    return MessageType.INVALID_NOTIFICATION_DATETIME;
  }

  return null;
}

export default withPrismaErrorHandling(withAuthUser(handler));
