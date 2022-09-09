import { PrismaClient, RoleType } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse, EmptyPayload, StatusMessageType } from '../../../types/apiResponse';
import { RoleData, RoleListData, RolePostData } from '../../../types/role';
import { withAuth } from '../../../utils/auth/jwtHelpers';
import { createJsonResponse, HttpMethod, HttpStatus, rejectHttpMethod } from '../../../utils/http/httpHelpers';
import { withPrismaErrorHandling } from '../../../utils/prisma/prismaHelpers';
import { isEmpty } from '../../../utils/strings/validations';

const prisma = new PrismaClient();

enum MessageType {
  INVALID_COMPANY_ID,
  COMPANY_DOES_NOT_EXIST,
  EMPTY_TITLE,
  ROLE_TYPE_INVALID,
  ROLE_YEAR_NAN,
  ROLE_YEAR_INVALID,
  ROLE_CREATED_SUCCESSFULLY,
}

const messages = Object.freeze({
  [MessageType.INVALID_COMPANY_ID]: { type: StatusMessageType.ERROR, message: 'Company id must be a number' },
  [MessageType.COMPANY_DOES_NOT_EXIST]: {
    type: StatusMessageType.ERROR,
    message: 'The company for this role does not exists.',
  },
  [MessageType.EMPTY_TITLE]: { type: StatusMessageType.ERROR, message: 'Role title is empty.' },
  [MessageType.ROLE_TYPE_INVALID]: { type: StatusMessageType.ERROR, message: 'Role type is invalid.' },
  [MessageType.ROLE_YEAR_NAN]: { type: StatusMessageType.ERROR, message: 'Role year is not a number.' },
  [MessageType.ROLE_YEAR_INVALID]: { type: StatusMessageType.ERROR, message: 'Role year must be after 1970.' },
  [MessageType.ROLE_CREATED_SUCCESSFULLY]: {
    type: StatusMessageType.SUCCESS,
    message: 'Role was created successfully.',
  },
});

function handler(req: NextApiRequest, res: NextApiResponse) {
  const method = req.method;

  switch (method) {
    case HttpMethod.GET:
      handleGet(req, res);
      break;
    case HttpMethod.POST:
      handlePost(req, res);
      break;
    default:
      rejectHttpMethod(res, method);
  }
}

// TODO: Optional Search query. Will be done in another PR to unblock others.

async function handleGet(_: NextApiRequest, res: NextApiResponse<ApiResponse<RoleListData[]>>) {
  const roles: RoleListData[] = await prisma.role.findMany({
    where: {
      isVerified: true,
    },
    select: {
      id: true,
      title: true,
      type: true,
      year: true,
      isVerified: true,
      company: { select: { id: true, name: true, companyUrl: true } },
    },
  });

  res.status(HttpStatus.OK).json(createJsonResponse(roles));
}

async function handlePost(req: NextApiRequest, res: NextApiResponse<ApiResponse<RoleData>>) {
  if (!(await isValidRequest(req, res))) {
    return;
  }

  const rolePostData: RolePostData = req.body;

  const company = await prisma.company.findUnique({ where: { id: rolePostData.companyId } });

  if (!company) {
    res.status(HttpStatus.NOT_FOUND).json(createJsonResponse({}, messages[MessageType.COMPANY_DOES_NOT_EXIST]));
    return false;
  }

  const newRole: RoleData = await prisma.role.create({
    data: rolePostData,
    select: { id: true, title: true, type: true, year: true },
  });

  res.status(HttpStatus.CREATED).json(createJsonResponse(newRole, messages[MessageType.ROLE_CREATED_SUCCESSFULLY]));
}

async function isValidRequest(req: NextApiRequest, res: NextApiResponse<ApiResponse<EmptyPayload>>): Promise<boolean> {
  if (typeof req.body.companyId !== 'number') {
    res.status(HttpStatus.BAD_REQUEST).json(createJsonResponse({}, messages[MessageType.INVALID_COMPANY_ID]));
    return false;
  }

  if (isEmpty(req.body.title)) {
    res.status(HttpStatus.BAD_REQUEST).json(createJsonResponse({}, messages[MessageType.EMPTY_TITLE]));
    return false;
  }

  if (isEmpty(req.body.type) || !(req.body.type in RoleType)) {
    res.status(HttpStatus.BAD_REQUEST).json(createJsonResponse({}, messages[MessageType.ROLE_TYPE_INVALID]));
    return false;
  }

  if (typeof req.body.year !== 'number') {
    res.status(HttpStatus.BAD_REQUEST).json(createJsonResponse({}, messages[MessageType.ROLE_YEAR_NAN]));
    return false;
  }

  if (req.body.year < 1970) {
    res.status(HttpStatus.BAD_REQUEST).json(createJsonResponse({}, messages[MessageType.ROLE_YEAR_INVALID]));
    return false;
  }

  return true;
}

export default withPrismaErrorHandling(withAuth(handler));
