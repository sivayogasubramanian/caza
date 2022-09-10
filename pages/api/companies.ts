import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { CompanyData, CompanyListData, CompanyPostData } from '../../types/company';
import { isEmpty, isValidUrl } from '../../utils/strings/validations';
import { capitalizeEveryWord, removeProtocolAndWwwIfPresent } from '../../utils/strings/formatters';
import { createJsonResponse, HttpMethod, HttpStatus, rejectHttpMethod } from '../../utils/http/httpHelpers';
import { withAuth } from '../../utils/auth/jwtHelpers';
import { ApiResponse, StatusMessageType } from '../../types/apiResponse';
import { Nullable } from '../../types/utils';
import { withPrismaErrorHandling } from '../../utils/prisma/prismaHelpers';

enum MessageType {
  COMPANY_ALREADY_EXISTS,
  COMPANY_CREATED_SUCCESSFULLY,
  EMPTY_NAME,
  INVALID_COMPANY_URL,
  MISSING_NAME,
  MISSING_COMPANY_URL,
}

const prisma = new PrismaClient();

const messages = Object.freeze({
  [MessageType.COMPANY_ALREADY_EXISTS]: { type: StatusMessageType.SUCCESS, message: 'Company already exists.' },
  [MessageType.COMPANY_CREATED_SUCCESSFULLY]: {
    type: StatusMessageType.SUCCESS,
    message: 'Company created successfully.',
  },
  [MessageType.EMPTY_NAME]: { type: StatusMessageType.ERROR, message: 'Company name is empty.' },
  [MessageType.INVALID_COMPANY_URL]: { type: StatusMessageType.ERROR, message: 'Company url is invalid.' },
  [MessageType.MISSING_NAME]: { type: StatusMessageType.ERROR, message: 'Company name is missing.' },
  [MessageType.MISSING_COMPANY_URL]: { type: StatusMessageType.ERROR, message: 'Company url is missing.' },
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

async function handleGet(req: NextApiRequest, res: NextApiResponse<ApiResponse<CompanyListData[]>>) {
  const { name } = req.query;
  const trimmedNameKeyword = name && name.toString().trim();

  if (!trimmedNameKeyword) {
    res.status(HttpStatus.OK).json(createJsonResponse([]));
    return;
  }

  const companies: CompanyListData[] = await prisma.company.findMany({
    where: {
      isVerified: true,
      name: {
        contains: trimmedNameKeyword,
        mode: 'insensitive',
      },
    },
    orderBy: {
      name: 'asc',
    },
    select: { id: true, name: true, companyUrl: true },
  });

  res.status(HttpStatus.OK).json(createJsonResponse(companies));
}

async function handlePost(req: NextApiRequest, res: NextApiResponse<ApiResponse<CompanyData>>) {
  const errorMessageType = validateRequest(req);
  if (errorMessageType !== null) {
    res.status(HttpStatus.BAD_REQUEST).json(createJsonResponse({}, messages[errorMessageType]));
    return;
  }

  const companyPostData: CompanyPostData = {
    name: capitalizeEveryWord(req.body.name),
    companyUrl: removeProtocolAndWwwIfPresent(req.body.companyUrl),
  };

  const duplicateCompany = await prisma.company.findFirst({
    where: {
      name: companyPostData.name,
      companyUrl: companyPostData.companyUrl,
    },
    select: { id: true, name: true, companyUrl: true },
  });

  if (duplicateCompany) {
    res.status(HttpStatus.OK).json(createJsonResponse(duplicateCompany, messages[MessageType.COMPANY_ALREADY_EXISTS]));
    return;
  }

  const newCompany = await prisma.company.create({
    data: {
      name: companyPostData.name,
      companyUrl: companyPostData.companyUrl,
    },
    select: { id: true, name: true, companyUrl: true },
  });

  res
    .status(HttpStatus.CREATED)
    .json(createJsonResponse(newCompany, messages[MessageType.COMPANY_CREATED_SUCCESSFULLY]));
}

function validateRequest(req: NextApiRequest): Nullable<MessageType> {
  if (!req.body.name) {
    return MessageType.MISSING_NAME;
  }

  if (isEmpty(req.body.name)) {
    return MessageType.EMPTY_NAME;
  }

  if (!req.body.companyUrl) {
    return MessageType.MISSING_COMPANY_URL;
  }

  if (!isValidUrl(req.body.companyUrl)) {
    return MessageType.INVALID_COMPANY_URL;
  }

  return null;
}

export default withPrismaErrorHandling(withAuth(handler));
