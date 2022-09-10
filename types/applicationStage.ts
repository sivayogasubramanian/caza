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

export type ApplicationStagePatchData = {
  type?: ApplicationStageType;
  date?: Date;
  emojiUnicodeHex?: Nullable<string>;
  remark?: Nullable<string>;
};
