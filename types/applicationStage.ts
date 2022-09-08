import { ApplicationStageType } from '@prisma/client';

export type ApplicationStageData = {
  id: number;
  type: ApplicationStageType;
  date: Date;
  emojiUnicodeHex: string | null;
  remark: string | null;
};
