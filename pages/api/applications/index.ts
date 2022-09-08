import type { NextApiRequest, NextApiResponse } from 'next';
import { ApplicationPostData } from '../../../types/applications';
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
    case HttpMethod.POST:
      handlePost(userId, req, res);
      break;
    default:
      rejectHttpMethod(res, method);
  }
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
