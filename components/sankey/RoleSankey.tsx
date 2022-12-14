import { FC, useState } from 'react';
import Chart, { GoogleChartWrapper, GoogleViz, GoogleVizEventName, ReactGoogleChartEvent } from 'react-google-charts';
import { RoleApplicationListData } from '../../types/role';
import { WorldRoleStatsData } from '../../types/role';
import { stageTypeToDisplayStringMap } from '../../utils/applicationStage/applicationStageUtils';
import { ApplicationStageType } from '@prisma/client';
import { TAILWIND_MD_BREAKPOINT_PIXELS } from '../../utils/constants';
import NotFound from '../notFound/NotFound';
import { EmptyPayload } from '../../types/apiResponse';

const HAIR_SPACE = ' ';
const ZERO_WIDTH_SPACE = '​';
const INVISIBLE_TOOLTIP = `<div style="width: 0; height: 0;"></div>`;

export type RoleSankeyProps = { data: WorldRoleStatsData | EmptyPayload | undefined };

const RoleSankey: FC<RoleSankeyProps> = ({ data }) => {
  const [edgeIndex, setEdgeIndex] = useState<number>(-1);

  if (!data || !data.edges || data.edges.length === 0) {
    return <NotFound message="The role page you are looking for cannot be found." />;
  }

  const correctedData: WorldRoleStatsData = {
    role: data.role,
    numberOfApplications: data.numberOfApplications,
    nodes: data.nodes.map(nodeIdToUserFacingNodeId),
    edges: data.edges.map(({ source, dest, userCount, totalNumHours }) => {
      return {
        source: nodeIdToUserFacingNodeId(source),
        dest: nodeIdToUserFacingNodeId(dest),
        userCount,
        totalNumHours,
      };
    }),
  };

  const sankeyData = [
    ['FROM', 'TO', 'WEIGHT', { role: 'tooltip', type: 'string', p: { html: true } }] as unknown[],
  ].concat(
    (correctedData as unknown as WorldRoleStatsData).edges.map((e) => {
      return [e.source, e.dest, e.userCount, INVISIBLE_TOOLTIP];
    }),
  );

  const chartEvents: ReactGoogleChartEvent[] = [
    {
      eventName: 'ready' as GoogleVizEventName,
      callback: ({ chartWrapper, google }) =>
        addMouseListeners(chartWrapper, google, [({ row }) => setEdgeIndex(row)], [() => setEdgeIndex(-1)]),
    },
  ];

  const option = {
    tooltip: { isHtml: true, trigger: 'selection' },
    sankey: {
      node: {
        label: { bold: true },
        tooltip: { isHtml: true, trigger: 'selection' },
      },
      link: {
        colorMode: 'gradient',
        tooltip: { trigger: 'none' },
      },
      allowHtml: true,
      tooltip: { isHtml: true, trigger: 'selection' },
    },
  };

  const width = getSankeyWidth();
  const getChart = (width: number) => {
    return (
      <div className="flex-col h-full w-full p-4 items-center">
        <Chart
          chartType="Sankey"
          className="h-full w-full rotate-90 md:rotate-0"
          height={width < TAILWIND_MD_BREAKPOINT_PIXELS ? width : undefined}
          width={width >= TAILWIND_MD_BREAKPOINT_PIXELS ? width : undefined}
          data={sankeyData}
          options={option}
          chartEvents={chartEvents}
        />
        <MouseOverOverlay data={correctedData} edgeIndex={edgeIndex} />
      </div>
    );
  };

  return (
    <div className="flex-col items-center w-full h-full">
      <RoleCard role={correctedData.role} />
      <div>{getChart(width)}</div>
    </div>
  );
};

type RoleCardProps = { role: RoleApplicationListData };

const RoleCard: FC<RoleCardProps> = ({ role }) => {
  return (
    <div className="mt-2 p-2 pb-4 bg-primary-three rounded-b-3xl">
      <div className="text-2xl font-bold text-primary-four">{`${role.title} @ ${role.company.name}`}</div>
    </div>
  );
};

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

type MouseOverOverlayProps = { data: WorldRoleStatsData; edgeIndex: number; nodeTitle?: string };

const MouseOverOverlay: FC<MouseOverOverlayProps> = ({ data, edgeIndex }) => {
  if (edgeIndex < 0 || edgeIndex >= data.edges.length) {
    return null;
  }
  const targetEdge = data.edges[edgeIndex];
  const { source, dest, totalNumHours, userCount } = targetEdge;
  return (
    <div className="text-lg pt-4">
      {source} to {dest}:<br /> Based on {userCount} experience{userCount > 1 ? 's' : ''}, progression between these
      stages took an average of {Math.round(((totalNumHours / userCount) * 10) / 24) / 10} days
    </div>
  );
};

type SankeyMouseEvent = { row: number; name?: string };

// Typing for Google Chart is very suspect.
/* eslint-disable */
function addMouseListeners(
  chartWrapper: GoogleChartWrapper,
  google: GoogleViz,
  mouseOverListeners: ((e: SankeyMouseEvent) => void)[],
  mouseOutListeners: ((e: SankeyMouseEvent) => void)[],
) {
  google.visualization.events.addListener(
    chartWrapper.getChart() as any,
    'onmouseover' as GoogleVizEventName,
    (e: any) => {
      mouseOverListeners.forEach((fn) => fn(e as SankeyMouseEvent));
    },
  );
  google.visualization.events.addListener(chartWrapper.getChart() as any, 'onmouseout' as any, (e: any) => {
    mouseOutListeners.forEach((fn) => fn(e as SankeyMouseEvent));
  });
}
/* eslint-enable */

export default RoleSankey;
