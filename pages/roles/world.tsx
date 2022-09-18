import useSWR from 'swr';
import { WORLD_API_ENDPOINT } from '../../api/worldApi';
import WorldRoleListCard from '../../components/cards/WorldRoleListCard';
import { ApiResponse } from '../../types/apiResponse';
import { WorldRoleListData } from '../../types/role';

function WorldRoles() {
  const { data } = useSWR<ApiResponse<WorldRoleListData[]>>(WORLD_API_ENDPOINT);
  const roles = data?.payload ?? [];
  return (
    <div className="p-3">
      {roles.map((role, index) => (
        <WorldRoleListCard key={index} role={role} />
      ))}
    </div>
  );
}

export default WorldRoles;
