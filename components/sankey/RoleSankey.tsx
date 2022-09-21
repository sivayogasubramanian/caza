import { FC } from 'react';
import Chart from 'react-google-charts';
import { RoleApplicationListData } from '../../types/role';
import { WorldRoleStatsData } from '../../types/role';
import CompanyLogo from '../company/CompanyLogo';
import { renderToString } from 'react-dom/server';
import { stageTypeToDisplayStringMap } from '../../utils/applicationStage/applicationStageUtils';
import { ApplicationStageType } from '@prisma/client';
import { TAILWIND_MD_BREAKPOINT_PIXELS } from '../../utils/constants';

const HAIR_SPACE = ' ';
const ZERO_WIDTH_SPACE = '​';

export type RoleSankeyProps = { data: WorldRoleStatsData };

const RoleSankey: FC<RoleSankeyProps> = ({ data }) => {
  // useEffect(() => {
  //   const handleResize = () => setWidth(getSankeyWidth());
  //   window.addEventListener('resize', handleResize);
  //   return () => window.removeEventListener('resize', handleResize);
  // }, []);

  if (!data) {
    // This should be hidden with a antd Spinner element.
    return <div></div>;
  }

  if (data.edges.length === 0) {
    return (
      <div className="w-full h-40 p-8">
        <RoleCard role={data.role} />
        <div className="text-2xl">The role you have selected does not have enough data to be displayed.</div>
      </div>
    );
  }

  data.nodes = data.nodes.map(nodeIdToUserFacingNodeId);
  data.edges = data.edges.map(({ source, dest, userCount, totalNumHours }) => {
    return { source: nodeIdToUserFacingNodeId(source), dest: nodeIdToUserFacingNodeId(dest), userCount, totalNumHours };
  });
  console.log(data);

  const sankeyData = [
    ['FROM', 'TO', 'WEIGHT', { role: 'tooltip', type: 'string', p: { html: true } }] as unknown[],
  ].concat(
    (data as unknown as WorldRoleStatsData).edges.map((e, index) => {
      return [e.source, e.dest, e.userCount, createTooltip(data, index)];
    }),
  );

  const option = {
    tooltip: { isHtml: true },
    sankey: {
      node: {
        label: { bold: true },
        interactivity: true,
      },
      link: {
        colorMode: 'gradient',
      },
      allowHtml: 'true',
      tooltip: { isHtml: true },
    },
  };

  const width = getSankeyWidth();
  const getChart = (width: number) => {
    return (
      <div className="absolute" style={{ width }}>
        <Chart
          chartType="Sankey"
          className="top-0 left-0 rotate-90 md:rotate-0"
          height={width < TAILWIND_MD_BREAKPOINT_PIXELS ? width : undefined}
          width={width >= TAILWIND_MD_BREAKPOINT_PIXELS ? width : undefined}
          data={sankeyData}
          options={option}
        />
      </div>
    );
  };

  return (
    <div className="w-full h-40 p-8">
      <RoleCard role={data.role} />
      <div className="absolute">{getChart(width)}</div>
    </div>
  );
};

type RoleCardProps = { role: RoleApplicationListData };

const RoleCard: FC<RoleCardProps> = ({ role }) => {
  return (
    <div className="p-4 flex items-center">
      <CompanyLogo company={role.company} className="rounded-full max-w-[5rem]" />

      <div className="ml-5 w-[100%] flex flex-col gap-0.5">
        <div className="text-sm">{role.company.name}</div>
        <div className="flex items-start justify-between">
          <div className="text-2xl">{role.title}</div>
        </div>
      </div>
    </div>
  );
};

function createTooltip(data: WorldRoleStatsData, edgeIndex: number): string {
  const targetEdge = data.edges[edgeIndex];
  const { source, dest, totalNumHours, userCount } = targetEdge;

  const element = (
    <div className="absolute h-0 w-0">
      <div className="relative top-[100px] md:top-0 overflow-visible w-[200px] -rotate-90 md:rotate-0">
        {source} to {dest}:<br /> {userCount} user{userCount > 1 ? 's ' : ' '}
        took ~{Math.round(((totalNumHours / userCount) * 10) / 24) / 10} days
      </div>
    </div>
  );
  return renderToString(element);
}

function nodeIdToUserFacingNodeId(raw: string) {
  const stages = raw.split(':');
  const mainStage = stageTypeToDisplayStringMap.get(stages[0] as ApplicationStageType) as string;
  stages.shift();
  const otherInvisibleStages = stages.map(createInvisibleRepresentation);
  return [mainStage, ...otherInvisibleStages].join('');
}

function getSankeyWidth() {
  return window.innerWidth * 0.9;
}

const stagesToInvisible: Record<string, number> = Object.freeze({
  APPLIED: 1,
  ONLINE_ASSESSMENT: 2,
  TECHNICAL: 3,
  NON_TECHNICAL: 4,
  MIXED: 5,
  OFFERED: 6,
  ACCEPTED: 7,
  REJECTED: 8,
  WITHDRAWN: 9,
});

function createInvisibleRepresentation(stage: string) {
  return HAIR_SPACE + ZERO_WIDTH_SPACE.repeat(stagesToInvisible[stage]);
}

export default RoleSankey;
