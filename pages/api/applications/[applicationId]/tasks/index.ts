import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse, EmptyPayload, StatusMessage, StatusMessageType } from '../../../../../types/apiResponse';
import { TaskData, TaskPostData } from '../../../../../types/task';
import { withVerifiedUser } from '../../../../../utils/auth/jwtHelpers';
import { isValidDate } from '../../../../../utils/date/validations';
import {
  createJsonResponse,
  HTTP_POST_METHOD,
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_CREATED,
  HTTP_STATUS_FORBIDDEN,
  HTTP_STATUS_NOT_FOUND,
  rejectHttpMethod,
} from '../../../../../utils/http/httpHelpers';
import { createIfPossible } from '../../../../../utils/prisma/prismaHelpers';
import { isEmpty } from '../../../../../utils/strings/validations';

const prisma = new PrismaClient();

enum MessageType {
  EMPTY_TITLE,
  INVALID_DUE_DATE,
  INVALID_NOTIFICATION_DATETIME,
  TASK_APPLICATION_NOT_FOUND,
  TASK_APPLICATION_DOES_NOT_BELONG_TO_USER,
  TASK_CREATED_SUCCESSFULLY,
}

const messages = new Map<MessageType, StatusMessage[]>([
  [MessageType.EMPTY_TITLE, [{ type: StatusMessageType.Error, message: 'Task title is empty.' }]],
  [MessageType.INVALID_DUE_DATE, [{ type: StatusMessageType.Error, message: 'Task due date is invalid.' }]],
  [
    MessageType.INVALID_NOTIFICATION_DATETIME,
    [{ type: StatusMessageType.Error, message: 'Task notification date and time is invalid.' }],
  ],
  [
    MessageType.TASK_APPLICATION_NOT_FOUND,
    [{ type: StatusMessageType.Error, message: 'Application for this task cannot be found.' }],
  ],
  [
    MessageType.TASK_APPLICATION_DOES_NOT_BELONG_TO_USER,
    [{ type: StatusMessageType.Error, message: 'Application for this task does not belong to you.' }],
  ],
  [MessageType.TASK_CREATED_SUCCESSFULLY, [{ type: StatusMessageType.Success, message: 'Task created succesfully.' }]],
]);

function handler(userId: string, req: NextApiRequest, res: NextApiResponse) {
  const method = req.method;

  switch (method) {
    case HTTP_POST_METHOD:
      handlePost(userId, req, res);
      break;
    default:
      rejectHttpMethod(res, method);
  }
}

async function handlePost(
  userId: string,
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<TaskData | EmptyPayload>>,
) {
  const applicationId = Number(req.query.applicationId);
  const application = await prisma.application.findFirst({ where: { id: applicationId } });

  if (!application) {
    res
      .status(HTTP_STATUS_NOT_FOUND)
      .json(createJsonResponse({}, messages.get(MessageType.TASK_APPLICATION_NOT_FOUND)));
    return;
  }

  if (application.userId !== userId) {
    res
      .status(HTTP_STATUS_FORBIDDEN)
      .json(createJsonResponse({}, messages.get(MessageType.TASK_APPLICATION_DOES_NOT_BELONG_TO_USER)));
    return;
  }

  if (!isValidRequest(req, res)) {
    return;
  }

  const taskPostData: TaskPostData = {
    ...req.body,
    dueDate: new Date(req.body.dueDate),
    notificationDateTime: req.body.notificationDateTime ? new Date(req.body.notificationDateTime) : null,
  };

  createIfPossible(res, async () => {
    const newTask = await prisma.task.create({
      data: {
        applicationId,
        ...taskPostData,
      },
      select: { id: true, title: true, dueDate: true, notificationDateTime: true, isDone: true },
    });

    res
      .status(HTTP_STATUS_CREATED)
      .json(createJsonResponse(newTask, messages.get(MessageType.TASK_CREATED_SUCCESSFULLY)));
  });
}

function isValidRequest(req: NextApiRequest, res: NextApiResponse<ApiResponse<EmptyPayload>>): boolean {
  if (isEmpty(req.body.title)) {
    res.status(HTTP_STATUS_BAD_REQUEST).json(createJsonResponse({}, messages.get(MessageType.EMPTY_TITLE)));
    return false;
  }

  if (!isValidDate(req.body.dueDate)) {
    res.status(HTTP_STATUS_BAD_REQUEST).json(createJsonResponse({}, messages.get(MessageType.INVALID_DUE_DATE)));
    return false;
  }

  if (
    (req.body.notification || req.body.notificationDateTime !== undefined) &&
    !isValidDate(req.body.notificationDateTime)
  ) {
    res
      .status(HTTP_STATUS_BAD_REQUEST)
      .json(createJsonResponse({}, messages.get(MessageType.INVALID_NOTIFICATION_DATETIME)));
    return false;
  }

  return true;
}

export default withVerifiedUser(handler);
