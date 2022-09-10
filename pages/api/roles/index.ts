import { PrismaClient, RoleType } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse, StatusMessageType } from '../../../types/apiResponse';
import { RoleData, RoleListData, RolePostData } from '../../../types/role';
import { Nullable } from '../../../types/utils';
import { withAuth } from '../../../utils/auth/jwtHelpers';
import { MIN_ROLE_YEAR } from '../../../utils/constants';
import { createJsonResponse, HttpMethod, HttpStatus, rejectHttpMethod } from '../../../utils/http/httpHelpers';
import { withPrismaErrorHandling } from '../../../utils/prisma/prismaHelpers';
import { capitalizeEveryWord } from '../../../utils/strings/formatters';
import { isEmpty } from '../../../utils/strings/validations';

const prisma = new PrismaClient();

enum MessageType {
  MISSING_COMPANY_ID,
  INVALID_COMPANY_ID,
  COMPANY_DOES_NOT_EXIST,
  MISSING_TITLE,
  INVALID_TITLE,
  EMPTY_TITLE,
  MISSING_ROLE_TYPE,
  ROLE_TYPE_INVALID,
  MISSING_ROLE_YEAR,
  ROLE_YEAR_INVALID,
  ROLE_YEAR_NAN,
  ROLE_YEAR_TOO_SMALL,
  ROLE_CREATED_SUCCESSFULLY,
}

const messages = Object.freeze({
  [MessageType.MISSING_COMPANY_ID]: { type: StatusMessageType.ERROR, message: 'Company id is missing.' },
  [MessageType.INVALID_COMPANY_ID]: { type: StatusMessageType.ERROR, message: 'Company id must be a number.' },
  [MessageType.COMPANY_DOES_NOT_EXIST]: {
    type: StatusMessageType.ERROR,
    message: 'The company for this role does not exists.',
  },
  [MessageType.MISSING_TITLE]: { type: StatusMessageType.ERROR, message: 'Role title is missing.' },
  [MessageType.INVALID_TITLE]: { type: StatusMessageType.ERROR, message: 'Role title is invalid.' },
  [MessageType.EMPTY_TITLE]: { type: StatusMessageType.ERROR, message: 'Role title is empty.' },
  [MessageType.MISSING_ROLE_TYPE]: { type: StatusMessageType.ERROR, message: 'Role type is missing.' },
  [MessageType.ROLE_TYPE_INVALID]: { type: StatusMessageType.ERROR, message: 'Role type is invalid.' },
  [MessageType.MISSING_ROLE_YEAR]: { type: StatusMessageType.ERROR, message: 'Role year is missing.' },
  [MessageType.ROLE_YEAR_INVALID]: { type: StatusMessageType.ERROR, message: 'Role year is invalid.' },
  [MessageType.ROLE_YEAR_NAN]: { type: StatusMessageType.ERROR, message: 'Role year is not a number.' },
  [MessageType.ROLE_YEAR_TOO_SMALL]: {
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

async function handleGet(req: NextApiRequest, res: NextApiResponse<ApiResponse<RoleListData[]>>) {
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
  if (errorMessageType !== null) {
    res.status(HttpStatus.BAD_REQUEST).json(createJsonResponse({}, messages[errorMessageType]));
    return;
  }

  const rolePostData: RolePostData = {
    companyId: req.body.companyId,
    title: capitalizeEveryWord(req.body.title),
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
  if (req.body.companyId === undefined) {
    return MessageType.MISSING_COMPANY_ID;
  }

  if (req.body.companyId === null || typeof req.body.companyId !== 'number') {
    return MessageType.INVALID_COMPANY_ID;
  }

  if (req.body.title === undefined) {
    return MessageType.MISSING_TITLE;
  }

  if (req.body.title === null || typeof req.body.companyId !== 'string') {
    return MessageType.INVALID_TITLE;
  }

  if (isEmpty(req.body.title)) {
    return MessageType.EMPTY_TITLE;
  }

  if (req.body.type === undefined) {
    return MessageType.MISSING_ROLE_TYPE;
  }

  if (
    req.body.type === null ||
    typeof req.body.type !== 'string' ||
    isEmpty(req.body.type) ||
    !(req.body.type in RoleType)
  ) {
    return MessageType.ROLE_TYPE_INVALID;
  }

  if (req.body.year === undefined) {
    return MessageType.MISSING_ROLE_YEAR;
  }

  if (req.body.year === null) {
    return MessageType.ROLE_YEAR_INVALID;
  }

  if (typeof req.body.year !== 'number') {
    return MessageType.ROLE_YEAR_NAN;
  }

  if (req.body.year < MIN_ROLE_YEAR) {
    return MessageType.ROLE_YEAR_TOO_SMALL;
  }

  return null;
}

export default withPrismaErrorHandling(withAuth(handler));
