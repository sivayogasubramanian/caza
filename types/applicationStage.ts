import { ApplicationStageType } from '@prisma/client';
import { Nullable } from './utils';

export const ApplicationStageTypeToLabelMap = Object.freeze({
  [ApplicationStageType.APPLIED]: 'Applied',
  [ApplicationStageType.ONLINE_ASSESSMENT]: 'Online Assessment',
  [ApplicationStageType.TECHNICAL]: 'Technical Round',
  [ApplicationStageType.NON_TECHNICAL]: 'Non-Technical Round',
  [ApplicationStageType.MIXED]: 'Mixed Round',
  [ApplicationStageType.OFFERED]: 'Offered',
  [ApplicationStageType.ACCEPTED]: 'Accepted',
  [ApplicationStageType.REJECTED]: 'Rejected',
  [ApplicationStageType.WITHDRAWN]: 'Withdrawn',
});

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
