import { Spin } from 'antd';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useContext, useEffect } from 'react';
import useSWR from 'swr';
import AuthContext from '../../context/AuthContext';
import dynamic from 'next/dynamic';
import NotFound from '../../components/notFound/NotFound';
import worldApi from '../../frontendApis/worldApi';
import { WorldRoleStatsData } from '../../types/role';
import { ApiResponse } from '../../types/apiResponse';
const RoleSankey = dynamic(() => import('../../components/sankey/RoleSankey'), { ssr: false });

const RoleWorldPage: NextPage = () => {
  useEffect(() => {
    document.title = 'World View';
  }, []);

  const { currentUser } = useContext(AuthContext);
  const { query } = useRouter();
  if (!currentUser || currentUser.isAnonymous) {
    return (
      <div className="h-full">
        <NotFound message="The role page you are looking for cannot be found." />
      </div>
    );
  }

  const roleId = Number(query.roleId);
  const { data, error } = useSWR<ApiResponse<WorldRoleStatsData>>([roleId], (roleId) => worldApi.getRole(roleId));
  const isLoading = !data && !error;

  return (
    <Spin spinning={isLoading} wrapperClassName="h-full [&>div]:h-full">
      {!isLoading && <RoleSankey data={data?.payload} />}
    </Spin>
  );
};

export default RoleWorldPage;
