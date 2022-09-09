import { Nullable } from './utils';

export type TaskPostData = {
  title: string;
  dueDate: Date;
  notificationDateTime: Nullable<Date>;
};

export type TaskData = {
  id: number;
  title: string;
  dueDate: Date;
  notificationDateTime: Nullable<Date>;
  isDone: boolean;
};
