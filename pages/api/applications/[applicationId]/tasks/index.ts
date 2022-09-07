import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { TaskPostData } from '../../../../../types/task';
import { withVerifiedUser } from '../../../../../utils/auth/jwtHelpers';
import {
  HTTP_DELETE_METHOD,
  HTTP_STATUS_CREATED,
  HTTP_STATUS_FORBIDDEN,
  HTTP_STATUS_NOT_FOUND,
} from '../../../../../utils/http/httpHelper';
import { createIfPossible } from '../../../../../utils/prisma/createIfPossible';
import { rejectHttpMethodsNotIn } from '../../../../../utils/prisma/rejectHttpMethodsNotIn';

const prisma = new PrismaClient();

function handler(userId: string, req: NextApiRequest, res: NextApiResponse) {
  const method = req.method;

  switch (method) {
    case 'POST':
      handlePost(userId, req, res);
      break;
    default:
      rejectHttpMethodsNotIn(res, HTTP_DELETE_METHOD);
  }
}

// TODO: Return better error messages

async function handlePost(userId: string, req: NextApiRequest, res: NextApiResponse) {
  const applicationId = Number(req.query.applicationId);
  const taskPostData: TaskPostData = req.body;

  const application = await prisma.application.findFirst({ where: { id: applicationId } });

  if (!application) {
    res.status(HTTP_STATUS_NOT_FOUND).end();
    return;
  }

  if (application.userId !== userId) {
    res.status(HTTP_STATUS_FORBIDDEN).end();
    return;
  }

  // TODO: Return better error messages

  createIfPossible(res, async () => {
    const newTask = await prisma.task.create({
      data: {
        applicationId,
        ...taskPostData,
        dueDate: new Date(taskPostData.dueDate),
        notificationDateTime: new Date(taskPostData.notificationDateTime),
      },
      select: { id: true, title: true, dueDate: true, notificationDateTime: true, isDone: true },
    });

    res.status(HTTP_STATUS_CREATED).json(newTask);
  });
}

export default withVerifiedUser(handler);
