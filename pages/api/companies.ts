import { CompanyContribution, PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse, StatusMessageType } from '../../types/apiResponse';
import { CompanyData, CompanyListData, CompanyPostData, CompanyQueryParams } from '../../types/company';
import { Nullable } from '../../types/utils';
import { withAuthUser } from '../../utils/auth/jwtHelpers';
import { makeCompanyNameFilters } from '../../utils/filters/filterHelpers';
import {
  convertQueryParamToStringArray,
  createJsonResponse,
  HttpMethod,
  HttpStatus,
  rejectHttpMethod,
} from '../../utils/http/httpHelpers';
import { withPrismaErrorHandling } from '../../utils/prisma/prismaHelpers';
import { capitalizeEveryWord, removeProtocolAndWwwIfPresent, splitByWhitespaces } from '../../utils/strings/formatters';
import { isEmpty, isValidUrl } from '../../utils/strings/validations';

enum MessageType {
  COMPANY_ALREADY_EXISTS,
  COMPANY_CREATED_SUCCESSFULLY,
  EMPTY_NAME,
  INVALID_COMPANY_URL,
  INVALID_NAME,
  MISSING_COMPANY_URL,
  MISSING_NAME,
}

const prisma = new PrismaClient();

const messages = Object.freeze({
  [MessageType.EMPTY_NAME]: { type: StatusMessageType.ERROR, message: 'Company name is empty.' },
  [MessageType.INVALID_COMPANY_URL]: { type: StatusMessageType.ERROR, message: 'Company url is invalid.' },
  [MessageType.INVALID_NAME]: { type: StatusMessageType.ERROR, message: 'Company name is invalid.' },
  [MessageType.MISSING_NAME]: { type: StatusMessageType.ERROR, message: 'Company name is missing.' },
  [MessageType.MISSING_COMPANY_URL]: { type: StatusMessageType.ERROR, message: 'Company url is missing.' },
  [MessageType.COMPANY_ALREADY_EXISTS]: { type: StatusMessageType.SUCCESS, message: 'Company already exists.' },
  [MessageType.COMPANY_CREATED_SUCCESSFULLY]: {
    type: StatusMessageType.SUCCESS,
    message: 'Company created successfully.',
  },
});

async function handler(userId: string, req: NextApiRequest, res: NextApiResponse) {
  const method = req.method;

  switch (method) {
    case HttpMethod.GET:
      return handleGet(userId, req, res);
    case HttpMethod.POST:
      return handlePost(userId, req, res);
    default:
      return rejectHttpMethod(res, method);
  }
}

async function handleGet(userId: string, req: NextApiRequest, res: NextApiResponse<ApiResponse<CompanyListData[]>>) {
  const { companyNames } = parseGetQueryParams(req);

  if (companyNames.length === 0) {
    res.status(HttpStatus.OK).json(createJsonResponse([]));
    return;
  }

  const companyNamesFilters = makeCompanyNameFilters(companyNames);

  const companies: CompanyListData[] = await prisma.company.findMany({
    where: {
      AND: [
        {
          OR: [
            { isVerified: true },
            {
              contributions: {
                some: { contributorId: userId },
              },
            },
          ],
        },
        { OR: companyNamesFilters },
      ],
    },
    take: 5,
    orderBy: {
      name: 'asc',
    },
    select: { id: true, name: true, companyUrl: true },
  });

  res.status(HttpStatus.OK).json(createJsonResponse(companies));
}

async function handlePost(userId: string, req: NextApiRequest, res: NextApiResponse<ApiResponse<CompanyData>>) {
  const errorMessageType = validatePostRequest(req);
  if (errorMessageType !== null) {
    res.status(HttpStatus.BAD_REQUEST).json(createJsonResponse({}, messages[errorMessageType]));
    return;
  }

  const companyPostData: CompanyPostData = {
    name: capitalizeEveryWord(req.body.name),
    companyUrl: removeProtocolAndWwwIfPresent(req.body.companyUrl),
  };

  const duplicateCompany = await findCompany(companyPostData.name, companyPostData.companyUrl);

  const isNewCompany = duplicateCompany === null;
  if (isNewCompany) {
    const createdCompany = await createCompany(userId, companyPostData);

    res
      .status(HttpStatus.CREATED)
      .json(createJsonResponse(createdCompany, messages[MessageType.COMPANY_CREATED_SUCCESSFULLY]));
    return;
  }

  const companyData: CompanyData = {
    id: duplicateCompany.id,
    name: duplicateCompany.name,
    companyUrl: duplicateCompany.companyUrl,
  };

  const isAlreadyContributedByUser = duplicateCompany.contributions.some(
    (contribution) => contribution.contributorId === userId,
  );

  if (duplicateCompany.isVerified || isAlreadyContributedByUser) {
    res.status(HttpStatus.OK).json(createJsonResponse(companyData, messages[MessageType.COMPANY_ALREADY_EXISTS]));
    return;
  }

  await addCompanyContribution(userId, duplicateCompany.id);

  res
    .status(HttpStatus.CREATED)
    .json(createJsonResponse(companyData, messages[MessageType.COMPANY_CREATED_SUCCESSFULLY]));
  return;
}

async function findCompany(name: string, companyUrl: string) {
  return await prisma.company.findFirst({
    where: {
      name: name,
      companyUrl: companyUrl,
    },
    select: {
      id: true,
      name: true,
      companyUrl: true,
      isVerified: true,
      contributions: {
        select: {
          contributorId: true,
        },
      },
    },
  });
}

async function createCompany(userId: string, companyPostData: CompanyPostData): Promise<CompanyData> {
  return prisma.company.create({
    data: {
      name: companyPostData.name,
      companyUrl: companyPostData.companyUrl,
      contributions: {
        create: {
          contributorId: userId,
        },
      },
    },
    select: { id: true, name: true, companyUrl: true },
  });
}

async function addCompanyContribution(userId: string, companyId: number): Promise<CompanyContribution> {
  return prisma.companyContribution.create({
    data: {
      contributorId: userId,
      companyId,
    },
  });
}

function parseGetQueryParams(req: NextApiRequest): CompanyQueryParams {
  return { companyNames: convertQueryParamToStringArray(req.query.companyNames, splitByWhitespaces) };
}

function validatePostRequest(req: NextApiRequest): Nullable<MessageType> {
  if (req.body.name === undefined) {
    return MessageType.MISSING_NAME;
  }

  if (req.body.name === null || typeof req.body.name !== 'string') {
    return MessageType.INVALID_NAME;
  }

  if (isEmpty(req.body.name)) {
    return MessageType.EMPTY_NAME;
  }

  if (req.body.companyUrl === undefined) {
    return MessageType.MISSING_COMPANY_URL;
  }

  if (req.body.companyUrl === null || typeof req.body.companyUrl !== 'string' || !isValidUrl(req.body.companyUrl)) {
    return MessageType.INVALID_COMPANY_URL;
  }

  return null;
}

export default withPrismaErrorHandling(withAuthUser(handler));
