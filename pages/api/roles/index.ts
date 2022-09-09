import { PrismaClient, RoleType } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse, StatusMessageType } from '../../../types/apiResponse';
import { RoleData, RoleListData, RolePostData } from '../../../types/role';
import { Nullable } from '../../../types/utils';
import { withAuth } from '../../../utils/auth/jwtHelpers';
import { MIN_ROLE_YEAR } from '../../../utils/constants';
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
  [MessageType.ROLE_YEAR_INVALID]: {
    type: StatusMessageType.ERROR,
    message: `Role year must be after ${MIN_ROLE_YEAR}.`,
  },
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
  const errorMessageType = validateRequest(req);
  if (errorMessageType) {
    res.status(HttpStatus.BAD_REQUEST).json(createJsonResponse({}, messages[errorMessageType]));
    return;
  }

  const rolePostData: RolePostData = {
    companyId: req.body.companyId,
    title: req.body.title,
    type: req.body.type,
    year: req.body.year,
  };
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

function validateRequest(req: NextApiRequest): Nullable<MessageType> {
  if (typeof req.body.companyId !== 'number') {
    return MessageType.INVALID_COMPANY_ID;
  }

  if (isEmpty(req.body.title)) {
    return MessageType.EMPTY_TITLE;
  }

  if (isEmpty(req.body.type) || !(req.body.type in RoleType)) {
    return MessageType.ROLE_TYPE_INVALID;
  }

  if (typeof req.body.year !== 'number') {
    return MessageType.ROLE_YEAR_NAN;
  }

  if (req.body.year < MIN_ROLE_YEAR) {
    return MessageType.ROLE_YEAR_INVALID;
  }

  return null;
}

export default withPrismaErrorHandling(withAuth(handler));
