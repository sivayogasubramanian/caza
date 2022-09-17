import { ApplicationStageType, RoleType } from '@prisma/client';
import { Button, Col, Form, Row, Space, Spin, Table } from 'antd';
import Search from 'antd/lib/input/Search';
import Title from 'antd/lib/typography/Title';
import { useRouter } from 'next/router';
import { ChangeEventHandler, useState } from 'react';
import useSWR from 'swr';
import api from '../api/api';
import { APPLICATIONS_API_ENDPOINT } from '../api/applicationsApi';
import ApplicationListCard from '../components/cards/ApplicationListCard';
import ApplicationStagesSelect from '../components/forms/ApplicationStagesSelect';
import RoleTypesSelect from '../components/forms/RoleTypesSelect';
import { ApiResponse } from '../types/apiResponse';
import { ApplicationListData, ApplicationQueryParams } from '../types/application';
import { splitByWhitespaces } from '../utils/strings/formatters';

function Applications() {
  const router = useRouter();

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

  const onClickAddApplication: React.MouseEventHandler<HTMLElement> = (e) => {
    e.preventDefault();
    router.push('/applications/create');
  };

  const { data } = useSWR<ApiResponse<ApplicationListData[]>>(
    [APPLICATIONS_API_ENDPOINT, searchParams],
    (url, searchParams) => api.get(url, { params: searchParams }),
  );

  const applications: ApplicationListData[] = Array.isArray(data?.payload)
    ? (data?.payload as ApplicationListData[])
    : [];

  return (
    <div className="p-5">
      <Title>My Applications</Title>

      {/* TODO: Move this to bottom navbar */}
      <Button type="primary" onClick={onClickAddApplication} className="mb-3">
        Add application
      </Button>

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

      {/* Application List */}
      <Spin spinning={!data}>
        {applications.map((application, index) => (
          <ApplicationListCard key={index} application={application} />
        ))}
      </Spin>
    </div>
  );
}

export default Applications;
