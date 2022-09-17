import { FC, useState } from 'react';
import Chart, { GoogleChartWrapper, GoogleViz, GoogleVizEventName, ReactGoogleChartEvent } from 'react-google-charts';
import { RoleApplicationListData } from '../../types/role';
import { RoleWorldStatsData } from '../../types/world';
import CompanyLogo from '../company/CompanyLogo';

export type RoleSankeyProps = { data: RoleWorldStatsData };
type SankeyMouseEvent = { row: number; name?: string };

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

  const sankeyData = [['FROM', 'TO', 'WEIGHT'] as (string | number)[]].concat(
    (data as unknown as RoleWorldStatsData).edges.map((e) => {
      return [e.source, e.dest, e.userCount];
    }),
  );

  const option = {
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
      <MouseOverOverlay data={data} edgeIndex={edgeIndex} />
    </div>
  );
};

type RoleCardProps = { role: RoleApplicationListData };

const RoleCard: FC<RoleCardProps> = ({ role }) => {
  return (
    <div className="p-4 flex items-center">
      <CompanyLogo companyUrl={role.company.companyUrl} className="rounded-full max-w-[5rem]" />

      <div className="ml-5 w-[100%] flex flex-col gap-0.5">
        <div className="text-sm">{role.company.name}</div>
        <div className="flex items-start justify-between">
          <div className="text-2xl">{role.title}</div>
        </div>
      </div>
    </div>
  );
};

type MouseOverOverlayProps = { data: RoleWorldStatsData; edgeIndex: number; nodeTitle?: string };

const MouseOverOverlay: FC<MouseOverOverlayProps> = ({ data, edgeIndex }) => {
  if (edgeIndex < 0) {
    return <div className="text-lg">Nothing in focus.</div>;
  }
  const targetEdge = data.edges[edgeIndex];
  const { source, dest, totalNumHours, userCount } = targetEdge;
  return (
    <div className="text-lg">
      Labels WIP: {source} to {dest}:<br /> based on {userCount} experience{userCount > 1 ? 's' : ''}, on average this
      stage took {Math.round(((totalNumHours / userCount) * 10) / 24) / 10} days
    </div>
  );
};

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
