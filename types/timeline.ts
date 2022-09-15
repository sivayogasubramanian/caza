import { ApplicationStageApplicationData } from './applicationStage';
import { TaskData } from './task';

export enum TimelineType {
  STAGE = 'STAGE',
  TASK = 'TASK',
}

export type TimelineData = {
  date: Date;
  type: TimelineType;
  data: ApplicationStageApplicationData | TaskData;
};
