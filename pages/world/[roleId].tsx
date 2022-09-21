import { Spin } from 'antd';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useContext } from 'react';
import useSWR from 'swr';
import AuthContext from '../../context/AuthContext';
import { canBecomeInteger } from '../../utils/numbers/validations';
import dynamic from 'next/dynamic';
import NotFound from '../../components/notFound/NotFound';
import { WORLD_API_ENDPOINT } from '../../frontendApis/worldApi';
const RoleSankey = dynamic(() => import('../../components/sankey/RoleSankey'), { ssr: false });

const RoleWorldPage: NextPage = () => {
  const { currentUser } = useContext(AuthContext);
  if (!currentUser || currentUser.isAnonymous) {
    return <NotFound message="The role page you are looking for cannot be found." />;
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
