import { ApplicationStageType } from '@prisma/client';
import { Nullable } from './utils';

export type ApplicationStageApplicationData = {
  id: number;
  type: ApplicationStageType;
  date: Date;
  emojiUnicodeHex: Nullable<string>;
  remark: Nullable<string>;
};

export type ApplicationStageData = ApplicationStageApplicationData & { applicationId: number };

export type ApplicationStagePostData = {
  type: ApplicationStageType;
  date: Date;
  emojiUnicodeHex?: Nullable<string>; // will be set to null if empty or undefined.
  remark?: Nullable<string>; // will be set to null if empty or undefined.
};

export type ApplicationStagePatchData = {
  type?: ApplicationStageType;
  date?: Date;
  emojiUnicodeHex?: Nullable<string>;
  remark?: Nullable<string>;
};

export type ApplicationStageApplicationListData = {
  id: number;
  type: ApplicationStageType;
  date: Date;
  emojiUnicodeHex: Nullable<string>;
};

export enum ChronologicalValidationError {
  MORE_THAN_ONE_FINAL_STAGE,
  FINAL_STAGE_OUT_OF_ORDER,
  FIRST_STAGE_OUT_OF_ORDER,
  MORE_THAN_ONE_FIRST_STAGE,
}

const FINAL_STAGES: string[] = [
  ApplicationStageType.ACCEPTED,
  ApplicationStageType.REJECTED,
  ApplicationStageType.WITHDRAWN,
];

/**
 * Takes in a list of stages and if any of the following conditions are out of order, returns a message.
 * - final stage (withdrawn / accepted / rejected) occurs before another stage
 * - more than one final stage
 * - first stage (applied) occurs after another stage
 * - more than one first stage
 *
 * In the interest of user flexibility, having zero first / final stages is tolerated, as is having final / first
 * stages on the same date as other stages.
 */
export function validateStageChronology(
  ...stages: { type: ApplicationStageType; date: Date }[]
): Nullable<ChronologicalValidationError> {
  const finalStages = stages.filter((stage) => FINAL_STAGES.includes(stage.type));
  if (finalStages.length > 1) {
    return ChronologicalValidationError.MORE_THAN_ONE_FINAL_STAGE;
  }

  if (finalStages.length !== 0) {
    const finalStage = finalStages[0];
    for (const stage of stages) {
      if (stage.date > finalStage.date) {
        return ChronologicalValidationError.FINAL_STAGE_OUT_OF_ORDER;
      }
    }
  }

  const firstStages = stages.filter((stage) => stage.type === ApplicationStageType.APPLIED);
  if (firstStages.length > 1) {
    return ChronologicalValidationError.MORE_THAN_ONE_FIRST_STAGE;
  }

  if (firstStages.length !== 0) {
    const firstStage = firstStages[0];
    for (const stage of stages) {
      if (stage.date < firstStage.date) {
        return ChronologicalValidationError.FIRST_STAGE_OUT_OF_ORDER;
      }
    }
  }

  return null;
}
