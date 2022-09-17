import { RoleApplicationListData } from './role';

export interface RoleWorldStatsQueryParam {
  roleId: number;
}

export type NodeId = string;

export type EdgeData = {
  source: NodeId;
  dest: NodeId;
  userCount: number;
  totalNumHours: number;
};

export type RoleWorldStatsData = {
  role: RoleApplicationListData;
  numberOfApplications: number;
  nodes: NodeId[];
  edges: EdgeData[];
};
