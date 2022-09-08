import { ApplicationStageType } from '@prisma/client';
import { Nullable } from './utils';

export type ApplicationStageData = {
  id: number;
  type: ApplicationStageType;
  date: Date;
  emojiUnicodeHex: Nullable<string>;
  remark: Nullable<string>;
};

export type ApplicationStagePatchData = {
  type: ApplicationStageType;
  date: Date;
  emojiUnicodeHex: string | null;
  remark: string | null;
};
