import { Task } from '@prisma/client';
import { TaskData } from '../../types/task';

export function convertTaskToPayload(task: Task): TaskData {
  const { id, title, dueDate, notificationDateTime, isDone } = task;
  return {
    id,
    title,
    dueDate: dueDate.toJSON(),
    notificationDateTime: notificationDateTime?.toJSON() ?? null,
    isDone,
  };
}
