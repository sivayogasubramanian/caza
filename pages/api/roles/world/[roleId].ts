import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse, StatusMessageType } from '../../../../types/apiResponse';
import { withVerified } from '../../../../utils/auth/jwtHelpers';
import { createJsonResponse, HttpMethod, HttpStatus, rejectHttpMethod } from '../../../../utils/http/httpHelpers';
import { canBecomeInteger } from '../../../../utils/numbers/validations';
import { withPrismaErrorHandling } from '../../../../utils/prisma/prismaHelpers';
import { Nullable } from '../../../../types/utils';
import { ApplicationStageType, PrismaClient } from '@prisma/client';
import { EdgeData, NodeId, RoleWorldStatsData } from '../../../../types/world';
import { RoleApplicationListData } from '../../../../types/role';

const prisma = new PrismaClient();

enum MessageType {
  INVALID_ROLE_ID,
  ROLE_NOT_FOUND,
  ROLE_NOT_VERIFIED,
  SUCCESS,
}

const Messages = Object.freeze({
  [MessageType.INVALID_ROLE_ID]: { type: StatusMessageType.ERROR, message: 'Role id is invalid.' },
  [MessageType.ROLE_NOT_FOUND]: { type: StatusMessageType.ERROR, message: 'Role could not be found.' },
  [MessageType.ROLE_NOT_VERIFIED]: { type: StatusMessageType.ERROR, message: 'Role is not verified.' },
  [MessageType.SUCCESS]: { type: StatusMessageType.SUCCESS, message: 'Role data found and returned.' },
});

async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<RoleWorldStatsData>>) {
  switch (req.method) {
    case HttpMethod.GET:
      return handleGet(req, res);
    default:
      rejectHttpMethod(res, req.method);
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse<ApiResponse<RoleWorldStatsData>>) {
  const validationError = await validateGetRequest(req);
  if (validationError !== null) {
    return res.status(HttpStatus.BAD_REQUEST).json(createJsonResponse({}, Messages[validationError]));
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

  return res
    .status(HttpStatus.OK)
    .json(createJsonResponse({ role, nodes, edges, numberOfApplications }, Messages[MessageType.SUCCESS]));
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
  nodes: NodeId[];
  edges: EdgeData[];
} {
  if (data.length === 0) {
    return { nodes: [], edges: [], numberOfApplications: 0 };
  }

  const result: Map<NodeId, Map<NodeId, { userCount: number; totalNumHours: number }>> = new Map();

  let previousApplicationId = -1; // invalid number to ensure fresh start.
  let lastNodeId: NodeId = '';
  let prevDate: Date = new Date();
  for (const row of data) {
    const { applicationId, date, type } = row;

    if (applicationId !== previousApplicationId) {
      previousApplicationId = applicationId;
      prevDate = date;
      lastNodeId = type;
      continue;
    }

    const numberOfHours = (date.getTime() - prevDate.getTime()) / (1000 * 60 * 60);
    const currNodeId = getNodeId(type, lastNodeId);

    const destEdgeMap = result.get(lastNodeId) ?? new Map<NodeId, { userCount: number; totalNumHours: number }>();
    const edge = destEdgeMap.get(currNodeId) ?? { userCount: 0, totalNumHours: 0 };

    edge.totalNumHours += numberOfHours;
    edge.userCount++;

    destEdgeMap.set(currNodeId, edge);
    result.set(lastNodeId, destEdgeMap);
    prevDate = date;
    lastNodeId = currNodeId;
  }

  let edges: EdgeData[] = [];
  const nodes = new Set<NodeId>();

  result.forEach((destEdgeMap, source) => {
    if (!destEdgeMap) return;
    nodes.add(source);

    destEdgeMap.forEach((edge, dest) => {
      if (!edge) return;
      nodes.add(dest);

      edges = edges.concat({ source, dest, ...edge });
    });
  });

  return { nodes: Array.from(nodes), edges: edges, numberOfApplications: 0 };
}

function getNodeId(type: ApplicationStageType, lastNodeId: string): string {
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
      return `${type}:${lastNodeId}`;
  }
}

export default withPrismaErrorHandling(withVerified(handler));
