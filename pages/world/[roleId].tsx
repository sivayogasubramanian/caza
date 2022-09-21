import { Spin } from 'antd';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useContext } from 'react';
import useSWR from 'swr';
import { WORLD_API_ENDPOINT } from '../../api/worldApi';
import AuthContext from '../../context/AuthContext';
import { canBecomeInteger } from '../../utils/numbers/validations';
import dynamic from 'next/dynamic';
const RoleSankey = dynamic(() => import('../../components/sankey/RoleSankey'), { ssr: false });

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
  const { data } = useSWR(`${WORLD_API_ENDPOINT}/${roleId}`);
  return (
    <div>
      <Spin spinning={!data}>{data && <RoleSankey data={data.payload} />}</Spin>
    </div>
  );
};

export default RoleWorldPage;
