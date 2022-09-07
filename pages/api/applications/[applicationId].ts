import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { withVerifiedUser } from '../../../utils/auth/jwtHelpers';
import {
  HTTP_DELETE_METHOD,
  HTTP_GET_METHOD,
  HTTP_STATUS_NOT_FOUND,
  HTTP_STATUS_NO_CONTENT,
  HTTP_STATUS_OK,
  rejectHttpMethodsNotIn,
} from '../../../utils/http/httpHelper';

const prisma = new PrismaClient();

function handler(userId: string, req: NextApiRequest, res: NextApiResponse) {
  const method = req.method;

  switch (method) {
    case 'GET':
      handleGet(userId, req, res);
      break;
    case 'DELETE':
      handleDelete(userId, req, res);
      break;
    default:
      rejectHttpMethodsNotIn(res, HTTP_GET_METHOD, HTTP_DELETE_METHOD);
  }
}

// TODO: Return better error messages

async function handleGet(userId: string, req: NextApiRequest, res: NextApiResponse) {
  const applicationId = Number(req.query.applicationId);

  const userApplication = await prisma.application.findFirst({
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
        select: { id: true, dueDate: true, notificationDateTime: true, isDone: true },
      },
    },
  });

  if (!userApplication) {
    res.status(HTTP_STATUS_NOT_FOUND).end();
    return;
  }

  res.status(HTTP_STATUS_OK).json(userApplication);
}

// TODO: Return better error messages

async function handleDelete(userId: string, req: NextApiRequest, res: NextApiResponse) {
  const applicationId = Number(req.query.applicationId);

  const { count } = await prisma.application.deleteMany({ where: { id: applicationId, userId } });

  if (count === 0) {
    res.status(HTTP_STATUS_NOT_FOUND).end();
    return;
  }

  res.status(HTTP_STATUS_NO_CONTENT).end();
}

export default withVerifiedUser(handler);
