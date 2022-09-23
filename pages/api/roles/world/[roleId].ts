import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../../types/apiResponse';
import { withVerified } from '../../../../utils/auth/jwtHelpers';
import { createJsonResponse, HttpMethod, HttpStatus, rejectHttpMethod } from '../../../../utils/http/httpHelpers';
import { canBecomeInteger } from '../../../../utils/numbers/validations';
import { withPrismaErrorHandling } from '../../../../utils/prisma/prismaHelpers';
import { Nullable } from '../../../../types/utils';
import { ApplicationStageType, PrismaClient } from '@prisma/client';
import { RoleSankeyEdgeData, RoleSankeyNodeId, WorldRoleStatsData } from '../../../../types/role';
import { RoleApplicationListData } from '../../../../types/role';

const prisma = new PrismaClient();

enum MessageType {
  INVALID_ROLE_ID,
  ROLE_NOT_FOUND,
  ROLE_NOT_VERIFIED,
  SUCCESS,
}

async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<WorldRoleStatsData>>) {
  switch (req.method) {
    case HttpMethod.GET:
      return handleGet(req, res);
    default:
      rejectHttpMethod(res, req.method);
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse<ApiResponse<WorldRoleStatsData>>) {
  const validationError = await validateGetRequest(req);
  if (validationError === MessageType.ROLE_NOT_VERIFIED) {
    return res.status(HttpStatus.TEAPOT).json(createJsonResponse({}));
  } else if (validationError !== null) {
    return res.status(HttpStatus.BAD_REQUEST).json(createJsonResponse({}));
  }

  const roleId = Number(req.query.roleId);
  const stages = await getApplicationStages(roleId);

  const { nodes, edges } = analyzeStages(stages);
  const role: RoleApplicationListData = await prisma.role.findUniqueOrThrow({
    where: { id: roleId },
    select: {
      id: true,
      title: true,
      type: true,
      year: true,
      isVerified: true,
      company: { select: { id: true, name: true, companyUrl: true } },
    },
  });
  const numberOfApplications = (
    await prisma.applicationStage.groupBy({
      by: ['applicationId'],
      where: { application: { roleId } },
      having: { applicationId: { _count: { gte: 1 } } },
    })
  ).length;

  return res.status(HttpStatus.OK).json(createJsonResponse({ role, nodes, edges, numberOfApplications }));
}

async function validateGetRequest(req: NextApiRequest): Promise<Nullable<MessageType>> {
  const { roleId } = req.query;
  if (!canBecomeInteger(roleId)) {
    return MessageType.INVALID_ROLE_ID;
  }

  const id = Number(roleId);
  const role = await prisma.role.findUnique({ where: { id } });

  if (!role) {
    return MessageType.ROLE_NOT_FOUND;
  } else if (!role.isVerified) {
    return MessageType.ROLE_NOT_VERIFIED;
  }

  return null;
}

async function getApplicationStages(roleId: number) {
  // TODO: Use cursor pagination to handle very large queries. (Not in scope)
  //
  // The current implementation does not scale. If the list returned exceeds the memory in the serverless function,
  // there will be an OOM crash. (Not a concern except with hundreds of thousands of applications for a single role).
  //
  // Note that offset pagination to the database does not benefit us as the database will be queried repeatedly:
  // https://www.prisma.io/docs/concepts/components/prisma-client/pagination#-cons-of-offset-pagination
  return prisma.applicationStage.findMany({
    where: { application: { roleId: roleId } },
    select: { applicationId: true, type: true, date: true },
    orderBy: [{ applicationId: 'desc' }, { date: 'asc' }],
  });
}

function analyzeStages(data: { applicationId: number; type: ApplicationStageType; date: Date }[]): {
  numberOfApplications: number;
  nodes: RoleSankeyNodeId[];
  edges: RoleSankeyEdgeData[];
} {
  if (data.length === 0) {
    return { nodes: [], edges: [], numberOfApplications: 0 };
  }

  const result: Map<RoleSankeyNodeId, Map<RoleSankeyNodeId, { userCount: number; totalNumHours: number }>> = new Map();

  let previousApplicationId = -1; // invalid number to ensure fresh start.
  let lastRoleSankeyNodeId: RoleSankeyNodeId = '';
  let prevDate: Date = new Date();
  for (const row of data) {
    const { applicationId, date, type } = row;

    if (applicationId !== previousApplicationId) {
      previousApplicationId = applicationId;
      prevDate = date;
      lastRoleSankeyNodeId = type;
      continue;
    }

    const numberOfHours = (date.getTime() - prevDate.getTime()) / (1000 * 60 * 60);
    const currRoleSankeyNodeId = getRoleSankeyNodeId(type, lastRoleSankeyNodeId);

    const destEdgeMap =
      result.get(lastRoleSankeyNodeId) ?? new Map<RoleSankeyNodeId, { userCount: number; totalNumHours: number }>();
    const edge = destEdgeMap.get(currRoleSankeyNodeId) ?? { userCount: 0, totalNumHours: 0 };

    edge.totalNumHours += numberOfHours;
    edge.userCount++;

    destEdgeMap.set(currRoleSankeyNodeId, edge);
    result.set(lastRoleSankeyNodeId, destEdgeMap);
    prevDate = date;
    lastRoleSankeyNodeId = currRoleSankeyNodeId;
  }

  let edges: RoleSankeyEdgeData[] = [];
  const nodes = new Set<RoleSankeyNodeId>();

  result.forEach((destEdgeMap, source) => {
    if (!destEdgeMap) return;
    nodes.add(source);

    destEdgeMap.forEach((edge, dest) => {
      if (!edge) return;
      nodes.add(dest);

      edges = edges.concat({ source, dest, ...edge });
    });
  });

  return { nodes: Array.from(nodes), edges, numberOfApplications: 0 };
}

function getRoleSankeyNodeId(type: ApplicationStageType, lastRoleSankeyNodeId: string): RoleSankeyNodeId {
  switch (type) {
    case ApplicationStageType.ACCEPTED:
    // fallthrough
    case ApplicationStageType.APPLIED:
    // fallthrough
    case ApplicationStageType.WITHDRAWN:
    // fallthrough
    case ApplicationStageType.REJECTED:
      return type;
    default:
      return `${type}:${lastRoleSankeyNodeId}`;
  }
}

export default withPrismaErrorHandling(withVerified(handler));
