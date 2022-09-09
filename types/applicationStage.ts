import { ApplicationStageType } from '@prisma/client';
import { Nullable } from './utils';

export type ApplicationStageData = {
  id: number;
  type: ApplicationStageType;
  date: Date;
  emojiUnicodeHex: Nullable<string>;
  remark: Nullable<string>;
};
