import { Nullable } from './utils';
import { Moment } from 'moment';

export type TaskQueryParams = {
  applicationId: string;
  taskId: string;
};

export type TaskPostData = {
  title: string;
  dueDate: string;
  notificationDateTime: Nullable<string>;
};

export type TaskPatchData = {
  title?: string;
  dueDate?: string;
  notificationDateTime?: Nullable<string>;
  isDone?: boolean;
};

export type TaskData = {
  id: number;
  title: string;
  dueDate: string;
  notificationDateTime: Nullable<string>;
  isDone: boolean;
};

export enum NotificationDateTimeType {
  NONE = 'NONE',
  DAY_OF_EVENT = 'DAY_OF_EVENT',
  DAYS_BEFORE = 'DAYS_BEFORE',
  DAYS_AFTER = 'DAYS_AFTER',
  ON_SELECTED_DATE = 'ON_SELECTED_DATE',
}

export type TaskFormData = {
  title?: string;
  dueDate?: Moment;
  notificationDaysOffset: number;
  notificationDateTimeType?: NotificationDateTimeType;
  notificationDate?: Moment;
  notificationTime?: Moment;
  isDone?: boolean;
};
