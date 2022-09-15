import { ApplicationStageApplicationData } from '../../types/applicationStage';
import ApplicationStageTimelineCard from '../../components/cards/ApplicationStageTimelineCard';
import { TaskData } from '../../types/task';
import ApplicationTaskTimelineCard from '../../components/cards/ApplicationTaskTimelineCard';

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

function Application() {
  return (
    <>
      {testApplicationStages.map((applicationStage, index) => (
        <ApplicationStageTimelineCard key={index} applicationStage={applicationStage} />
      ))}

      {testTasks.map((task, index) => (
        <ApplicationTaskTimelineCard key={index} task={task} />
      ))}
    </>
  );
}

export default Application;
