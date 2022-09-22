import { Button, Modal, Spin, Timeline } from 'antd';
import { useRouter } from 'next/router';
import { useState } from 'react';
import useSWR from 'swr';
import applicationsApi, { APPLICATIONS_API_ENDPOINT } from '../../frontendApis/applicationsApi';
import ApplicationStageTimelineCard from '../../components/cards/ApplicationStageTimelineCard';
import ApplicationTaskTimelineCard from '../../components/cards/ApplicationTaskTimelineCard';
import TaskIcon from '../../components/icons/timeline/TaskIcon';
import EditStageModal from '../../components/modals/EditStageModal';
import EditTaskModal from '../../components/modals/EditTaskModal';
import NewStageModal from '../../components/modals/NewStageModal';
import NewTaskModal from '../../components/modals/NewTaskModal';
import NotFound from '../../components/notFound/NotFound';
import { ApplicationData } from '../../types/application';
import { ApplicationStageApplicationData } from '../../types/applicationStage';
import { TaskData } from '../../types/task';
import { TimelineData, TimelineType } from '../../types/timeline';
import { Nullable } from '../../types/utils';
import { stageTypeToIconMap } from '../../utils/applicationStage/applicationStageUtils';
import { isValidDate } from '../../utils/date/validations';
import { canBecomeInteger } from '../../utils/numbers/validations';
import { motion } from 'framer-motion';
import { log, logException } from '../../utils/analytics';
import { HOMEPAGE_ROUTE, WORLD_ROUTE } from '../../utils/constants';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import Head from 'next/head';

function getTimelineIcon(item: TimelineData) {
  if (item.type === TimelineType.TASK) {
    const taskData = item.data as TaskData;
    return TaskIcon({ isDone: taskData.isDone });
  }

  const stageData = item.data as ApplicationStageApplicationData;
  const stageIcon = stageTypeToIconMap.get(stageData.type);
  return stageIcon ? stageIcon() : <></>;
}

function Application() {
  const router = useRouter();
  const applicationId = canBecomeInteger(router.query.applicationId) ? Number(router.query.applicationId) : undefined;
  const hasValidApplicationId = applicationId !== undefined;

  if (!hasValidApplicationId) {
    logException('Invalid application ID', false, { applicationId });
    return <NotFound message="The application id is invalid and cannot be found." />;
  }

  const { data, mutate: mutateApplicationData } = useSWR(`${APPLICATIONS_API_ENDPOINT}/${applicationId}`, {
    revalidateOnMount: true,
  });
  const isLoading = data === undefined;
  const hasSuccessfullyFetchedApplication = data?.payload?.id !== undefined;
  const application = data?.payload as ApplicationData;

  const timelineApplicationStages: TimelineData[] =
    application?.applicationStages.map((stage) => ({
      date: isValidDate(stage.date) ? new Date(stage.date) : new Date(),
      type: TimelineType.STAGE,
      data: stage,
    })) ?? [];

  const timelineApplicationTasks: TimelineData[] =
    application?.tasks.map((task) => ({
      date: isValidDate(task.dueDate) ? new Date(task.dueDate) : new Date(),
      type: TimelineType.TASK,
      data: task,
    })) ?? [];

  const timelineItems = [...timelineApplicationStages, ...timelineApplicationTasks].sort(
    (firstItem, secondItem) =>
      firstItem.date.getTime() - secondItem.date.getTime() || (firstItem.type === TimelineType.TASK ? -1 : 1),
  );

  const [isAddingNewStage, setIsAddingNewStage] = useState<boolean>(false);
  const [selectedStage, setSelectedStage] = useState<Nullable<ApplicationStageApplicationData>>(null);
  const [isAddingNewTask, setIsAddingNewTask] = useState<boolean>(false);
  const [selectedTask, setSelectedTask] = useState<Nullable<TaskData>>(null);

  const getAddStageButton = () => (
    <Button
      type="primary"
      className="rounded-md"
      onClick={() => {
        log('click_new_stage_button');
        setIsAddingNewStage(true);
      }}
    >
      New Stage
    </Button>
  );

  const getAddTaskButton = () => (
    <Button
      type="primary"
      className="rounded-md"
      onClick={() => {
        log('click_new_task_button');
        setIsAddingNewTask(true);
      }}
    >
      New Task
    </Button>
  );

  const getRoleStatsButton = () =>
    application.role.isVerified && (
      <Button
        className="flex items-center gap-1 text-primary-four border-primary-four rounded-md bg-transparent"
        onClick={() => {
          log('click_role_stats_button');
          router.push(`${WORLD_ROUTE}/${application.role.id}`);
        }}
      >
        Role Stats
      </Button>
    );

  const getDeleteButton = () => (
    <Button danger shape="round" className="bg-transparent focus:bg-transparent rounded-md" onClick={onDelete}>
      Delete
    </Button>
  );

  const handleDelete = () =>
    applicationsApi.deleteApplication(applicationId).then(() => {
      router.replace(HOMEPAGE_ROUTE);
    });

  const onDelete = () => {
    Modal.confirm({
      title: 'Are you sure about deleting this application?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action is irreversible!',
      onOk: handleDelete,
    });
  };

  const title = isLoading ? 'Your application' : `${application.role.title} @ ${application.role.company.name}`;

  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <Spin
        spinning={isLoading}
        wrapperClassName={`h-full [&>div]:h-full overflow-clip ${
          isLoading ? 'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-x-1/2' : ''
        }`}
      >
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
          {hasSuccessfullyFetchedApplication && (
            <div className="mt-2 p-2 bg-primary-three rounded-b-3xl">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center justify-start gap-2">
                  <div className="text-2xl font-bold text-primary-four">{title}</div>
                  <div className="hidden md:flex">{getRoleStatsButton()}</div>
                </div>

                <div className="hidden md:flex flex items-center justify-end gap-2">
                  {getAddStageButton()}
                  {getAddTaskButton()}
                  {getDeleteButton()}
                </div>
              </div>

              <div className="md:hidden pt-2 w-full flex items-center justify-start gap-2">
                {getRoleStatsButton()}
                {getAddStageButton()}
                {getAddTaskButton()}
                {getDeleteButton()}
              </div>
            </div>
          )}

          {hasSuccessfullyFetchedApplication && timelineItems.length === 0 && (
            <div className="flex justify-center text-center text-gray-300">
              This application seems very empty. Add your first stage or task now!
            </div>
          )}

          {isAddingNewStage && (
            <NewStageModal
              applicationId={applicationId}
              setIsAddingNewStage={setIsAddingNewStage}
              mutateApplicationData={mutateApplicationData}
            />
          )}

          {selectedStage && (
            <EditStageModal
              applicationId={applicationId}
              initialStage={selectedStage}
              setSelectedStage={setSelectedStage}
              mutateApplicationData={mutateApplicationData}
            />
          )}

          {isAddingNewTask && (
            <NewTaskModal
              applicationId={applicationId}
              setIsAddingNewTask={setIsAddingNewTask}
              mutateApplicationData={mutateApplicationData}
            />
          )}

          {selectedTask && (
            <EditTaskModal
              applicationId={applicationId}
              initialTask={selectedTask}
              setSelectedTask={setSelectedTask}
              mutateApplicationData={mutateApplicationData}
            />
          )}

          {hasSuccessfullyFetchedApplication && timelineItems.length > 0 && (
            <div className="p-4 h-full pb-32 overflow-y-auto">
              <Timeline reverse={true}>
                {timelineItems.map((item, index) => (
                  <Timeline.Item key={index} dot={getTimelineIcon(item)}>
                    {item.type === TimelineType.STAGE ? (
                      <ApplicationStageTimelineCard
                        applicationStage={item.data as ApplicationStageApplicationData}
                        onClick={() => {
                          log('click_application_stage_timeline_card');
                          setSelectedStage(item.data as ApplicationStageApplicationData);
                        }}
                      />
                    ) : (
                      <ApplicationTaskTimelineCard
                        applicationId={applicationId}
                        task={item.data as TaskData}
                        mutateApplicationData={mutateApplicationData}
                        onClick={() => {
                          log('click_application_task_timeline_card');
                          setSelectedTask(item.data as TaskData);
                        }}
                      />
                    )}
                  </Timeline.Item>
                ))}
              </Timeline>
            </div>
          )}

          {!hasSuccessfullyFetchedApplication && !isLoading && <NotFound message="The application was not found." />}
        </motion.div>
      </Spin>
    </div>
  );
}

export default Application;
