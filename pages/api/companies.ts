import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { CompanyListData, CompanyPostData } from '../../types/company';
import { isEmpty, isValidUrl } from '../../utils/strings/validations';
import { ErrorData } from '../../types/error';
import { removeProtocolAndWwwIfPresent } from '../../utils/strings/formatters';
import { HttpMethod, HttpStatus, rejectHttpMethod } from '../../utils/http/httpHelpers';
import { withAuthUser } from '../../utils/auth/jwtHelpers';

enum MessageType {
  EMPTY_NAME,
  INVALID_COMPANY_URL,
}

const prisma = new PrismaClient();

const errorMessages = new Map<MessageType, ErrorData>([
  [MessageType.EMPTY_NAME, { message: 'Company name must not be empty.' }],
  [MessageType.INVALID_COMPANY_URL, { message: 'Company url is invalid.' }],
]);

function handler(_: string, req: NextApiRequest, res: NextApiResponse) {
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

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const companies: CompanyListData[] = await prisma.company.findMany({
    where: { isVerified: true },
    select: { id: true, name: true, companyUrl: true },
  });

  res.status(HttpStatus.OK).json(companies);
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const companyPostData: CompanyPostData = req.body;

  if (isEmpty(companyPostData.name)) {
    res.status(HttpStatus.BAD_REQUEST).json(errorMessages.get(MessageType.EMPTY_NAME));
    return;
  }

  if (!isValidUrl(companyPostData.companyUrl)) {
    res.status(HttpStatus.BAD_REQUEST).json(errorMessages.get(MessageType.INVALID_COMPANY_URL));
    return;
  }

  const newCompany = await prisma.company.create({
    data: {
      name: companyPostData.name,
      companyUrl: removeProtocolAndWwwIfPresent(companyPostData.companyUrl),
    },
  });

  res.status(HttpStatus.CREATED).json(newCompany);
}

export default withAuthUser(handler);
