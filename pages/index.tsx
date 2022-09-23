import { ApplicationStageType, RoleType } from '@prisma/client';
import { Button, Col, Form, Input, Row, Spin, Tooltip } from 'antd';
import { User } from 'firebase/auth';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { ChangeEventHandler, UIEvent, useContext, useState } from 'react';
import useSWR from 'swr';
import CreateApplicationButton from '../components/buttons/CreateApplicationButton';
import GoToWorldViewButton from '../components/buttons/GoToWorldViewButton';
import ApplicationListCard from '../components/cards/ApplicationListCard';
import ApplicationStagesSelect from '../components/forms/ApplicationStagesSelect';
import RoleTypesSelect from '../components/forms/RoleTypesSelect';
import RandomKawaii from '../components/notFound/RandomKawaii';
import AuthContext from '../context/AuthContext';
import applicationsApi from '../frontendApis/applicationsApi';
import useDebounce from '../hooks/useDebounce';
import { ApiResponse } from '../types/apiResponse';
import { ApplicationListData, ApplicationQueryParams } from '../types/application';
import { log } from '../utils/analytics';
import { CREATE_APPLICATION_ROUTE, DEBOUNCE_DELAY } from '../utils/constants';
import { splitByWhitespaces } from '../utils/strings/formatters';
import { ArrowLeftOutlined, SearchOutlined } from '@ant-design/icons';
import Head from 'next/head';

function Applications() {
  const { currentUser } = useContext(AuthContext);
  const router = useRouter();

  const [searchParams, setSearchParams] = useState<ApplicationQueryParams>({
    searchWords: [],
    roleTypeWords: [],
    stageTypeWords: [],
  });
  const debouncedSearchParams = useDebounce(searchParams, DEBOUNCE_DELAY);

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

  const { data: applicationListData, isValidating: isLoading } = useSWR<ApiResponse<ApplicationListData[]>>(
    [currentUser, debouncedSearchParams],
    (user: User, params: ApplicationQueryParams) =>
      user.getIdToken().then((token) => applicationsApi.getApplications(params, token)),
  );

  const applications: ApplicationListData[] = Array.isArray(applicationListData?.payload)
    ? (applicationListData?.payload as ApplicationListData[])
    : [];

  const exitSearch = () => {
    setIsSearchHidden(true);
    setSearchParams({
      searchWords: [],
      roleTypeWords: [],
      stageTypeWords: [],
    });
  };

  return (
    <div>
      <Head>
        <title>Your Applications.</title>
      </Head>
      <main>
        <div className={`h-full overflow-clip ${isShowingSearch ? 'pb-24' : ''}`}>
          <div className="mt-2 p-2 bg-primary-three rounded-b-3xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center justify-start gap-2">
                <div className="text-2xl font-bold text-primary-four">My Applications</div>
                <GoToWorldViewButton />
              </div>

              <div className="flex items-center justify-end gap-2">
                {isSearchHidden && (
                  <Tooltip title="search">
                    <Button
                      className="bg-transparent border-primary-four focus:bg-transparent"
                      shape="circle"
                      onClick={() => setIsSearchHidden(false)}
                      icon={<SearchOutlined style={{ color: '#185ADB', borderColor: '#185ADB' }} />}
                    />
                  </Tooltip>
                )}

                <div className="hidden md:flex items-center justify-between gap-2">
                  <CreateApplicationButton />
                </div>
              </div>

              {/* Search and Filters */}
              {isShowingSearch && (
                <Form className="pt-4">
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={18}>
                      <Input.Group className="flex items-center justify-items-stretch">
                        <Tooltip title="Exit search">
                          <ArrowLeftOutlined style={{ fontSize: '15px', paddingRight: '2%' }} onClick={exitSearch} />
                        </Tooltip>
                        <Input
                          value={searchParams.searchWords.length === 0 ? undefined : searchParams.searchWords.join(' ')}
                          placeholder="Search by role or company..."
                          className="bg-primary-two"
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 h-full pb-32 overflow-y-auto"
              onScroll={handleScroll}
            >
              <Spin spinning={isLoading}>
                {isLoading || applications.length > 0 ? (
                  applications.map((application, index) => (
                    <ApplicationListCard key={index} application={application} />
                  ))
                ) : (
                  <div className="mt-4 flex flex-col justify-around items-center gap-2">
                    <RandomKawaii isHappy={true} />
                    <Button
                      onClick={() => {
                        log('click-create-application-kawaii');
                        router.push(CREATE_APPLICATION_ROUTE);
                      }}
                    >
                      Create an application
                    </Button>
                  </div>
                )}
              </Spin>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Applications;
