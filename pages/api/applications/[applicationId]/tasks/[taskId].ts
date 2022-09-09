import { PrismaClient, Task } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse, EmptyPayload, StatusMessageType } from '../../../../../types/apiResponse';
import { TaskData, TaskPatchData } from '../../../../../types/task';
import { withAuthUser } from '../../../../../utils/auth/jwtHelpers';
import { isValidDate } from '../../../../../utils/date/validations';
import { createJsonResponse, HttpMethod, HttpStatus, rejectHttpMethod } from '../../../../../utils/http/httpHelpers';
import { withPrismaErrorHandling } from '../../../../../utils/prisma/prismaHelpers';

const prisma = new PrismaClient();

enum MessageType {
  INVALID_TASK_ID,
  TASK_NOT_FOUND,
  INVALID_APPLICATION_ID,
  TASK_DELETED,
  TASK_PATCHED,
  INVALID_TITLE,
  INVALID_DUE_DATE,
  INVALID_NOTIFICATION_DATETIME,
  INVALID_IS_DONE,
}

const messages = Object.freeze({
  [MessageType.INVALID_TASK_ID]: { type: StatusMessageType.ERROR, message: 'Task id is invalid.' },
  [MessageType.INVALID_APPLICATION_ID]: { type: StatusMessageType.ERROR, message: 'Application id is invalid.' },
  [MessageType.TASK_NOT_FOUND]: { type: StatusMessageType.ERROR, message: 'Task cannot be found.' },
  [MessageType.TASK_DELETED]: { type: StatusMessageType.SUCCESS, message: 'The task has been successfully deleted.' },
  [MessageType.TASK_PATCHED]: { type: StatusMessageType.SUCCESS, message: 'The task has been successfully patched.' },
  [MessageType.INVALID_TITLE]: { type: StatusMessageType.ERROR, message: 'The task title is invalid.' },
  [MessageType.INVALID_DUE_DATE]: { type: StatusMessageType.ERROR, message: 'The task due date is invalid.' },
  [MessageType.INVALID_NOTIFICATION_DATETIME]: {
    type: StatusMessageType.ERROR,
    message: 'The task notification date is invalid.',
  },
  [MessageType.INVALID_IS_DONE]: { type: StatusMessageType.ERROR, message: 'The task completion status is invalid.' },
});

async function handler(uid: string, req: NextApiRequest, res: NextApiResponse<ApiResponse<TaskData>>) {
  const { taskId, applicationId } = req.query as { taskId: string; applicationId: string };

  if (!Number.isInteger(Number(taskId))) {
    return res.status(HttpStatus.BAD_REQUEST).json(createJsonResponse({}, messages[MessageType.INVALID_TASK_ID]));
  }

  if (!Number.isInteger(Number(applicationId))) {
    return res
      .status(HttpStatus.BAD_REQUEST)
      .json(createJsonResponse({}, messages[MessageType.INVALID_APPLICATION_ID]));
  }

  const task = await prisma.task.findUnique({
    where: { id: Number(taskId) },
    include: { application: { select: { id: true, userId: true } } },
  });
  if (!task || task.application.id !== Number(applicationId) || task.application.userId !== uid) {
    return res.status(HttpStatus.NOT_FOUND).json(createJsonResponse({}, messages[MessageType.TASK_NOT_FOUND]));
  }

  switch (req.method) {
    case HttpMethod.PATCH:
      return patchHandler(task.id, req, res);
    case HttpMethod.DELETE:
      return deleteHandler(task.id, res);
    default:
      rejectHttpMethod(res, req.method);
  }
}

async function patchHandler(taskId: number, req: NextApiRequest, res: NextApiResponse<ApiResponse<TaskData>>) {
  const validationError = validateTaskPatchData(req);
  if (validationError !== null) {
    return res.status(HttpStatus.BAD_REQUEST).json(createJsonResponse({}, messages[validationError]));
  }

  const data: TaskPatchData = req.body;
  const updatedTask: Task = await prisma.task.update({ where: { id: taskId }, data });
  return res.status(HttpStatus.OK).json(createJsonResponse(updatedTask, messages[MessageType.TASK_PATCHED]));
}

async function deleteHandler(taskId: number, res: NextApiResponse<ApiResponse<EmptyPayload>>) {
  await prisma.task.delete({ where: { id: taskId } });
  return res.status(HttpStatus.OK).json(createJsonResponse({}, messages[MessageType.TASK_DELETED]));
}

function validateTaskPatchData(req: NextApiRequest): MessageType | null {
  const { title, dueDate, notificationDateTime, isDone } = req.body;

  const isValidTitle = title === undefined || (typeof title === 'string' && title?.trim().length !== 0);
  const isValidDueDate = dueDate === undefined || isValidDate('' + dueDate);
  const isValidNotificationDateTime =
    notificationDateTime === undefined || notificationDateTime === null || isValidDate('' + notificationDateTime);
  const isValidDoneParameter = isDone === undefined || typeof isDone === 'boolean';

  if (!isValidTitle) {
    return MessageType.INVALID_TITLE;
  }

  if (!isValidDueDate) {
    return MessageType.INVALID_DUE_DATE;
  }

  if (!isValidNotificationDateTime) {
    return MessageType.INVALID_NOTIFICATION_DATETIME;
  }

  if (!isValidDoneParameter) {
    return MessageType.INVALID_IS_DONE;
  }

  return null;
}

export default withPrismaErrorHandling(withAuthUser(handler));
