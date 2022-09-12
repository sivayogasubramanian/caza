import { PrismaClient, Task } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { isDate } from 'util/types';
import { ApiResponse, EmptyPayload, StatusMessageType } from '../../../../../types/apiResponse';
import { TaskData, TaskPatchData, TaskQueryParams } from '../../../../../types/task';
import { Nullable } from '../../../../../types/utils';
import { withAuthUser } from '../../../../../utils/auth/jwtHelpers';
import { isValidDate } from '../../../../../utils/date/validations';
import { createJsonResponse, HttpMethod, HttpStatus, rejectHttpMethod } from '../../../../../utils/http/httpHelpers';
import { withPrismaErrorHandling } from '../../../../../utils/prisma/prismaHelpers';
import { isEmpty } from '../../../../../utils/strings/validations';

const prisma = new PrismaClient();

enum MessageType {
  INVALID_TASK_ID,
  TASK_NOT_FOUND,
  INVALID_APPLICATION_ID,
  TASK_DELETED_SUCCESSFULLY,
  TASK_UPDATED_SUCCESSFULLY,
  INVALID_TITLE,
  INVALID_DUE_DATE,
  INVALID_NOTIFICATION_DATETIME,
  INVALID_IS_DONE,
}

const messages = Object.freeze({
  [MessageType.INVALID_TASK_ID]: { type: StatusMessageType.ERROR, message: 'Task id is invalid.' },
  [MessageType.INVALID_APPLICATION_ID]: { type: StatusMessageType.ERROR, message: 'Application id is invalid.' },
  [MessageType.TASK_NOT_FOUND]: { type: StatusMessageType.ERROR, message: 'Task cannot be found.' },
  [MessageType.TASK_DELETED_SUCCESSFULLY]: {
    type: StatusMessageType.SUCCESS,
    message: 'The task has been successfully deleted.',
  },
  [MessageType.TASK_UPDATED_SUCCESSFULLY]: {
    type: StatusMessageType.SUCCESS,
    message: 'The task has been successfully updated.',
  },
  [MessageType.INVALID_TITLE]: { type: StatusMessageType.ERROR, message: 'The task title is invalid.' },
  [MessageType.INVALID_DUE_DATE]: { type: StatusMessageType.ERROR, message: 'The task due date is invalid.' },
  [MessageType.INVALID_NOTIFICATION_DATETIME]: {
    type: StatusMessageType.ERROR,
    message: 'The task notification date is invalid.',
  },
  [MessageType.INVALID_IS_DONE]: { type: StatusMessageType.ERROR, message: 'The task completion status is invalid.' },
});

async function handler(uid: string, req: NextApiRequest, res: NextApiResponse<ApiResponse<TaskData>>) {
  switch (req.method) {
    case HttpMethod.PATCH:
      return patchHandler(uid, req, res);
    case HttpMethod.DELETE:
      return deleteHandler(uid, req, res);
    default:
      rejectHttpMethod(res, req.method);
  }
}

async function patchHandler(uid: string, req: NextApiRequest, res: NextApiResponse<ApiResponse<TaskData>>) {
  const validationError = validatePathParameters(req) ?? validatePatchRequestBody(req);
  if (validationError !== null) {
    return res.status(HttpStatus.BAD_REQUEST).json(createJsonResponse({}, messages[validationError]));
  }

  const taskOrError = await getTask(uid, req);
  if (taskOrError === MessageType.TASK_NOT_FOUND) {
    return res.status(HttpStatus.NOT_FOUND).json(createJsonResponse({}, messages[taskOrError]));
  }
  const taskId = taskOrError.id;

  const { title, dueDate, notificationDateTime, isDone } = req.body;
  const data: TaskPatchData = {
    title,
    dueDate,
    isDone,
    notificationDateTime: notificationDateTime ? new Date(notificationDateTime) : notificationDateTime,
  };
  const updatedTask: Task = await prisma.task.update({ where: { id: taskId }, data });
  return res
    .status(HttpStatus.OK)
    .json(createJsonResponse(updatedTask, messages[MessageType.TASK_UPDATED_SUCCESSFULLY]));
}

async function deleteHandler(uid: string, req: NextApiRequest, res: NextApiResponse<ApiResponse<EmptyPayload>>) {
  const validationError = validatePathParameters(req);
  if (validationError !== null) {
    return res.status(HttpStatus.BAD_REQUEST).json(createJsonResponse({}, messages[validationError]));
  }

  const taskOrError = await getTask(uid, req);
  if (taskOrError === MessageType.TASK_NOT_FOUND) {
    return res.status(HttpStatus.NOT_FOUND).json(createJsonResponse({}, messages[taskOrError]));
  }
  const taskId = taskOrError.id;

  await prisma.task.delete({ where: { id: taskId } });
  return res.status(HttpStatus.OK).json(createJsonResponse({}, messages[MessageType.TASK_DELETED_SUCCESSFULLY]));
}

function validatePathParameters(req: NextApiRequest): Nullable<MessageType> {
  const { taskId, applicationId } = req.query;
  if (!taskId && !Number.isInteger(Number(taskId))) {
    return MessageType.INVALID_TASK_ID;
  }

  if (!Number.isInteger(Number(applicationId))) {
    return MessageType.INVALID_APPLICATION_ID;
  }

  return null;
}

function validatePatchRequestBody(req: NextApiRequest): Nullable<MessageType> {
  const { title, dueDate, notificationDateTime, isDone } = req.body;

  const isValidTitle = title === undefined || (typeof title === 'string' && !isEmpty(title));
  if (!isValidTitle) {
    return MessageType.INVALID_TITLE;
  }

  const isValidDueDate =
    dueDate === undefined || isDate(dueDate) || (typeof dueDate === 'string' && isValidDate(dueDate));
  if (!isValidDueDate) {
    return MessageType.INVALID_DUE_DATE;
  }

  const isValidNotificationDateTime =
    notificationDateTime === undefined ||
    notificationDateTime === null ||
    isDate(notificationDateTime) ||
    (typeof notificationDateTime === 'string' && isValidDate('' + notificationDateTime));
  if (!isValidNotificationDateTime) {
    return MessageType.INVALID_NOTIFICATION_DATETIME;
  }

  const isValidDoneParameter = isDone === undefined || typeof isDone === 'boolean';
  if (!isValidDoneParameter) {
    return MessageType.INVALID_IS_DONE;
  }

  return null;
}

async function getTask(uid: string, req: NextApiRequest) {
  const { applicationId, taskId } = req.query as unknown as TaskQueryParams;
  const task = await prisma.task.findFirst({
    where: { id: Number(taskId) },
    include: { application: { select: { id: true, userId: true } } },
  });

  if (!task || task.application.id !== Number(applicationId) || task.application.userId !== uid) {
    return MessageType.TASK_NOT_FOUND;
  }

  return task;
}

export default withPrismaErrorHandling(withAuthUser(handler));
