import { ApplicationStageApplicationData } from '../../types/applicationStage';
import { stageTypeToDisplayStringMap } from '../../utils/applicationStage/applicationStageUtils';
import { makeDisplayDate } from '../../utils/date/formatters';
import { isValidDate } from '../../utils/date/validations';

interface Props {
  applicationStage: ApplicationStageApplicationData;
  onClick?: () => void;
}

function ApplicationStageTimelineCard({ applicationStage, onClick }: Props) {
  const date = isValidDate(applicationStage.date) ? new Date(applicationStage.date) : undefined;

  return (
    <div className="bg-white shadow-around rounded-lg cursor-pointer hover:shadow-bigAround" onClick={onClick}>
      <div className="p-2">
        <div className="grid grid-cols-4 gap-2">
          <div className="font-bold flex items-start col-span-3 gap-1">
            {stageTypeToDisplayStringMap.get(applicationStage.type)}
            {applicationStage.emojiUnicodeHex && (
              <span role="img" aria-label="emoji">
                {String.fromCodePoint(parseInt(applicationStage.emojiUnicodeHex, 16))}
              </span>
            )}
          </div>

          {date && <div className="flex items-start justify-end text-xs">{makeDisplayDate(date)}</div>}
        </div>

        <div className="flex justify-start items-start gap-2">
          {applicationStage.remark && <div className="text-gray-700 text-sm">{applicationStage.remark}</div>}
        </div>
      </div>
    </div>
  );
}

export default ApplicationStageTimelineCard;
