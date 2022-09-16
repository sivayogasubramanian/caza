import { TaskData } from '../../types/task';
import { makeDisplayDate, makeDisplayNotificationDatetime } from '../../utils/date/formatters';
import NotificationBell from '../icons/notifiationBellIcon';
import { Checkbox } from 'antd';
import { isValidDate } from '../../utils/date/validations';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import tasksApi from '../../api/tasksApi';
import { Dispatch, SetStateAction } from 'react';

interface Props {
  applicationId: number;
  task: TaskData;
  setShouldFetchData: Dispatch<SetStateAction<boolean>>;
}

function ApplicationTaskTimelineCard({ applicationId, task, setShouldFetchData }: Props) {
  const dueDate = isValidDate(task.dueDate) ? new Date(task.dueDate) : undefined;

  const notificationDateTime =
    task.notificationDateTime && isValidDate(task.notificationDateTime)
      ? new Date(task.notificationDateTime)
      : undefined;

  const onToggleCheckbox = (e: CheckboxChangeEvent) => {
    tasksApi.editTask(applicationId, task.id, { isDone: e.target.checked }).then(() => setShouldFetchData(true));
  };

  return (
    <div className="shadow-md rounded-lg">
      <div className="mt-1 mb-1 ml-1 mr-1">
        <div className="grid grid-cols-4 gap-2">
          <div className="flex items-start gap-1 col-span-3">
            <Checkbox className="mt-1 rounded-full" checked={task.isDone} onChange={onToggleCheckbox} />
            <div className="text-lg font-bold">{task.title}</div>
          </div>

          {dueDate && <div className="flex items-start justify-end">{makeDisplayDate(dueDate)}</div>}
        </div>

        {notificationDateTime && dueDate && (
          <div className="flex justify-end items-center gap-1">
            <NotificationBell />
            <div className="text-gray-700">{makeDisplayNotificationDatetime(notificationDateTime, dueDate)}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ApplicationTaskTimelineCard;
