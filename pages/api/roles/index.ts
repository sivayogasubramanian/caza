import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { RolePostData } from '../../../types/role';
import { withAnyUser } from '../../../utils/auth/jwtHelpers';

const prisma = new PrismaClient();

function handler(_: string, req: NextApiRequest, res: NextApiResponse) {
  const method = req.method;

  switch (method) {
    case 'GET':
      handleGet(req, res);
      break;
    case 'POST':
      handlePost(req, res);
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} not allowed!`);
  }
}

// TODO: Optional Search query
// TODO: Make sure the shape is same as discussed

async function handleGet(_: NextApiRequest, res: NextApiResponse) {
  const roles = await prisma.role.findMany();

  res.status(200).json(roles);
}

// TODO: Make sure the shape is same as discussed

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const rolePostData: RolePostData = req.body;

  const newRole = await prisma.role.create({ data: rolePostData });

  res.status(201).json(newRole);
}

export default withAnyUser(handler);
