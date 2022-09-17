import { FC, useState } from 'react';
import Chart, { GoogleChartWrapper, GoogleViz, GoogleVizEventName, ReactGoogleChartEvent } from 'react-google-charts';
import { RoleWorldStatsData } from '../../types/world';

export type RoleSankeyProps = { data: RoleWorldStatsData };
type SankeyMouseEvent = { row: number; name?: string };

const RoleSankey: FC<RoleSankeyProps> = ({ data }) => {
  const [edgeIndex, setEdgeIndex] = useState<number>(-1);
  if (!data) {
    // This should be hidden with a antd Spinner element.
    return <div></div>;
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
        addMouseListeners(chartWrapper, google, [({ row }) => setEdgeIndex(row)], []),
    },
  ];

  return (
    <div className="w-full h-40 p-8">
      <Chart chartType="Sankey" data={sankeyData} options={option} chartEvents={chartEvents} />
      <MouseOverOverlay data={data} edgeIndex={edgeIndex} />
    </div>
  );
};

type MouseOverOverlayProps = { data: RoleWorldStatsData; edgeIndex: number; nodeTitle?: string };

const MouseOverOverlay: FC<MouseOverOverlayProps> = ({ data, edgeIndex }) => {
  if (edgeIndex < 0) {
    return <div>Nothing in focus.</div>;
  }
  const targetEdge = data.edges[edgeIndex];
  const { source, dest, totalNumHours, userCount } = targetEdge;
  return (
    <div>
      WIP: {source} to {dest}:<br /> based on {userCount} experience{userCount > 1 ? 's' : ''}, on average this stage
      took {Math.round(((totalNumHours / userCount) * 10) / 24) / 10} days
    </div>
  );
};

/* eslint-disable */
function addMouseListeners(
  chartWrapper: GoogleChartWrapper,
  google: GoogleViz,
  mouseOutListeners: ((e: SankeyMouseEvent) => void)[],
  mouseOverListeners: ((e: SankeyMouseEvent) => void)[],
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
