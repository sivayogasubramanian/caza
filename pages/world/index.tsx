import { RoleType } from '@prisma/client';
import { Button, Checkbox, Col, Form, Input, Row, Tooltip } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { ChangeEventHandler, UIEvent, useContext, useState } from 'react';
import useSWR from 'swr';
import api from '../../frontendApis/api';
import { WORLD_API_ENDPOINT } from '../../frontendApis/worldApi';
import CreateApplicationButton from '../../components/buttons/CreateApplicationButton';
import WorldRoleListCard from '../../components/cards/WorldRoleListCard';
import RoleTypesSelect from '../../components/forms/RoleTypesSelect';
import NotFound from '../../components/notFound/NotFound';
import Spinner from '../../components/spinner/Spinner';
import AuthContext from '../../context/AuthContext';
import { ApiResponse } from '../../types/apiResponse';
import { WorldRoleListData, WorldRoleQueryParams } from '../../types/role';
import { worldRolesMockData } from '../../utils/mockData/worldRoles';
import { splitByWhitespaces } from '../../utils/strings/formatters';
import { ArrowLeftOutlined, SearchOutlined } from '@ant-design/icons';
import GoToYourListViewButton from '../../components/buttons/GoToYourListViewButton';

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

  const [isSearchHidden, setIsSearchHidden] = useState<boolean>(true);
  const [isSearchTemporarilyHidden, setIsSearchTemporarilyHidden] = useState<boolean>(false);
  const [scrollY, setScrollY] = useState(window.scrollY);
  const shouldShowSearch = !isSearchHidden && !isSearchTemporarilyHidden;

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const window = e.target as HTMLDivElement;

    if (scrollY > window.scrollTop) {
      setIsSearchTemporarilyHidden(false);
    }
    if (scrollY < window.scrollTop) {
      setIsSearchTemporarilyHidden(true);
    }
    setScrollY(window.scrollTop);
  };

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
    <div className={`h-full overflow-clip ${shouldShowSearch ? 'pb-24' : ''}`}>
      <div className="mt-2 p-2 bg-primary-one rounded-b-3xl">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-2xl font-bold text-white">World Overview</div>

          <div className="flex items-center justify-end gap-2">
            {isSearchHidden && (
              <Tooltip title="search">
                <Button
                  className="bg-transparent focus:bg-transparent"
                  shape="circle"
                  onClick={() => setIsSearchHidden(false)}
                  icon={<SearchOutlined style={{ color: '#FFFFFF' }} />}
                />
              </Tooltip>
            )}

            <div className="hidden md:flex items-center gap-2">
              <CreateApplicationButton />
              <GoToYourListViewButton />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        {shouldShowSearch && (
          <Form>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={18}>
                <Input.Group className="flex items-center justify-items-stretch">
                  <Tooltip title="Exit search">
                    <ArrowLeftOutlined
                      style={{ color: '#FFFFFF', fontSize: '15px', paddingRight: '2%' }}
                      onClick={() => setIsSearchHidden(true)}
                    />
                  </Tooltip>
                  <Input
                    value={searchParams.searchWords.length === 0 ? undefined : searchParams.searchWords.join(' ')}
                    placeholder="Search by roles or company..."
                    className="bg-primary-two text-white"
                    bordered={false}
                    onChange={onSearchBarChange}
                  />
                </Input.Group>
              </Col>
              <Col xs={12} md={3}>
                <Form.Item>
                  <RoleTypesSelect
                    value={searchParams.roleTypeWords}
                    isBordered={false}
                    isUsedInHeader={true}
                    isMultiselect
                    onChange={onRoleTypesFilterChange}
                  />
                </Form.Item>
              </Col>
              <Col xs={12} md={3}>
                <Form.Item>
                  <Checkbox className="text-white" onChange={onApplicationFilterCheckboxChange}>
                    My applications only
                  </Checkbox>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
      </div>

      {/* World List */}
      <div className="p-4 h-5/6 overflow-y-scroll" onScroll={handleScroll}>
        <Spinner isLoading={!currentUser.isAnonymous && !data}>
          {currentUser.isAnonymous && <div>Please log in with Github to see the world view.</div>}

          {worldRoles?.map((role, index) => (
            <WorldRoleListCard key={index} role={role} shouldBlur={currentUser.isAnonymous} />
          ))}
        </Spinner>
      </div>
    </div>
  );
}

export default RolesWorld;
