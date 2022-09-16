import { ApplicationStageApplicationData } from '../../types/applicationStage';
import { stageTypeToDisplayStringMap } from '../../utils/applicationStage/applicationStageUtils';
import { makeDisplayDate } from '../../utils/date/formatters';
import { isValidDate } from '../../utils/date/validations';

interface Props {
  applicationStage: ApplicationStageApplicationData;
}

function ApplicationStageTimelineCard({ applicationStage }: Props) {
  const date = isValidDate(applicationStage.date) ? new Date(applicationStage.date) : undefined;

  return (
    <div className="shadow-md rounded-lg">
      <div className="mt-1 mb-1 ml-1 mr-1">
        <div className="grid grid-cols-3 gap-2">
          <div className="text-lg font-bold flex items-start col-span-2 gap-1">
            {stageTypeToDisplayStringMap.get(applicationStage.type)}
            {applicationStage.emojiUnicodeHex && (
              <span role="img" aria-label="emoji">
                {String.fromCodePoint(parseInt(applicationStage.emojiUnicodeHex, 16))}
              </span>
            )}
          </div>

          {date && <div className="flex items-start justify-end">{makeDisplayDate(date)}</div>}
        </div>

        <div className="flex justify-start items-start gap-2">
          {applicationStage.remark && <div className="text-gray-700 text-base">{applicationStage.remark}</div>}
        </div>
      </div>
    </div>
  );
}

export default ApplicationStageTimelineCard;
