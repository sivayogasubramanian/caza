import { ApplicationStageType } from '@prisma/client';
import { FC } from 'react';
import Chart from 'react-google-charts';

const SAMPLE: PathData[] = [
  createSampleData(),
  createSampleData('ONLINE_ASSESSMENT'),
  createSampleData('ONLINE_ASSESSMENT', 'NON_TECHNICAL'),
  createSampleData('ONLINE_ASSESSMENT', 'NON_TECHNICAL', 'TECHNICAL'),
  { stages: ['APPLIED'], daysToNext: [] },
  { stages: ['APPLIED', 'REJECTED'], daysToNext: [5] },
  { stages: ['APPLIED', 'ONLINE_ASSESSMENT', 'REJECTED'], daysToNext: [5, 7] },
  { stages: ['APPLIED', 'ONLINE_ASSESSMENT', 'NON_TECHNICAL', 'REJECTED'], daysToNext: [5, 3, 8] },
];

function createSampleData(...stages: ApplicationStageType[]): PathData {
  return {
    stages: ['APPLIED', ...stages, 'ACCEPTED'] as ApplicationStageType[],
    daysToNext: [5, ...stages.map(() => 1)],
  };
}

type INTERMEDIATE_STAGE = 'ONLINE_ASSESSMENT' | 'TECHNICAL' | 'NON_TECHNICAL' | 'MIXED' | 'OFFERED';
const INTERMEDIATE_STAGES = ['ONLINE_ASSESSMENT', 'TECHNICAL', 'NON_TECHNICAL', 'MIXED', 'OFFERED'];
type FINAL_STAGE = 'REJECTED' | 'WITHDRAWN' | 'ACCEPTED';
const FINAL_STAGES = ['REJECTED', 'WITHDRAWN', 'ACCEPTED'];

type NodeIdentifier =
  | 'APPLIED'
  | FINAL_STAGE
  | {
      stage: INTERMEDIATE_STAGE;
      previousStages: ApplicationStageType[];
    };

interface Edge {
  previous: NodeIdentifier;
  next: NodeIdentifier;
  numberOfDays: number;
}

interface PathData {
  stages: ApplicationStageType[];

  // Represents number of days in interval
  // has exactly one less element than stages.
  daysToNext: number[];
}

function convertPathToEdges({ stages, daysToNext }: PathData): Edge[] {
  // Assumes the order makes sense (only one APPLIED, maximum of one FINAL_STAGE, and APPLIED is source, FINAL_STAGE
  // if it exists is destination)
  // Assumes the stages.length === daysToNext.length + 1

  const n = stages.length;

  // APPLIED only.
  if (n === 1) {
    return [];
  }

  let edges: Edge[] = [];
  let previous: NodeIdentifier = stages[0] as 'APPLIED';
  let stagesSoFar: ApplicationStageType[] = [previous];
  for (let x = 0; x < n - 1; x++) {
    const rawNext = stages[x + 1];
    const numberOfDays = daysToNext[x];

    let next: NodeIdentifier;
    let edge: Edge;

    if (FINAL_STAGES.includes(rawNext)) {
      next = rawNext as FINAL_STAGE;
      edge = { previous, next, numberOfDays };
    } else if (INTERMEDIATE_STAGES.includes(rawNext)) {
      next = { stage: rawNext as INTERMEDIATE_STAGE, previousStages: [...stagesSoFar] };
      edge = { previous, next, numberOfDays };

      stagesSoFar = stagesSoFar.concat(rawNext as INTERMEDIATE_STAGE);
    } else {
      throw new Error(`Unable to match ${rawNext} to a stage.`);
    }

    edges = edges.concat(edge);
    previous = next;
  }

  return edges;
}

function nodeIdentifierToString(node: NodeIdentifier): string {
  if (typeof node === 'string') {
    return node;
  }
  const { stage, previousStages } = node;
  return `${stage}:${previousStages.join(',')}`;
}

function convertEdgesToSankeyData(edges: Edge[]): (string | number)[][] {
  const map: Record<string, Record<string, { sum: number; count: number }>> = {};
  for (const edge of edges) {
    const { next, previous, numberOfDays } = edge;
    const src = nodeIdentifierToString(previous);
    const dest = nodeIdentifierToString(next);
    const srcEdges = map[src] ?? {};
    const srcDestAmount = srcEdges[dest] ?? { sum: 0, count: 0 };
    srcEdges[dest] = { sum: srcDestAmount.sum + numberOfDays, count: srcDestAmount.count + 1 };
    map[src] = srcEdges;
  }

  let result: { src: string; dest: string; avgNumDays: number }[] = [];
  for (const src in map) {
    for (const dest in map[src]) {
      const { sum, count } = map[src][dest];
      result = result.concat({ src, dest, avgNumDays: sum / count });
    }
  }
  return result.map((res) => [res.src, res.dest, res.avgNumDays]);
}

export type RoleSankeyProps = Record<string, never>; // for now.

const RoleSankey: FC<RoleSankeyProps> = () => {
  const data = [['FROM', 'TO', 'WEIGHT'] as (string | number)[]].concat(
    SAMPLE.map(convertPathToEdges).flatMap(convertEdgesToSankeyData),
  );

  return (
    <div>
      <Chart chartType="Sankey" width="80%" height="200px" data={data} options={{}}></Chart>
    </div>
  );
};

export default RoleSankey;
