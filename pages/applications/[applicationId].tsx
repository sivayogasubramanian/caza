import { ApplicationStageApplicationData } from '../../types/applicationStage';
import ApplicationStageTimelineCard from '../../components/cards/ApplicationStageTimelineCard';

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
    date: new Date(Date.now() + 2 * 86400000),
    emojiUnicodeHex: '1F614',
    remark:
      'Very difficult. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent at aliquam sem. Mauris efficitur consequat metus, eget rutrum urna condimentum at. Proin consectetur id lacus et aliquam. Integer scelerisque vulputate augue. Vivamus in sem rhoncus, cursus eros in, pellentesque sapien.',
  },
  {
    id: 3,
    type: 'TECHNICAL',
    date: new Date(Date.now() + 3 * 86400000),
    emojiUnicodeHex: null,
    remark: 'Sian',
  },
];

function Application() {
  return (
    <>
      {testApplicationStages.map((applicationStage, index) => (
        <ApplicationStageTimelineCard key={index} applicationStage={applicationStage} />
      ))}
    </>
  );
}

export default Application;
