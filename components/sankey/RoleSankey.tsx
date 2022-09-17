import { FC } from 'react';
import Chart from 'react-google-charts';
import useSWR from 'swr';
import { ROLES_API_ENDPOINT } from '../../api/rolesApi';
import { WORLD_API_ENDPOINT } from '../../api/worldApi';
import { RoleWorldStatsData } from '../../types/world';

export type RoleSankeyProps = { data: RoleWorldStatsData };

const RoleSankey: FC<RoleSankeyProps> = ({ data }) => {
  const sankeyData = [['FROM', 'TO', 'WEIGHT'] as (string | number)[]].concat(
    (data as unknown as RoleWorldStatsData).edges.map((e) => {
      return [e.source, e.dest, e.userCount];
    }),
  );

  return (
    <div>
      <Chart chartType="Sankey" width="80%" height="200px" data={sankeyData} options={{}}></Chart>
    </div>
  );
};

export default RoleSankey;
