import { Nullable } from './utils';

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

export type TaskApiData = {
  id: number;
  title: string;
  dueDate: string;
  notificationDateTime: Nullable<string>;
  isDone: boolean;
};
