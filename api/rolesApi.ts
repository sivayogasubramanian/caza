import { ApiPromise } from '../types/apiResponse';
import { RoleData, RolePostData } from '../types/role';
import api from './api';

class RolesApi {
  private getRolesUrl() {
    return 'roles';
  }

  public createRole(role: RolePostData): ApiPromise<RoleData> {
    return api.post(this.getRolesUrl(), role).then((res) => res.data);
  }
}

const rolesApi = new RolesApi();

export default rolesApi;
