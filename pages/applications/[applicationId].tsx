import { Timeline } from 'antd';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import applicationsApi from '../../api/applicationsApi';
import ApplicationStageTimelineCard from '../../components/cards/ApplicationStageTimelineCard';
import ApplicationTaskTimelineCard from '../../components/cards/ApplicationTaskTimelineCard';
import TaskIcon from '../../components/icons/timeline/TaskIcon';
import NotFound from '../../components/notFound/NotFound';
import Spinner from '../../components/spinner/Spinner';
import { ApplicationData } from '../../types/application';
import { ApplicationStageApplicationData } from '../../types/applicationStage';
import { TaskData } from '../../types/task';
import { TimelineData, TimelineType } from '../../types/timeline';
import { stageTypeToIconMap } from '../../utils/applicationStage/applicationStageUtils';
import { isValidDate } from '../../utils/date/validations';
import { canBecomeInteger } from '../../utils/numbers/validations';

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

  const response = hasValidApplicationId
    ? useSWR([applicationId], applicationsApi.getApplication, { revalidateOnMount: true })
    : undefined;
  const isLoading = response?.data === undefined;
  const hasSuccessfullyFetchedApplication = response?.data?.payload?.id !== undefined;
  const application = response?.data?.payload as ApplicationData;

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

  const [shouldFetchData, setShouldFetchData] = useState(true);

  useEffect(() => {
    if (shouldFetchData) {
      response?.mutate();
      setShouldFetchData(false);
    }
  }, [shouldFetchData]);

  return (
    <Spinner isLoading={isLoading}>
      {hasSuccessfullyFetchedApplication && timelineItems.length === 0 && (
        <div className="mr-5 ml-5 flex justify-center text-center text-gray-300">
          This application seems very empty. Add you first stage or task now!
        </div>
      )}

      {hasSuccessfullyFetchedApplication && timelineItems.length > 0 && (
        <Timeline className="m-4" reverse={true}>
          {timelineItems.map((item, index) => (
            <Timeline.Item key={index} dot={getTimelineIcon(item)}>
              {item.type === TimelineType.STAGE ? (
                <ApplicationStageTimelineCard applicationStage={item.data as ApplicationStageApplicationData} />
              ) : (
                <ApplicationTaskTimelineCard
                  applicationId={applicationId}
                  task={item.data as TaskData}
                  setShouldFetchData={setShouldFetchData}
                />
              )}
            </Timeline.Item>
          ))}
        </Timeline>
      )}

      {!hasSuccessfullyFetchedApplication && <NotFound message="The application was not found." />}
    </Spinner>
  );
}

export default Application;
