import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { RoleData, RoleListData, RolePostData } from '../../../types/role';
import { withAnyUser } from '../../../utils/auth/jwtHelpers';
import {
  HTTP_GET_METHOD,
  HTTP_POST_METHOD,
  HTTP_STATUS_CREATED,
  HTTP_STATUS_OK,
  rejectHttpMethod,
} from '../../../utils/http/httpHelper';
import { createIfPossible } from '../../../utils/prisma/createIfPossible';

const prisma = new PrismaClient();

function handler(_: string, req: NextApiRequest, res: NextApiResponse) {
  const method = req.method;

  switch (method) {
    case HTTP_GET_METHOD:
      handleGet(req, res);
      break;
    case HTTP_POST_METHOD:
      handlePost(req, res);
      break;
    default:
      rejectHttpMethod(res, method);
  }
}

// TODO: Return better error messages
// TODO: Optional Search query

async function handleGet(_: NextApiRequest, res: NextApiResponse<RoleListData>) {
  const roles: RoleListData = await prisma.role.findMany({
    select: {
      id: true,
      title: true,
      type: true,
      year: true,
      isVerified: true,
      company: { select: { id: true, name: true, companyUrl: true } },
    },
  });

  res.status(HTTP_STATUS_OK).json(roles);
}

// TODO: Return better error messages

async function handlePost(req: NextApiRequest, res: NextApiResponse<RoleData>) {
  const rolePostData: RolePostData = req.body;

  createIfPossible(res, async () => {
    const newRole: RoleData = await prisma.role.create({
      data: rolePostData,
      select: { id: true, title: true, type: true, year: true },
    });

    res.status(HTTP_STATUS_CREATED).json(newRole);
  });
}

export default withAnyUser(handler);
