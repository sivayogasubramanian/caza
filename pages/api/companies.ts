import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import {
  HTTP_POST_METHOD,
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_CREATED,
  rejectHttpMethodsNotIn,
} from '../../utils/http/httpHelpers';
import { CompanyPostData } from '../../types/company';
import { isEmpty, isValidUrl } from '../../utils/strings/validations';
import { ErrorData } from '../../types/error';
import { withAnyUser } from '../../utils/auth/jwtHelpers';
import { removeProtocolAndWwwIfPresent } from '../../utils/strings/formatters';

enum ErrorType {
  EMPTY_NAME,
  INVALID_URL,
}

const prisma = new PrismaClient();

const errorMessages = new Map<ErrorType, ErrorData>([
  [ErrorType.EMPTY_NAME, { message: 'Company name must not be empty.' }],
  [ErrorType.INVALID_URL, { message: 'Company url is invalid.' }],
]);

function handler(userId: string, req: NextApiRequest, res: NextApiResponse) {
  const method = req.method;
  switch (method) {
    case HTTP_POST_METHOD:
      handlePost(userId, req, res);
      break;
    default:
      rejectHttpMethodsNotIn(res, HTTP_POST_METHOD);
  }
}

async function handlePost(userId: string, req: NextApiRequest, res: NextApiResponse) {
  const companyPostData: CompanyPostData = req.body;

  if (isEmpty(companyPostData.name)) {
    return res.status(HTTP_STATUS_BAD_REQUEST).json(errorMessages.get(ErrorType.EMPTY_NAME));
  }

  if (!isValidUrl(companyPostData.companyUrl)) {
    return res.status(HTTP_STATUS_BAD_REQUEST).json(errorMessages.get(ErrorType.INVALID_URL));
  }

  const newCompany = await prisma.company.create({
    data: {
      name: companyPostData.name,
      companyUrl: removeProtocolAndWwwIfPresent(companyPostData.companyUrl),
    },
  });

  res.status(HTTP_STATUS_CREATED).json(newCompany);
}

export default withAnyUser(handler);
