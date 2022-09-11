import { Nullable } from './utils';

export type TaskQueryParams = {
  applicationId: string;
  taskId: string;
};

export type TaskPostData = {
  title: string;
  dueDate: Date;
  notificationDateTime: Nullable<Date>;
};

export type TaskPatchData = {
  title?: string;
  dueDate?: Date;
  notificationDateTime?: Nullable<Date>;
  isDone?: boolean;
};

export type TaskData = {
  id: number;
  title: string;
  dueDate: Date;
  notificationDateTime: Nullable<Date>;
  isDone: boolean;
};
