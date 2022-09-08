export type TaskPostData = {
  title: string;
  dueDate: Date;
  notificationDateTime: Date | null;
};

export type TaskData = {
  id: number;
  title: string;
  dueDate: Date;
  notificationDateTime: Date | null;
  isDone: boolean;
};
