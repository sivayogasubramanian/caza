import { ApplicationStageType } from '@prisma/client';
import { Nullable } from './utils';

export type ApplicationStageApplicationData = {
  id: number;
  type: ApplicationStageType;
  date: string;
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
  date: string;
  emojiUnicodeHex: Nullable<string>;
};
