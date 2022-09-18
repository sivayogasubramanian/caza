import { FC, useState } from 'react';
import Chart, { GoogleChartWrapper, GoogleViz, GoogleVizEventName, ReactGoogleChartEvent } from 'react-google-charts';
import { RoleApplicationListData } from '../../types/role';
import { WorldRoleStatsData } from '../../types/role';
import CompanyLogo from '../company/CompanyLogo';

export type RoleSankeyProps = { data: WorldRoleStatsData };

const RoleSankey: FC<RoleSankeyProps> = ({ data }) => {
  const [edgeIndex, setEdgeIndex] = useState<number>(-1);
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
        label: {
          color: 'transparent',
          bold: true,
        },
      },
      link: {
        colorMode: 'gradient',
      },
    },
  };

  const chartEvents: ReactGoogleChartEvent[] = [
    {
      eventName: 'ready' as GoogleVizEventName,
      callback: ({ chartWrapper, google }) =>
        addMouseListeners(chartWrapper, google, [({ row }) => setEdgeIndex(row)], [() => setEdgeIndex(-1)]),
    },
  ];

  return (
    <div className="w-full h-40 p-8">
      <RoleCard role={data.role} />
      <Chart chartType="Sankey" data={sankeyData} options={option} chartEvents={chartEvents} />
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
  return `<div class="text-lg rotate-0 md:rotate-270">
      ${source} to ${dest}:<br /> ${userCount} user${userCount > 1 ? 's' : ''}
      took ~${Math.round(((totalNumHours / userCount) * 10) / 24) / 10} days
    </div>`;
}

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
