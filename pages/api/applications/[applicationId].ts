import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { withVerifiedUser } from '../../../utils/auth/jwtHelpers';

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
      res.setHeader('Allow', ['GET', 'DELETE']);
      res.status(405).end(`Method ${method} not allowed!`);
  }
}

// TODO: Handle not found
// TODO: Make sure the shape is same as discussed

async function handleGet(userId: string, req: NextApiRequest, res: NextApiResponse) {
  const applicationId = Number(req.query.applicationId);

  const userApplications = await prisma.application.findFirst({
    where: {
      id: applicationId,
      userId,
    },
    include: {
      role: {
        include: {
          company: true,
        },
      },
      applicationStages: true,
      tasks: true,
    },
  });

  res.status(200).json(userApplications);
}

// TODO: Check if application belongs to user
// TODO: Handle not found

async function handleDelete(userId: string, req: NextApiRequest, res: NextApiResponse) {
  const applicationId = Number(req.query.applicationId);

  await prisma.application.delete({ where: { id: applicationId } });

  res.status(204).end();
}

export default withVerifiedUser(handler);
