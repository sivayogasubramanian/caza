import { isEmpty } from '@firebase/util';
import { PrismaClient, RoleType } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse, EmptyPayload, StatusMessageType } from '../../../types/apiResponse';
import { RoleData, RoleListData, RolePostData } from '../../../types/role';
import { withAnyUser } from '../../../utils/auth/jwtHelpers';
import {
  createJsonResponse,
  HTTP_GET_METHOD,
  HTTP_POST_METHOD,
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_CREATED,
  HTTP_STATUS_OK,
  rejectHttpMethod,
} from '../../../utils/http/httpHelper';
import { createIfPossible } from '../../../utils/prisma/createIfPossible';

const prisma = new PrismaClient();

enum MessageType {
  INVALID_COMPANY_ID,
  COMPANY_DOES_NOT_EXISTS,
  EMPTY_TITLE,
  INVALID_TYPE,
  INVALID_YEAR,
}

const messages = new Map<MessageType, StatusMessage[]>([
  [
    MessageType.INVALID_COMPANY_ID,
    [{ type: StatusMessageType.Error, message: 'The company for this role is invalid.' }],
  ],
  [
    MessageType.COMPANY_DOES_NOT_EXISTS,
    [{ type: StatusMessageType.Error, message: 'The company for this role does not exists.' }],
  ],
  [MessageType.EMPTY_TITLE, [{ type: StatusMessageType.Error, message: 'Role title is empty.' }]],
  [MessageType.INVALID_TYPE, [{ type: StatusMessageType.Error, message: 'Role type is invalid.' }]],
  [MessageType.INVALID_YEAR, [{ type: StatusMessageType.Error, message: 'Role year is invalid.' }]],
]);

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

// TODO: Optional Search query. Will be done in another PR to unblock others.

async function handleGet(_: NextApiRequest, res: NextApiResponse<ApiResponse<RoleListData[]>>) {
  const roles: RoleListData[] = await prisma.role.findMany({
    select: {
      id: true,
      title: true,
      type: true,
      year: true,
      isVerified: true,
      company: { select: { id: true, name: true, companyUrl: true } },
    },
  });

  res.status(HTTP_STATUS_OK).json(createJsonResponse(roles));
}

async function handlePost(req: NextApiRequest, res: NextApiResponse<ApiResponse<RoleData | EmptyPayload>>) {
  validateRequest(req, res);

  const rolePostData: RolePostData = req.body;

  createIfPossible(res, async () => {
    const newRole: RoleData = await prisma.role.create({
      data: rolePostData,
      select: { id: true, title: true, type: true, year: true },
    });

    res.status(HTTP_STATUS_CREATED).json(createJsonResponse(newRole));
  });
}

async function validateRequest(req: NextApiRequest, res: NextApiResponse<ApiResponse<EmptyPayload>>) {
  if (typeof req.body.companyId !== 'number') {
    res.status(HTTP_STATUS_BAD_REQUEST).json(createJsonResponse({}, messages.get(MessageType.INVALID_COMPANY_ID)));
    return;
  }

  const company = await prisma.company.findFirst({ where: { id: req.body.companyId } });

  if (!company) {
    res.status(HTTP_STATUS_BAD_REQUEST).json(createJsonResponse({}, messages.get(MessageType.COMPANY_DOES_NOT_EXISTS)));
    return;
  }

  if (isEmpty(req.body.title)) {
    res.status(HTTP_STATUS_BAD_REQUEST).json(createJsonResponse({}, messages.get(MessageType.EMPTY_TITLE)));
    return;
  }

  if (isEmpty(req.body.type) || !Object.values(RoleType).includes(req.body.type)) {
    res.status(HTTP_STATUS_BAD_REQUEST).json(createJsonResponse({}, messages.get(MessageType.INVALID_TYPE)));
    return;
  }

  if (typeof req.body.year !== 'number') {
    res.status(HTTP_STATUS_BAD_REQUEST).json(createJsonResponse({}, messages.get(MessageType.INVALID_YEAR)));
    return;
  }
}

export default withAnyUser(handler);
