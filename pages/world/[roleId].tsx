import { Spin } from 'antd';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useContext } from 'react';
import useSWR from 'swr';
import { ROLES_API_ENDPOINT } from '../../api/rolesApi';
import { WORLD_API_ENDPOINT } from '../../api/worldApi';
import RoleSankey from '../../components/sankey/RoleSankey';
import AuthContext from '../../context/AuthContext';
import { canBecomeInteger } from '../../utils/numbers/validations';

const RoleWorldPage: NextPage = () => {
  const { currentUser } = useContext(AuthContext);
  if (!currentUser || currentUser.isAnonymous) {
    // TODO: Make a consistent component (shared between world/index.tsx and world/[roleId].tsx)
    return <div>Insert Log In or Go Back component here.</div>;
  }

  const { query } = useRouter();
  if (!canBecomeInteger(query.roleId)) {
    return <p>Bad role id.</p>;
  }

  const roleId = Number(query.roleId);
  const { data } = useSWR(`${ROLES_API_ENDPOINT}/${WORLD_API_ENDPOINT}/${roleId}`);
  return (
    <div>
      <Spin spinning={!data}>
        <RoleSankey data={data?.payload} />
      </Spin>
    </div>
  );
};

export default RoleWorldPage;
