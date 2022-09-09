import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse, EmptyPayload, StatusMessageType } from '../../../../../types/apiResponse';
import { TaskData, TaskPostData } from '../../../../../types/task';
import { withVerifiedUser } from '../../../../../utils/auth/jwtHelpers';
import { isValidDate } from '../../../../../utils/date/validations';
import { createJsonResponse, HttpMethod, HttpStatus, rejectHttpMethod } from '../../../../../utils/http/httpHelpers';
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

    res.status(HttpStatus.CREATED).json(createJsonResponse(newTask, messages[MessageType.TASK_CREATED_SUCCESSFULLY]));
  });
}

function isValidRequest(req: NextApiRequest, res: NextApiResponse<ApiResponse<EmptyPayload>>): boolean {
  if (isEmpty(req.body.title)) {
    res.status(HttpStatus.BAD_REQUEST).json(createJsonResponse({}, messages[MessageType.EMPTY_TITLE]));
    return false;
  }

  if (!isValidDate(req.body.dueDate)) {
    res.status(HttpStatus.BAD_REQUEST).json(createJsonResponse({}, messages[MessageType.INVALID_DUE_DATE]));
    return false;
  }

  if (
    (req.body.notification || req.body.notificationDateTime !== undefined) &&
    !isValidDate(req.body.notificationDateTime)
  ) {
    res
      .status(HttpStatus.BAD_REQUEST)
      .json(createJsonResponse({}, messages[MessageType.INVALID_NOTIFICATION_DATETIME]));
    return false;
  }

  return true;
}

export default withVerifiedUser(handler);
