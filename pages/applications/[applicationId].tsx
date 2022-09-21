import { Button, Timeline } from 'antd';
import Title from 'antd/lib/typography/Title';
import { useRouter } from 'next/router';
import { useState } from 'react';
import useSWR from 'swr';
import applicationsApi from '../../frontendApis/applicationsApi';
import ApplicationStageTimelineCard from '../../components/cards/ApplicationStageTimelineCard';
import ApplicationTaskTimelineCard from '../../components/cards/ApplicationTaskTimelineCard';
import TaskIcon from '../../components/icons/timeline/TaskIcon';
import EditStageModal from '../../components/modals/EditStageModal';
import EditTaskModal from '../../components/modals/EditTaskModal';
import NewStageModal from '../../components/modals/NewStageModal';
import NewTaskModal from '../../components/modals/NewTaskModal';
import NotFound from '../../components/notFound/NotFound';
import Spinner from '../../components/spinner/Spinner';
import { ApplicationData } from '../../types/application';
import { ApplicationStageApplicationData } from '../../types/applicationStage';
import { TaskData } from '../../types/task';
import { TimelineData, TimelineType } from '../../types/timeline';
import { Nullable } from '../../types/utils';
import { stageTypeToIconMap } from '../../utils/applicationStage/applicationStageUtils';
import { isValidDate } from '../../utils/date/validations';
import { canBecomeInteger } from '../../utils/numbers/validations';
import GlobeIcon from '../../components/icons/GlobeIcon';
import Link from 'next/link';
import { PlusOutlined } from '@ant-design/icons';

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
    return <NotFound message="The application id is invalid and cannot be found." />;
  }

  const { data, mutate: mutateApplicationData } = useSWR([applicationId], applicationsApi.getApplication, {
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

  return (
    <Spinner isLoading={isLoading}>
      <div className="p-5">
        {hasSuccessfullyFetchedApplication && (
          <div className="flex items-center justify-between">
            <Title>{`${application.role.title} @ ${application.role.company.name}`}</Title>
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
          <Timeline className="m-4" reverse={true}>
            {timelineItems.map((item, index) => (
              <Timeline.Item key={index} dot={getTimelineIcon(item)}>
                {item.type === TimelineType.STAGE ? (
                  <ApplicationStageTimelineCard
                    applicationStage={item.data as ApplicationStageApplicationData}
                    onClick={() => setSelectedStage(item.data as ApplicationStageApplicationData)}
                  />
                ) : (
                  <ApplicationTaskTimelineCard
                    applicationId={applicationId}
                    task={item.data as TaskData}
                    mutateApplicationData={mutateApplicationData}
                    onClick={() => setSelectedTask(item.data as TaskData)}
                  />
                )}
              </Timeline.Item>
            ))}
          </Timeline>
        )}

        {!hasSuccessfullyFetchedApplication && <NotFound message="The application was not found." />}
      </div>

      {hasSuccessfullyFetchedApplication && (
        <div className="fixed w-full bottom-14 flex items-center justify-around">
          <Button type="primary" shape="round" icon={<PlusOutlined />} onClick={() => setIsAddingNewStage(true)}>
            New stage
          </Button>

          <Button type="primary" shape="round" icon={<PlusOutlined />} onClick={() => setIsAddingNewTask(true)}>
            New task
          </Button>

          {application.role.isVerified && (
            <Link href={`/world/${application.role.id}`}>
              <Button shape="round" className="flex items-center gap-2" type="primary" icon={<GlobeIcon />}>
                Role stats
              </Button>
            </Link>
          )}
        </div>
      )}
    </Spinner>
  );
}

export default Application;
