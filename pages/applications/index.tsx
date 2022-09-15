import { ApplicationStageType, RoleType } from '@prisma/client';
import { Col, Form, Row, Spin, Table } from 'antd';
import Search from 'antd/lib/input/Search';
import Title from 'antd/lib/typography/Title';
import { ChangeEventHandler, useState } from 'react';
import useSWR from 'swr';
import api from '../../api/api';
import { APPLICATIONS_API_ENDPOINT } from '../../api/applicationsApi';
import ApplicationStagesSelect from '../../components/forms/ApplicationStagesSelect';
import RoleTypesSelect from '../../components/forms/RoleTypesSelect';
import { ApiResponse } from '../../types/apiResponse';
import { ApplicationListData, ApplicationQueryParams } from '../../types/application';
import { splitByWhitespaces } from '../../utils/strings/formatters';

function Applications() {
  const [searchParams, setSearchParams] = useState<ApplicationQueryParams>({
    searchWords: [],
    roleTypeWords: [],
    stageTypeWords: [],
  });

  const onSearchBarChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setSearchParams({ ...searchParams, searchWords: splitByWhitespaces(e.target.value) });
  };

  const onRoleTypesFilterChange = (roleTypes: RoleType[]) => {
    setSearchParams({ ...searchParams, roleTypeWords: roleTypes });
  };

  const onApplicationStageTypesFilterChange = (stageTypes: ApplicationStageType[]) => {
    setSearchParams({ ...searchParams, stageTypeWords: stageTypes });
  };

  const { data } = useSWR<ApiResponse<ApplicationListData[]>>(
    [APPLICATIONS_API_ENDPOINT, searchParams],
    (url, searchParams) => api.get(url, { params: searchParams }),
  );

  const applications = Array.isArray(data?.payload) ? data?.payload : [];

  return (
    <div className="p-8">
      <Title>My Applications</Title>

      {/* Search and Filters */}
      <Form>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={18}>
            <Search placeholder="Search..." onChange={onSearchBarChange} />
          </Col>
          <Col xs={12} md={3}>
            <Form.Item>
              <RoleTypesSelect isMultiselect onChange={onRoleTypesFilterChange} />
            </Form.Item>
          </Col>
          <Col xs={12} md={3}>
            <Form.Item>
              <ApplicationStagesSelect isMultiselect onChange={onApplicationStageTypesFilterChange} />
            </Form.Item>
          </Col>
        </Row>
      </Form>

      <Spin spinning={!data}>
        {/* TODO: Replace Table with Application List Items */}
        <Table
          dataSource={applications}
          columns={[
            { title: 'ID', dataIndex: 'id' },
            { title: 'Role', render: (application) => JSON.stringify(application.role) },
            { title: 'Latest Stage', render: (application) => JSON.stringify(application.latestStage) },
            { title: 'Task Notification Count', dataIndex: 'taskNotificationCount' },
          ]}
        />
      </Spin>
    </div>
  );
}

export default Applications;
