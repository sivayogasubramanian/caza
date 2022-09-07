import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { TaskPostData } from '../../../../../types/task';
import { withVerifiedUser } from '../../../../../utils/auth/jwtHelpers';

const prisma = new PrismaClient();

function handler(_: string, req: NextApiRequest, res: NextApiResponse) {
  const method = req.method;

  switch (method) {
    case 'POST':
      handlePost(req, res);
      break;
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} not allowed!`);
  }
}

// TODO: Check if application belongs to user
// TODO: Make sure the shape is same as discussed

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const applicationId = Number(req.query.applicationId);
  const taskPostData: TaskPostData = req.body;

  const newTask = await prisma.task.create({
    data: {
      applicationId,
      ...taskPostData,
      dueDate: new Date(taskPostData.dueDate),
      notificationDateTime: new Date(taskPostData.notificationDateTime),
    },
  });

  res.status(201).json(newTask);
}

export default withVerifiedUser(handler);
