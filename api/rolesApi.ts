import { ApiPromise } from '../types/apiResponse';
import { RoleData, RoleListData, RolePostData } from '../types/role';
import api from './api';

export const ROLES_API_ENDPOINT = 'roles';

class RolesApi {
  public getRoles(): ApiPromise<RoleListData[]> {
    return api.get(ROLES_API_ENDPOINT).then((res) => res.data);
  }

  public createRole(role: RolePostData): ApiPromise<RoleData> {
    return api.post(ROLES_API_ENDPOINT, role).then((res) => res.data);
  }
}

const rolesApi = new RolesApi();

export default rolesApi;
