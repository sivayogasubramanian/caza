import { ApiPromise } from '../types/apiResponse';
import { RoleData, RoleListData, RolePostData, RoleQueryParams } from '../types/role';
import { toQueryString } from '../utils/url';
import api from './api';

export const ROLES_API_ENDPOINT = 'roles';

class RolesApi {
  public getRoles(rolesQueryParams: RoleQueryParams): ApiPromise<RoleListData[]> {
    const queryString = toQueryString(rolesQueryParams);

    return api.get(`${ROLES_API_ENDPOINT}?${queryString}`).then((res) => res.data);
  }

  public createRole(role: RolePostData): ApiPromise<RoleData> {
    return api.post(ROLES_API_ENDPOINT, role).then((res) => res.data);
  }
}

const rolesApi = new RolesApi();

export default rolesApi;
