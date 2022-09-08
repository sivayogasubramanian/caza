import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { ApplicationData } from '../../../types/application';
import { withVerifiedUser } from '../../../utils/auth/jwtHelpers';
import {
  HTTP_DELETE_METHOD,
  HTTP_GET_METHOD,
  HTTP_STATUS_NOT_FOUND,
  HTTP_STATUS_NO_CONTENT,
  HTTP_STATUS_OK,
} from '../../../utils/http/httpHelper';
import { rejectHttpMethodsNotIn } from '../../../utils/http/rejectHttpMethodsNotIn';

const prisma = new PrismaClient();

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
      rejectHttpMethodsNotIn(res, HTTP_GET_METHOD, HTTP_DELETE_METHOD);
  }
}

// TODO: Return better error messages

async function handleGet(userId: string, req: NextApiRequest, res: NextApiResponse<ApplicationData>) {
  const applicationId = Number(req.query.applicationId);

  const application: ApplicationData | null = await prisma.application.findFirst({
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
        select: { id: true, title: true, dueDate: true, notificationDateTime: true, isDone: true },
      },
    },
  });

  if (!application) {
    res.status(HTTP_STATUS_NOT_FOUND).end();
    return;
  }

  res.status(HTTP_STATUS_OK).json(application);
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
