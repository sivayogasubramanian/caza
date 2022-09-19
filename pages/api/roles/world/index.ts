import { PrismaClient, Prisma, RoleType } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../../types/apiResponse';
import { WorldRoleListData, WorldRoleQueryParams } from '../../../../types/role';
import { getNonEmptyArrayOrUndefined, combineDefinedArrays, buildFrequencyMap } from '../../../../utils/arrays';
import { withVerifiedUser } from '../../../../utils/auth/jwtHelpers';
import {
  makeCompanyNameFilters,
  makeRoleTitleFilters,
  makeRoleYearFilters,
  makeRoleTypeFilters,
} from '../../../../utils/filters/filterHelpers';
import {
  convertQueryParamToStringArray,
  createJsonResponse,
  HttpMethod,
  HttpStatus,
  rejectHttpMethod,
} from '../../../../utils/http/httpHelpers';
import { withPrismaErrorHandling } from '../../../../utils/prisma/prismaHelpers';
import { splitByWhitespaces, splitByCommaRemovingWhitespacesAround } from '../../../../utils/strings/formatters';

const prisma = new PrismaClient();

async function handler(userId: string, req: NextApiRequest, res: NextApiResponse) {
  const method = req.method;
  switch (method) {
    case HttpMethod.GET:
      return handleGet(userId, req, res);
    default:
      return rejectHttpMethod(res, method);
  }
}

async function handleGet(userId: string, req: NextApiRequest, res: NextApiResponse<ApiResponse<WorldRoleListData[]>>) {
  const { searchWords, roleTypeWords, shouldFilterForCurrentUserApplications } = parseGetQueryParams(req);
  const companyNameFilters = makeCompanyNameFilters(searchWords);
  const roleTitleFilters = makeRoleTitleFilters(searchWords);
  const roleYearFilters = makeRoleYearFilters(searchWords);
  const roleTypeFilters = makeRoleTypeFilters(roleTypeWords);
  const companyOrFilters = companyNameFilters?.map((filter) => ({ company: filter }));
  const roleTitleOrCompanyFilters = getNonEmptyArrayOrUndefined<Prisma.RoleWhereInput>(
    combineDefinedArrays<Prisma.RoleWhereInput>([roleTitleFilters, companyOrFilters]),
  );

  const roles = await prisma.role.findMany({
    where: {
      AND: [{ OR: roleTypeFilters }, { OR: roleTitleOrCompanyFilters }, { OR: roleYearFilters }],
      isVerified: true,
      applications: shouldFilterForCurrentUserApplications ? { some: { userId } } : undefined,
    },
    select: {
      id: true,
      title: true,
      type: true,
      year: true,
      isVerified: true,
      company: {
        select: {
          id: true,
          name: true,
          companyUrl: true,
        },
      },
      applications: {
        select: {
          applicationStages: {
            select: {
              type: true,
            },
            take: 1,
            orderBy: {
              date: 'desc',
            },
          },
        },
      },
    },
  });

  const rolesWithStageCounts: WorldRoleListData[] = roles.map(
    ({ id, title, type, year, isVerified, company, applications }) => {
      const latestStages = applications.flatMap((application) =>
        application.applicationStages.flatMap((stage) => stage.type),
      );
      const stageCountMap = buildFrequencyMap(latestStages);
      const applicationStages = Array.from(stageCountMap.entries()).map(([type, count]) => ({ type, count }));

      return { id, title, type, year, isVerified, company, applicationStages };
    },
  );

  res.status(HttpStatus.OK).json(createJsonResponse(rolesWithStageCounts));
}

function parseGetQueryParams(req: NextApiRequest): WorldRoleQueryParams {
  const { searchWords, roleTypeWords, shouldFilterForCurrentUserApplications } = req.query;

  const searchWordsArr = convertQueryParamToStringArray(searchWords, splitByWhitespaces);
  const roleTypeUncheckedWords = convertQueryParamToStringArray(roleTypeWords, splitByCommaRemovingWhitespacesAround);

  // Safe to typecast due to the filter check.
  const roleTypeWordsArr: RoleType[] = roleTypeUncheckedWords.filter((word) => word in RoleType) as RoleType[];

  return {
    searchWords: searchWordsArr,
    roleTypeWords: roleTypeWordsArr,
    shouldFilterForCurrentUserApplications: shouldFilterForCurrentUserApplications === 'true',
  };
}

export default withPrismaErrorHandling(withVerifiedUser(handler));
