import { ApplicationStageType, RoleType } from '@prisma/client';
import { Button, Col, Form, Input, Row, Spin, Tooltip } from 'antd';
import { ChangeEventHandler, UIEvent, useContext, useEffect, useState } from 'react';
import useSWR from 'swr';
import { APPLICATIONS_API_ENDPOINT } from '../frontendApis/applicationsApi';
import CreateApplicationButton from '../components/buttons/CreateApplicationButton';
import GoToWorldViewButton from '../components/buttons/GoToWorldViewButton';
import ApplicationListCard from '../components/cards/ApplicationListCard';
import ApplicationStagesSelect from '../components/forms/ApplicationStagesSelect';
import RoleTypesSelect from '../components/forms/RoleTypesSelect';
import AuthContext from '../context/AuthContext';
import api from '../frontendApis/api';
import { ApiResponse } from '../types/apiResponse';
import { ApplicationListData, ApplicationQueryParams } from '../types/application';
import { splitByWhitespaces } from '../utils/strings/formatters';
import { ArrowLeftOutlined, SearchOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

function Applications() {
  const { currentUser } = useContext(AuthContext);

  const [searchParams, setSearchParams] = useState<ApplicationQueryParams>({
    searchWords: [],
    roleTypeWords: [],
    stageTypeWords: [],
  });

  const [isSearchHidden, setIsSearchHidden] = useState<boolean>(true);
  const [isSearchTemporarilyHidden, setIsSearchTemporarilyHidden] = useState<boolean>(false);
  const [scrollY, setScrollY] = useState(window.scrollY);
  const isShowingSearch = !isSearchHidden && !isSearchTemporarilyHidden;

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
    <div className={`h-full overflow-clip ${isShowingSearch ? 'pb-24' : ''}`}>
      <div className="mt-2 p-2 bg-primary-one rounded-b-3xl">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-2xl font-bold text-white">Applications</div>

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
              <GoToWorldViewButton />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        {isShowingSearch && (
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
                  <ApplicationStagesSelect
                    value={searchParams.stageTypeWords}
                    isBordered={false}
                    isUsedInHeader={true}
                    isMultiselect
                    onChange={onApplicationStageTypesFilterChange}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
      </div>

      {/* Application List */}
      <motion.div
        initial={{ opacity: 0.2 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, ease: 'easeInOut' }}
        className="p-4 h-full pb-32 overflow-y-scroll"
        onScroll={handleScroll}
      >
        <Spin spinning={!applicationListData}>
          {applications.map((application, index) => (
            <ApplicationListCard key={index} application={application} />
          ))}
        </Spin>
      </motion.div>
    </div>
  );
}

export default Applications;
