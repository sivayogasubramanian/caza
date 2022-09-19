import { ApplicationStageType } from '@prisma/client';
import { Nullable } from '../../types/utils';
import { StatusMessageType } from '../../types/apiResponse';

export enum ChronologicalValidationError {
  MORE_THAN_ONE_FINAL_STAGE,
  FINAL_STAGE_OUT_OF_ORDER,
  FIRST_STAGE_OUT_OF_ORDER,
  MORE_THAN_ONE_FIRST_STAGE,
  MISSING_FIRST_STAGE,
}

const FINAL_STAGES: string[] = [
  ApplicationStageType.ACCEPTED,
  ApplicationStageType.REJECTED,
  ApplicationStageType.WITHDRAWN,
];

export const chronologicalErrorMessages = Object.freeze({
  [ChronologicalValidationError.MORE_THAN_ONE_FINAL_STAGE]: {
    type: StatusMessageType.ERROR,
    message: `There can only be at most one final stage out of these: ${FINAL_STAGES.join(
      ', ',
    )}. Please delete the other final stage first.`,
  },
  [ChronologicalValidationError.FINAL_STAGE_OUT_OF_ORDER]: {
    type: StatusMessageType.ERROR,
    message: `The final stages ${FINAL_STAGES.join(', ')} must be the latest in the timeline.`,
  },
  [ChronologicalValidationError.FIRST_STAGE_OUT_OF_ORDER]: {
    type: StatusMessageType.ERROR,
    message: `The stage ${ApplicationStageType.APPLIED} must be the earliest in the timeline.`,
  },
  [ChronologicalValidationError.MORE_THAN_ONE_FIRST_STAGE]: {
    type: StatusMessageType.ERROR,
    message: `The stage ${ApplicationStageType.APPLIED} already exists.`,
  },
  [ChronologicalValidationError.MISSING_FIRST_STAGE]: {
    type: StatusMessageType.ERROR,
    message: `The stage ${ApplicationStageType.APPLIED} must be present.`,
  },
});

/**
 * Takes in a list of stages and if any of the following conditions are out of order, returns a message.
 * - final stage (withdrawn / accepted / rejected) occurs before another stage
 * - more than one final stages
 * - first stage (applied) occurs after another stage
 * - more than one or zero first stages
 *
 * In the interest of user flexibility, having zero first / final stages is tolerated, as is having final / first
 * stages on the same date as other stages.
 */
export function validateStageChronology(
  ...stages: { type: ApplicationStageType; date: Date }[]
): Nullable<ChronologicalValidationError> {
  return (
    hasOneAndOnlyOneAppliedStage(...stages) ??
    hasCorrectOrderForFirstStage(...stages) ??
    hasOnlyOneFinalStage(...stages) ??
    hasCorrectOrderForFinalStage(...stages)
  );
}

function hasOnlyOneFinalStage(
  ...stages: { type: ApplicationStageType; date: Date }[]
): Nullable<ChronologicalValidationError> {
  const finalStages = stages.filter((stage) => FINAL_STAGES.includes(stage.type));
  return finalStages.length > 1 ? ChronologicalValidationError.MORE_THAN_ONE_FINAL_STAGE : null;
}

function hasCorrectOrderForFinalStage(
  ...stages: { type: ApplicationStageType; date: Date }[]
): Nullable<ChronologicalValidationError> {
  const finalStage = stages.find((stage) => FINAL_STAGES.includes(stage.type));
  if (!finalStage) {
    return null;
  }

  for (const stage of stages) {
    if (stage.date > finalStage.date) {
      return ChronologicalValidationError.FINAL_STAGE_OUT_OF_ORDER;
    }
  }
  return null;
}

function hasOneAndOnlyOneAppliedStage(
  ...stages: { type: ApplicationStageType; date: Date }[]
): Nullable<ChronologicalValidationError> {
  const firstStages = stages.filter((stage) => stage.type === ApplicationStageType.APPLIED);
  if (firstStages.length === 0) {
    return ChronologicalValidationError.MISSING_FIRST_STAGE;
  }
  return firstStages.length > 1 ? ChronologicalValidationError.MORE_THAN_ONE_FIRST_STAGE : null;
}

function hasCorrectOrderForFirstStage(
  ...stages: { type: ApplicationStageType; date: Date }[]
): Nullable<ChronologicalValidationError> {
  const firstStage = stages.find((stage) => stage.type === ApplicationStageType.APPLIED);
  if (!firstStage) {
    return null;
  }

  for (const stage of stages) {
    if (stage.date < firstStage.date) {
      return ChronologicalValidationError.FIRST_STAGE_OUT_OF_ORDER;
    }
  }
  return null;
}
