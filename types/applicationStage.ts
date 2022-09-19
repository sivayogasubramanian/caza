import { ApplicationStageType } from '@prisma/client';
import { Nullable } from './utils';
import { Moment } from 'moment';

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
  date: string;
  emojiUnicodeHex?: Nullable<string>; // will be set to null if empty or undefined.
  remark?: Nullable<string>; // will be set to null if empty or undefined.
};

export type ApplicationStagePatchData = {
  type?: ApplicationStageType;
  date?: string;
  emojiUnicodeHex?: Nullable<string>;
  remark?: Nullable<string>;
};

export type ApplicationStageApplicationListData = {
  id: number;
  type: ApplicationStageType;
  date: string;
  emojiUnicodeHex: Nullable<string>;
};

export type ApplicationStageFormData = {
  type?: ApplicationStageType;
  date?: Moment;
  emojiUnicodeHex?: Nullable<string>;
  remark?: Nullable<string>;
};

export type ApplicationStageChronologicalData = {
  type: ApplicationStageType;
  date: Date;
};
