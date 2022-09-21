import { ApplicationStageType, RoleType } from '@prisma/client';
import { Col, Form, Row, Spin } from 'antd';
import Search from 'antd/lib/input/Search';
import Title from 'antd/lib/typography/Title';
import { ChangeEventHandler, useContext, useEffect, useState } from 'react';
import useSWR from 'swr';
import CreateApplicationButton from '../components/buttons/CreateApplicationButton';
import GoToWorldViewButton from '../components/buttons/GoToWorldViewButton';
import ApplicationListCard from '../components/cards/ApplicationListCard';
import ApplicationStagesSelect from '../components/forms/ApplicationStagesSelect';
import RoleTypesSelect from '../components/forms/RoleTypesSelect';
import AuthContext from '../context/AuthContext';
import api from '../frontendApis/api';
import { APPLICATIONS_API_ENDPOINT } from '../frontendApis/applicationsApi';
import { ApiResponse } from '../types/apiResponse';
import { ApplicationListData, ApplicationQueryParams } from '../types/application';
import { splitByWhitespaces } from '../utils/strings/formatters';

function Applications() {
  const { currentUser } = useContext(AuthContext);

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

  const { data: applicationListData, mutate: mutateApplicationListData } = useSWR<ApiResponse<ApplicationListData[]>>(
    [APPLICATIONS_API_ENDPOINT, searchParams],
    (url, searchParams) => api.get(url, { params: searchParams }),
  );

  const applications: ApplicationListData[] = Array.isArray(applicationListData?.payload)
    ? (applicationListData?.payload as ApplicationListData[])
    : [];

  useEffect(() => {
    mutateApplicationListData();
  }, [currentUser]);

  return (
    <div className="p-5">
      <div className="flex items-center justify-between">
        <Title>Applications</Title>

        <div className="hidden md:flex mb-[0.5em] gap-3">
          <CreateApplicationButton />
          <GoToWorldViewButton />
        </div>
      </div>

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
      <Spin spinning={!applicationListData}>
        {applications.map((application, index) => (
          <ApplicationListCard key={index} application={application} />
        ))}
      </Spin>
    </div>
  );
}

export default Applications;
