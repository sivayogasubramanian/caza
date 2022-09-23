import { ApplicationStageType } from '@prisma/client';
import { Badge } from 'antd';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';
import { ApplicationListData } from '../../types/application';
import { log } from '../../utils/analytics';
import { stageTypeToBadgeMap } from '../../utils/applicationStage/applicationStageUtils';
import { APPLICATIONS_ROUTE } from '../../utils/constants';
import { getCountOfDaysTillTodayFrom } from '../../utils/date/formatters';
import { isValidDate } from '../../utils/date/validations';
import { roleTypeToDisplayStringMap } from '../../utils/role/roleUtils';
import CompanyLogo from '../company/CompanyLogo';

interface Props {
  application: ApplicationListData;
}

function getApplicationStageBadge(stageType: ApplicationStageType): ReactNode {
  const stageBadge = stageTypeToBadgeMap.get(stageType);
  return stageBadge ? stageBadge() : null;
}

function ApplicationListCard({ application }: Props) {
  const router = useRouter();

  const latestStageDate =
    application.latestStage && isValidDate(application.latestStage.date)
      ? new Date(application.latestStage.date)
      : undefined;

  const onCardClick = () => {
    log('click_application_list_card');
    router.push(`${APPLICATIONS_ROUTE}/${application.id}`);
  };

  return (
    <div
      className="bg-white/[.9] shadow-around rounded-lg mt-2 cursor-pointer transition-shadow duration-500 hover:shadow-bigAround"
      onClick={onCardClick}
    >
      <div className="p-4 flex items-center">
        <CompanyLogo company={application.role.company} className="rounded-full max-w-[3rem]" />

        <div className="ml-5 w-[100%] flex flex-col">
          <div className="flex items-start justify-between">
            <div className="font-bold">{application.role.title}</div>
            <Badge count={application.taskNotificationCount} />
          </div>

          <div className="text-gray-500 text-xs">{`${application.role.company.name}, ${roleTypeToDisplayStringMap.get(
            application.role.type,
          )}, ${application.role.year}`}</div>

          <div className="flex justify-between items-center mt-0.5">
            {application.latestStage && (
              <>
                <div className="flex">
                  {getApplicationStageBadge(application.latestStage.type)}

                  {application.latestStage.emojiUnicodeHex && (
                    <span className="ml-1" role="img" aria-label="emoji">
                      {String.fromCodePoint(parseInt(application.latestStage.emojiUnicodeHex, 16))}
                    </span>
                  )}
                </div>

                {latestStageDate && (
                  <div className="text-xs text-gray-400">{`${getNumberOfDaysToToday(latestStageDate)}`}</div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getNumberOfDaysToToday(date: Date) {
  const countOfDaysTillToday = getCountOfDaysTillTodayFrom(date);
  if (countOfDaysTillToday === 0) {
    return 'Today';
  }

  const daySingularOrPlural = `day${Math.abs(countOfDaysTillToday) > 1 ? 's' : ''}`;
  return countOfDaysTillToday > 0
    ? `in ${countOfDaysTillToday} ${daySingularOrPlural}`
    : `${-1 * countOfDaysTillToday} ${daySingularOrPlural} ago`;
}

export default ApplicationListCard;
