import { ApiPromise } from '../types/apiResponse';
import { WorldRoleListData, WorldRoleQueryParams } from '../types/role';
import { WorldRoleStatsData } from '../types/role';
import api from './api';

export const WORLD_API_ENDPOINT = 'roles/world';

class WorldApi {
  public getWorldRoles(worldRolesQueryParams: WorldRoleQueryParams): ApiPromise<WorldRoleListData[]> {
    return api.get(WORLD_API_ENDPOINT, { params: worldRolesQueryParams });
  }

  public getRole(roleId: number): ApiPromise<WorldRoleStatsData> {
    return api.get(`${WORLD_API_ENDPOINT}/${roleId}`);
  }
}

const worldApi = new WorldApi();

export default worldApi;
