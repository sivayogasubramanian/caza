import { RightCircleOutlined } from '@ant-design/icons';
import { ApplicationStageType } from '@prisma/client';
import { Button, Tooltip } from 'antd';
import { WorldRoleListData } from '../../types/role';
import { stageTypeToDisplayStringMap } from '../../utils/applicationStage/applicationStageUtils';
import { roleTypeToDisplayStringMap } from '../../utils/role/roleUtils';
import CompanyLogo from '../company/CompanyLogo';

type Props = { role: WorldRoleListData };

const stageColors = [
  {
    stage: ApplicationStageType.APPLIED,
    color: '#e3342f',
  },
  {
    stage: ApplicationStageType.ONLINE_ASSESSMENT,
    color: '#f6993f',
  },
  {
    stage: ApplicationStageType.TECHNICAL,
    color: '#ffed4a',
  },
  {
    stage: ApplicationStageType.NON_TECHNICAL,
    color: '#38c172',
  },
  {
    stage: ApplicationStageType.MIXED,
    color: '#4dc0b5',
  },
  {
    stage: ApplicationStageType.OFFERED,
    color: '#3490dc',
  },
  {
    stage: ApplicationStageType.ACCEPTED,
    color: '#6574cd',
  },
  {
    stage: ApplicationStageType.REJECTED,
    color: '#9561e2',
  },
  {
    stage: ApplicationStageType.WITHDRAWN,
    color: '#f66d9b',
  },
];

function WorldRoleListCard({ role }: Props) {
  const sumOfStageCounts = role.applicationStages.reduce((acc, stage) => acc + stage.count, 0);

  return (
    <div className="flex flex-col gap-2 shadow-md rounded-lg p-3">
      <div className="flex items-center xs-12 md-4 p-4">
        <CompanyLogo companyUrl={role.company.companyUrl} className="rounded-full max-w-[3rem]" />

        <div className="ml-5 w-[100%] flex flex-col gap-0.5 ">
          <div className="font-bold">{role.title}</div>

          <div className="text-gray-500 text-xs">{`${role.company.name}, ${roleTypeToDisplayStringMap.get(
            role.type,
          )}, ${role.year}`}</div>
        </div>

        <Tooltip title="See Detailed View">
          <Button type="primary" shape="circle" icon={<RightCircleOutlined />} />
        </Tooltip>
      </div>

      {/* Stacked Bar Chart */}
      <div className="flex rounded-lg overflow-hidden text-center">
        {sumOfStageCounts > 0 ? (
          stageColors.map(({ stage, color }) => {
            const stageCount = role.applicationStages.find((s) => s.type === stage)?.count ?? 0;
            const percentage = stageCount / sumOfStageCounts;
            return (
              <Tooltip title={`${stageTypeToDisplayStringMap.get(stage)}: ${stageCount}`} key={stage}>
                <div
                  className="overflow-hidden text-center"
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
      <div className="flex items-center gap-2">
        {stageColors
          .filter(({ stage }) => role.applicationStages.some(({ type }) => stage === type))
          .map(({ stage, color }) => (
            <>
              <div className="w-4 h-4 rounded-md" style={{ backgroundColor: color }}>
                &nbsp;
              </div>
              <div>{stageTypeToDisplayStringMap.get(stage)}</div>
            </>
          ))}
      </div>

      <div className="text-gray-500 text-xs">Total applications: {sumOfStageCounts}</div>
    </div>
  );
}

export default WorldRoleListCard;
