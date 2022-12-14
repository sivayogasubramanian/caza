import { ApplicationStageType } from '@prisma/client';
import { Tooltip } from 'antd';
import { useRouter } from 'next/router';
import { WorldRoleListData } from '../../types/role';
import { log } from '../../utils/analytics';
import { stageTypeToDisplayStringMap } from '../../utils/applicationStage/applicationStageUtils';
import { WORLD_ROUTE } from '../../utils/constants';
import { roleTypeToDisplayStringMap } from '../../utils/role/roleUtils';
import CompanyLogo from '../company/CompanyLogo';

type Props = { role: WorldRoleListData; shouldBlur: boolean };

// Colors of the individual stage sections, should match the number of values in the ApplicationStageType enum.
const colors = ['#C2EBF8', '#D0ACFF', '#FFF6A6', '#FFD0E4', '#FFE39A', '#CEEEC8', '#BFE4DE', '#FFC3BF', '#E5E5EE'];

const stageColors = Object.values(ApplicationStageType).map((stage, index) => ({
  stage,
  color: colors[index % colors.length], // Defensive modulo in case the number of colors is less than the number of stages.
}));

function WorldRoleListCard({ role, shouldBlur }: Props) {
  const router = useRouter();

  const sumOfStageCounts = role.applicationStages.reduce((acc, stage) => acc + stage.count, 0);

  const onClick = () => {
    log('click_world_role_list_item');
    router.push(`${WORLD_ROUTE}/${role.id}`);
  };

  return (
    <div
      className={`bg-white flex flex-col shadow-around mt-2 rounded-lg p-3 cursor-pointer transition-shadow duration-500 hover:shadow-bigAround ${
        shouldBlur ? 'bg-white blur-sm pointer-events-none' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center xs-12 md-4 p-4">
        <CompanyLogo company={role.company} className="rounded-full max-w-[3rem]" />

        <div className="ml-5 w-[100%] flex flex-col">
          <div className="font-bold">{role.title}</div>

          <div className="text-gray-500 text-xs">{`${role.company.name}, ${roleTypeToDisplayStringMap.get(
            role.type,
          )}, ${role.year}`}</div>
        </div>
      </div>

      {/* Stacked Bar Chart */}
      <div className="flex rounded-lg overflow-hidden text-center mt-2">
        {sumOfStageCounts > 0 ? (
          stageColors.map(({ stage, color }) => {
            const stageCount = role.applicationStages.find((s) => s.type === stage)?.count ?? 0;
            const percentage = stageCount / sumOfStageCounts;
            return (
              <Tooltip title={`${stageTypeToDisplayStringMap.get(stage)}: ${stageCount}`} key={stage}>
                <div
                  className={`overflow-hidden text-center ${percentage < 0.05 ? 'text-transparent md:text-black' : ''}`}
                  style={{ width: `${percentage * 100}%`, backgroundColor: color }}
                >
                  {stageCount}
                </div>
              </Tooltip>
            );
          })
        ) : (
          <div className="bg-zinc-300 w-full">No applications yet</div>
        )}
      </div>

      {/* Stage Color Legend */}
      <div className="flex flex-wrap items-center">
        {stageColors
          .filter(({ stage }) => role.applicationStages.some(({ type }) => stage === type))
          .map(({ stage, color }) => (
            <div key={stage} className="flex items-center mt-2 mr-1">
              <div className="w-4 h-4 rounded-md mr-1" style={{ backgroundColor: color }}>
                &nbsp;
              </div>
              <div>{stageTypeToDisplayStringMap.get(stage)}</div>
            </div>
          ))}
      </div>

      <div className="text-gray-500 text-xs mt-2">Total applications: {sumOfStageCounts}</div>
    </div>
  );
}

export default WorldRoleListCard;
