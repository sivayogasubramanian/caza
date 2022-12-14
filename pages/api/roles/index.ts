import { PrismaClient, Role, RoleContribution, RoleType } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse, StatusMessageType } from '../../../types/apiResponse';
import { RoleData, RoleListData, RolePostData, RoleQueryParams } from '../../../types/role';
import { Nullable } from '../../../types/utils';
import { withAuthUser } from '../../../utils/auth/jwtHelpers';
import { MIN_YEAR } from '../../../utils/constants';
import {
  convertQueryParamToStringArray,
  createJsonResponse,
  HttpMethod,
  HttpStatus,
  rejectHttpMethod,
} from '../../../utils/http/httpHelpers';
import { withPrismaErrorHandling } from '../../../utils/prisma/prismaHelpers';
import { capitalizeEveryWord, splitByWhitespaces } from '../../../utils/strings/formatters';
import { isEmpty } from '../../../utils/strings/validations';
import { canBecomeInteger } from '../../../utils/numbers/validations';
import { makeRoleTitleFilters, makeRoleYearFilters } from '../../../utils/filters/filterHelpers';

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
  ROLE_ALREADY_EXISTS,
}

const messages = Object.freeze({
  [MessageType.MISSING_COMPANY_ID]: { type: StatusMessageType.ERROR, message: 'Company id is missing.' },
  [MessageType.INVALID_COMPANY_ID]: { type: StatusMessageType.ERROR, message: 'Company id must be a number.' },
  [MessageType.COMPANY_DOES_NOT_EXIST]: {
    type: StatusMessageType.ERROR,
    message: 'The company for this role does not exist.',
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
    message: `Role year must be after ${MIN_YEAR}.`,
  },
  [MessageType.ROLE_CREATED_SUCCESSFULLY]: {
    type: StatusMessageType.SUCCESS,
    message: 'Role was created successfully.',
  },
  [MessageType.ROLE_ALREADY_EXISTS]: {
    type: StatusMessageType.SUCCESS,
    message: 'Role already exists.',
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

async function handleGet(userId: string, req: NextApiRequest, res: NextApiResponse<ApiResponse<RoleListData[]>>) {
  const { companyId, searchWords } = parseGetQueryParams(req);
  if (companyId === undefined) {
    res.status(HttpStatus.OK).json(createJsonResponse([]));
    return;
  }

  const roleTitleFilters = makeRoleTitleFilters(searchWords);
  const roleYearFilters = makeRoleYearFilters(searchWords);

  const roles: RoleListData[] = await prisma.role.findMany({
    where: {
      companyId: companyId,
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
        { OR: roleYearFilters },
        { OR: roleTitleFilters },
      ],
    },
    take: 5,
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

async function handlePost(userId: string, req: NextApiRequest, res: NextApiResponse<ApiResponse<RoleData>>) {
  const errorMessageType = validatePostRequest(req);
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

  const duplicateRole = await findRole(rolePostData);

  const isNewRole = duplicateRole === null;
  if (isNewRole) {
    const createdRole = await createRole(userId, rolePostData);

    res
      .status(HttpStatus.CREATED)
      .json(createJsonResponse(createdRole, messages[MessageType.ROLE_CREATED_SUCCESSFULLY]));
    return;
  }

  const roleData: RoleData = {
    id: duplicateRole.id,
    title: duplicateRole.title,
    type: duplicateRole.type,
    year: duplicateRole.year,
    isVerified: duplicateRole.isVerified,
  };

  const isAlreadyContributedByUser = duplicateRole.contributions.some(
    (contribution) => contribution.contributorId === userId,
  );

  if (duplicateRole.isVerified || isAlreadyContributedByUser) {
    res.status(HttpStatus.OK).json(createJsonResponse(roleData, messages[MessageType.ROLE_ALREADY_EXISTS]));
    return;
  }

  await addRoleContribution(userId, duplicateRole.id);

  res.status(HttpStatus.CREATED).json(createJsonResponse(roleData, messages[MessageType.ROLE_CREATED_SUCCESSFULLY]));

  return;
}

async function findRole(role: Partial<Role>) {
  return await prisma.role.findFirst({
    where: role,
    select: {
      id: true,
      title: true,
      type: true,
      year: true,
      isVerified: true,
      contributions: {
        select: {
          contributorId: true,
        },
      },
    },
  });
}

async function createRole(userId: string, rolePostData: RolePostData): Promise<RoleData> {
  return prisma.role.create({
    data: {
      ...rolePostData,
      contributions: {
        create: {
          contributorId: userId,
        },
      },
    },
    select: { id: true, title: true, type: true, year: true, isVerified: true },
  });
}

async function addRoleContribution(userId: string, roleId: number): Promise<RoleContribution> {
  return prisma.roleContribution.create({
    data: {
      contributorId: userId,
      roleId,
    },
  });
}

function parseGetQueryParams(req: NextApiRequest): RoleQueryParams {
  const { companyId, searchWords } = req.query;
  const searchWordsArr = convertQueryParamToStringArray(searchWords, splitByWhitespaces);
  const parsedCompanyId = canBecomeInteger(companyId) ? Number(companyId) : undefined;
  return { companyId: parsedCompanyId, searchWords: searchWordsArr };
}

function validatePostRequest(req: NextApiRequest): Nullable<MessageType> {
  if (req.body.companyId === undefined) {
    return MessageType.MISSING_COMPANY_ID;
  }

  if (req.body.companyId === null || typeof req.body.companyId !== 'number') {
    return MessageType.INVALID_COMPANY_ID;
  }

  if (req.body.title === undefined) {
    return MessageType.MISSING_TITLE;
  }

  if (req.body.title === null || typeof req.body.title !== 'string') {
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

  if (req.body.year < MIN_YEAR) {
    return MessageType.ROLE_YEAR_TOO_SMALL;
  }

  return null;
}

export default withPrismaErrorHandling(withAuthUser(handler));
