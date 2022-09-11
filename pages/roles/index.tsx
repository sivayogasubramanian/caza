import useSWR from 'swr';
import { Spin, Table, Typography } from 'antd';
import CreateRoleForm from '../../components/forms/CreateRoleForm';
import { ROLES_API_ENDPOINT } from '../../api/rolesApi';

const { Title } = Typography;

function Applications() {
  const { data } = useSWR(ROLES_API_ENDPOINT);

  return (
    <div className="p-8 flex flex-col">
      <Title>Verified Roles</Title>
      <Spin spinning={!data}>
        <Table
          dataSource={data?.payload ?? []}
          columns={[
            { title: 'ID', dataIndex: 'id' },
            { title: 'Title', dataIndex: 'title' },
            { title: 'Type', dataIndex: 'type' },
            { title: 'Year', dataIndex: 'year' },
          ]}
        />
      </Spin>
      <div className="lg:w-1/2 self-center">
        <CreateRoleForm />
      </div>
    </div>
  );
}

export default Applications;
