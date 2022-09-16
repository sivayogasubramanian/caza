import { ApplicationStageApplicationData } from '../../types/applicationStage';
import { TaskData } from '../../types/task';
import { TimelineData, TimelineType } from '../../types/timeline';
import { Timeline } from 'antd';
import ApplicationTaskTimelineCard from '../../components/cards/ApplicationTaskTimelineCard';
import ApplicationStageTimelineCard from '../../components/cards/ApplicationStageTimelineCard';
import TaskIcon from '../../components/icons/timeline/TaskIcon';
import { stageTypeToIconMap } from '../../utils/applicationStage/applicationStageUtils';
import useSWR from 'swr';
import { useRouter } from 'next/router';
import { canBecomeInteger } from '../../utils/numbers/validations';
import applicationsApi from '../../api/applicationsApi';
import { ApplicationData } from '../../types/application';

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
  const response = hasValidApplicationId ? useSWR([applicationId], applicationsApi.getApplication) : undefined;
  const isLoading = response?.data === undefined;
  const application = response?.data?.payload as ApplicationData;
  const hasSuccessfullyFetchedApplication = application?.id !== undefined;

  const timelineApplicationStages: TimelineData[] =
    application.applicationStages.map((stage) => ({
      date: new Date(stage.date),
      type: TimelineType.STAGE,
      data: stage,
    })) ?? [];
  const timelineApplicationTasks: TimelineData[] =
    application.tasks.map((task) => ({
      date: new Date(task.dueDate),
      type: TimelineType.TASK,
      data: task,
    })) ?? [];

  const timelineItems = [...timelineApplicationStages, ...timelineApplicationTasks].sort(
    (firstItem, secondItem) =>
      firstItem.date.getTime() - secondItem.date.getTime() || (firstItem.type === TimelineType.TASK ? -1 : 1),
  );

  return (
    <>
      {isLoading && <div>Loading...</div>}

      {hasSuccessfullyFetchedApplication && timelineItems.length === 0 && <div>Add your first stage or task!</div>}

      {hasSuccessfullyFetchedApplication && timelineItems.length > 0 && (
        <Timeline className="mt-4 mb-4 ml-4 mr-2" reverse={true}>
          {timelineItems.map((item, index) => (
            <Timeline.Item key={index} dot={getTimelineIcon(item)}>
              {item.type === TimelineType.STAGE ? (
                <ApplicationStageTimelineCard applicationStage={item.data as ApplicationStageApplicationData} />
              ) : (
                <ApplicationTaskTimelineCard task={item.data as TaskData} />
              )}
            </Timeline.Item>
          ))}
        </Timeline>
      )}

      {!hasSuccessfullyFetchedApplication && !isLoading && <div>Not found</div>}
    </>
  );
}

export default Application;
