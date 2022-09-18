import { RoleType } from '@prisma/client';
import { Checkbox, Col, Form, Row } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import Search from 'antd/lib/input/Search';
import Title from 'antd/lib/typography/Title';
import { ChangeEventHandler, useState } from 'react';
import useSWR from 'swr';
import api from '../../../api/api';
import { WORLD_API_ENDPOINT } from '../../../api/worldApi';
import WorldRoleListCard from '../../../components/cards/WorldRoleListCard';
import RoleTypesSelect from '../../../components/forms/RoleTypesSelect';
import Spinner from '../../../components/spinner/Spinner';
import { ApiResponse } from '../../../types/apiResponse';
import { WorldRoleListData, WorldRoleQueryParams } from '../../../types/role';
import { splitByWhitespaces } from '../../../utils/strings/formatters';

function RolesWorld() {
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

  const { data } = useSWR<ApiResponse<WorldRoleListData[]>>([WORLD_API_ENDPOINT, searchParams], (url, searchParams) =>
    api.get(url, { params: searchParams }),
  );

  const worldRoles = Array.isArray(data?.payload) ? data?.payload : [];

  return (
    <div className="p-5">
      <Title>World Overview</Title>

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
      <Spinner isLoading={!data}>
        {worldRoles?.map((role, index) => (
          <WorldRoleListCard key={index} role={role} />
        ))}
      </Spinner>
    </div>
  );
}

export default RolesWorld;
