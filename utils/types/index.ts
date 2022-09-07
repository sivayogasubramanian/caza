import { ApplicationStageType, RoleType } from '@prisma/client';

/** Custom type guard for RoleType enum. */
export function isRoleType(obj: any): obj is RoleType {
  if (typeof obj != 'string') return false;
  return Object.values(RoleType).find((v) => v.localeCompare(obj) === 0) != undefined;
}

/** Custom type guard for ApplicationStageType enum. */
export function isApplicationStageType(obj: any): obj is ApplicationStageType {
  if (typeof obj != 'string') return false;
  return Object.values(ApplicationStageType).find((v) => v.localeCompare(obj) === 0) != undefined;
}
