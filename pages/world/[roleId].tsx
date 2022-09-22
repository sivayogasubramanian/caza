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
  const { query } = useRouter();
  if (!currentUser || currentUser.isAnonymous || !canBecomeInteger(query.roleId)) {
    return <NotFound message="The role page you are looking for cannot be found." />;
  }

  const roleId = Number(query.roleId);
  const { data } = useSWR(`${WORLD_API_ENDPOINT}/${roleId}`);
  return (
    <Spin spinning={!data} wrapperClassName="h-full [&>div]:h-full">
      {data && <RoleSankey data={data.payload} />}
    </Spin>
  );
};

export default RoleWorldPage;
