import { FC, useState } from 'react';
import Chart, { GoogleChartWrapper, GoogleViz, GoogleVizEventName, ReactGoogleChartEvent } from 'react-google-charts';
import { RoleApplicationListData } from '../../types/role';
import { WorldRoleStatsData } from '../../types/role';
import CompanyLogo from '../company/CompanyLogo';
import { renderToString } from 'react-dom/server';
import { stageTypeToDisplayStringMap } from '../../utils/applicationStage/applicationStageUtils';
import { ApplicationStageType } from '@prisma/client';

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
    tooltip: { isHtml: true, trigger: 'selection' },
    sankey: {
      node: {
        label: { bold: true },
        interactivity: true,
      },
      link: {
        colorMode: 'gradient',
      },
      allowHtml: 'true',
      tooltip: { isHtml: true, trigger: 'selection' },
    },
  };

  const chartEvents: ReactGoogleChartEvent[] = [
    {
      eventName: 'ready' as GoogleVizEventName,
      callback: ({ chartWrapper, google }) => setAllSelectedAlways(data, chartWrapper, google),
    },
  ];

  return (
    <div className="w-full h-40 p-8">
      <RoleCard role={data.role} />
      <Chart
        // className="[&>div>div>div>svg>g>text]:[font-style=italic]"
        className="[&>div]:[font-style=italic]"
        // className="[&>div>div>div>svg>g>text]:[transform-box=fill-box] [&>div>div>div>svg>g>text]:[transform=rotate(90deg)]"
        chartType="Sankey"
        data={sankeyData}
        options={option}
        chartEvents={chartEvents}
      />
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
  const sourceUserFacing = stageTypeToDisplayStringMap.get(source.split(':')[0] as ApplicationStageType);
  const destUserFacing = stageTypeToDisplayStringMap.get(dest.split(':')[0] as ApplicationStageType);

  const element = (
    <div className="w-0 h-0 relative">
      <div className="origin-bottom-left rotate-90 absolute left-0 right-0 top-0 bottom-0">
        {sourceUserFacing} to {destUserFacing}:<br /> {userCount} user{userCount > 1 ? 's ' : ' '}
        took ~{Math.round(((totalNumHours / userCount) * 10) / 24) / 10} days
      </div>
    </div>
  );
  return renderToString(element);
}

// Typing for Google Chart is very suspect.
/* eslint-disable */
function setAllSelectedAlways(data: WorldRoleStatsData, chartWrapper: GoogleChartWrapper, google: GoogleViz) {
  const { nodes } = data;
  const dataTable = chartWrapper.getDataTable();
  (chartWrapper.getChart() as any).setSelection(
    nodes.map((name, row) => {
      const edgeIndex = data.edges.map((e) => e.dest).indexOf(name);
      const div = edgeIndex >= 0 ? createTooltip(data, edgeIndex) : '<div>Foo Fah</div>';
      dataTable?.setValue(row, 3, div);
      return { row, name, column: null };
    }),
  );
  console.log(dataTable);
  google.visualization.events.addListener(
    chartWrapper.getChart() as any,
    'onmouseover' as GoogleVizEventName,
    (e: any) => {
      console.log(nodes.indexOf(e.name));
      console.log(e);
    },
  );
  google.visualization.events.addListener(chartWrapper.getChart() as any, 'onmouseout' as any, (e: any) => {
    console.log(chartWrapper.getChart().getSelection());
  });
}
/* eslint-enable */

export default RoleSankey;
