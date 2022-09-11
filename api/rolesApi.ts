import { ApiPromise } from '../types/apiResponse';
import { RoleData, RolePostData } from '../types/role';
import api from './api';

export const ROLES_URL = 'roles';

class RolesApi {
  public createRole(role: RolePostData): ApiPromise<RoleData> {
    return api.post(ROLES_URL, role).then((res) => res.data);
  }
}

const rolesApi = new RolesApi();

export default rolesApi;
