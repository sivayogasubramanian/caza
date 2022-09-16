import { ApplicationStage } from '@prisma/client';
import { ApplicationStageData } from '../../types/applicationStage';

export function convertApplicationStageToPayload(stage: ApplicationStage): ApplicationStageData {
  const { id, type, date, emojiUnicodeHex, remark, applicationId } = stage;
  return { id, type, date: date.toJSON(), emojiUnicodeHex, remark, applicationId };
}
