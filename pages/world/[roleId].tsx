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
import Head from 'next/head';
import { RoleApplicationListData } from '../../types/role';
const RoleSankey = dynamic(() => import('../../components/sankey/RoleSankey'), { ssr: false });

const RoleWorldPage: NextPage = () => {
  const { currentUser } = useContext(AuthContext);
  const { query } = useRouter();
  if (!currentUser || currentUser.isAnonymous || !canBecomeInteger(query.roleId)) {
    return <NotFound message="The role page you are looking for cannot be found." />;
  }

  const roleId = Number(query.roleId);
  const { data } = useSWR(`${WORLD_API_ENDPOINT}/${roleId}`);

  const role: RoleApplicationListData | undefined = data?.payload?.role;
  const title = !role ? 'Role data' : `${role.title} @ ${role.company.name}`;

  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <main>
        <Spin spinning={!data} wrapperClassName="h-full [&>div]:h-full">
          {data && <RoleSankey data={data.payload} />}
        </Spin>
      </main>
    </div>
  );
};

export default RoleWorldPage;
