import { ApplicationStageApplicationData } from '../../types/applicationStage';
import { TaskData } from '../../types/task';
import { TimelineData, TimelineType } from '../../types/timeline';
import { Timeline } from 'antd';
import ApplicationTaskTimelineCard from '../../components/cards/ApplicationTaskTimelineCard';
import ApplicationStageTimelineCard from '../../components/cards/ApplicationStageTimelineCard';
import TaskIcon from '../../components/icons/timeline/TaskIcon';
import { stageTypeToIconMap } from '../../utils/applicationStage/applicationStageUtils';

const testApplicationStages: ApplicationStageApplicationData[] = [
  {
    id: 1,
    type: 'APPLIED',
    date: new Date(),
    emojiUnicodeHex: '1F610',
    remark: null,
  },
  {
    id: 2,
    type: 'ONLINE_ASSESSMENT',
    date: new Date(Date.now() + 3 * 86400000),
    emojiUnicodeHex: '1F614',
    remark:
      'Very difficult. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent at aliquam sem. Mauris efficitur consequat metus, eget rutrum urna condimentum at. Proin consectetur id lacus et aliquam. Integer scelerisque vulputate augue. Vivamus in sem rhoncus, cursus eros in, pellentesque sapien.',
  },
  {
    id: 3,
    type: 'TECHNICAL',
    date: new Date(Date.now() + 5 * 86400000),
    emojiUnicodeHex: null,
    remark: 'Sian',
  },
  {
    id: 4,
    type: 'MIXED',
    date: new Date(Date.now() + 10 * 86400000),
    emojiUnicodeHex: null,
    remark: 'Wow',
  },
];

const testTasks: TaskData[] = [
  {
    id: 1,
    title: 'Do OA',
    dueDate: new Date(Date.now() + 3 * 86400000),
    notificationDateTime: new Date(Date.now() + 86400000),
    isDone: true,
  },
  {
    id: 2,
    title: 'Prepare for interview',
    dueDate: new Date(Date.now() + 4 * 86400000),
    notificationDateTime: new Date(Date.now() + 4 * 86400000),
    isDone: false,
  },
];

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
  const timelineApplicationStages: TimelineData[] = testApplicationStages.map((stage) => ({
    date: stage.date,
    type: TimelineType.STAGE,
    data: stage,
  }));
  const timelineApplicationTasks: TimelineData[] = testTasks.map((task) => ({
    date: task.dueDate,
    type: TimelineType.TASK,
    data: task,
  }));
  const timelineItems = [...timelineApplicationStages, ...timelineApplicationTasks].sort(
    (firstItem, secondItem) =>
      firstItem.date.getTime() - secondItem.date.getTime() || (firstItem.type === TimelineType.TASK ? -1 : 1),
  );

  return (
    <>
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
    </>
  );
}

export default Application;
