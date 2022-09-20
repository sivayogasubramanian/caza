import { RoleType } from '@prisma/client';
import { Checkbox, Col, Form, Row } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import Search from 'antd/lib/input/Search';
import Title from 'antd/lib/typography/Title';
import { ChangeEventHandler, useContext, useState } from 'react';
import useSWR from 'swr';
import api from '../../api/api';
import { WORLD_API_ENDPOINT } from '../../api/worldApi';
import CreateApplicationButton from '../../components/buttons/CreateApplicationButton';
import GoToYourListViewButton from '../../components/buttons/GoToYourListViewButton';
import WorldRoleListCard from '../../components/cards/WorldRoleListCard';
import RoleTypesSelect from '../../components/forms/RoleTypesSelect';
import NotFound from '../../components/notFound/NotFound';
import Spinner from '../../components/spinner/Spinner';
import AuthContext from '../../context/AuthContext';
import { ApiResponse } from '../../types/apiResponse';
import { WorldRoleListData, WorldRoleQueryParams } from '../../types/role';
import { worldRolesMockData } from '../../utils/mockData/worldRoles';
import { splitByWhitespaces } from '../../utils/strings/formatters';

function RolesWorld() {
  const { currentUser } = useContext(AuthContext);

  if (!currentUser) {
    return <NotFound message="User is not found." />;
  }

  const [searchParams, setSearchParams] = useState<WorldRoleQueryParams>({
    searchWords: [],
    roleTypeWords: [],
    shouldFilterForCurrentUserApplications: false,
  });

  const onSearchBarChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setSearchParams({ ...searchParams, searchWords: splitByWhitespaces(e.target.value) });
  };

  const onRoleTypesFilterChange = (roleTypes: RoleType[]) => {
    setSearchParams({ ...searchParams, roleTypeWords: roleTypes });
  };

  const onApplicationFilterCheckboxChange = (e: CheckboxChangeEvent) => {
    setSearchParams({ ...searchParams, shouldFilterForCurrentUserApplications: e.target.checked });
  };

  const { data } = !currentUser.isAnonymous
    ? useSWR<ApiResponse<WorldRoleListData[]>>([WORLD_API_ENDPOINT, searchParams], (url, searchParams) =>
        api.get(url, { params: searchParams }),
      )
    : { data: undefined };

  const worldRoles = !currentUser.isAnonymous && Array.isArray(data?.payload) ? data?.payload : worldRolesMockData;

  return (
    <div className="p-5">
      <div className="flex items-center justify-between">
        <Title>World Overview</Title>

        <div className="hidden md:flex mb-[0.5em] gap-3">
          <CreateApplicationButton />
          <GoToYourListViewButton />
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
              <Checkbox onChange={onApplicationFilterCheckboxChange}>My applications only</Checkbox>
            </Form.Item>
          </Col>
        </Row>
      </Form>

      {/* World List */}
      <Spinner isLoading={!currentUser.isAnonymous && !data}>
        {worldRoles?.map((role, index) => (
          <WorldRoleListCard key={index} role={role} shouldBlur={currentUser.isAnonymous} />
        ))}

        {currentUser.isAnonymous && (
          <div className="flex justify-center mt-5 text-base text-gray-500">
            Please log in with Github to see the world view.
          </div>
        )}
      </Spinner>
    </div>
  );
}

export default RolesWorld;
