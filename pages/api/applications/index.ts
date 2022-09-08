import type { NextApiRequest, NextApiResponse } from 'next';
import { ApplicationListData, ApplicationPostData } from '../../../types/application';
import { PrismaClient } from '@prisma/client';
import { ErrorData } from '../../../types/error';
import { HttpMethod, HttpStatus, rejectHttpMethod } from '../../../utils/http/httpHelpers';
import { withAuthUser } from '../../../utils/auth/jwtHelpers';

enum ErrorType {
  DUPLICATE_APPLICATION,
}

const prisma = new PrismaClient();

const errorMessages = new Map<ErrorType, ErrorData>([
  [ErrorType.DUPLICATE_APPLICATION, { message: 'Multiple applications with the same role and user are not allowed.' }],
]);

function handler(userId: string, req: NextApiRequest, res: NextApiResponse) {
  const method = req.method;
  switch (method) {
    case HttpMethod.GET:
      handleGet(userId, req, res);
      break;
    case HttpMethod.POST:
      handlePost(userId, req, res);
      break;
    default:
      rejectHttpMethod(res, method);
  }
}

async function handleGet(userId: string, req: NextApiRequest, res: NextApiResponse) {
  const queriedApplications = await prisma.application.findMany({
    where: {
      userId: userId,
    },
    select: {
      id: true,
      role: {
        select: {
          id: true,
          title: true,
          type: true,
          year: true,
          company: {
            select: {
              id: true,
              name: true,
              companyUrl: true,
            },
          },
        },
      },
      applicationStages: {
        orderBy: {
          date: 'desc',
        },
        take: 1,
        select: {
          id: true,
          type: true,
          date: true,
          emojiUnicodeHex: true,
        },
      },
      _count: {
        select: {
          tasks: {
            where: {
              notificationDateTime: {
                lte: new Date(),
              },
              isDone: false,
            },
          },
        },
      },
    },
  });

  const applications: ApplicationListData[] = queriedApplications.map((application) => ({
    id: application.id,
    role: application.role,
    latestStage: application.applicationStages[0],
    taskNotificationCount: application._count.tasks,
  }));

  res.status(HttpStatus.OK).json(applications);
}

async function handlePost(userId: string, req: NextApiRequest, res: NextApiResponse) {
  const applicationPostData: ApplicationPostData = req.body;

  const duplicateCount = await prisma.application.count({
    where: {
      roleId: applicationPostData.roleId,
      userId: userId,
    },
  });

  if (duplicateCount > 0) {
    res.status(HttpStatus.BAD_REQUEST).json(errorMessages.get(ErrorType.DUPLICATE_APPLICATION));
    return;
  }

  const newApplication = await prisma.application.create({
    data: {
      roleId: applicationPostData.roleId,
      userId: userId,
    },
  });

  res.status(HttpStatus.CREATED).json(newApplication);
}

export default withAuthUser(handler);
