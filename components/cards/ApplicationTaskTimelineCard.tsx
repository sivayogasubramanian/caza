import { Checkbox } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { KeyedMutator } from 'swr';
import tasksApi from '../../frontendApis/tasksApi';
import { ApiResponse } from '../../types/apiResponse';
import { ApplicationData } from '../../types/application';
import { TaskData } from '../../types/task';
import { makeDisplayDate, makeDisplayNotificationDatetime } from '../../utils/date/formatters';
import { isValidDate } from '../../utils/date/validations';
import NotificationBell from '../icons/NotificationBellIcon';

interface Props {
  applicationId: number;
  task: TaskData;
  mutateApplicationData: KeyedMutator<ApiResponse<ApplicationData>>;
  onClick?: () => void;
}

function ApplicationTaskTimelineCard({ applicationId, task, mutateApplicationData, onClick }: Props) {
  const dueDate = isValidDate(task.dueDate) ? new Date(task.dueDate) : undefined;

  const notificationDateTime =
    task.notificationDateTime && isValidDate(task.notificationDateTime)
      ? new Date(task.notificationDateTime)
      : undefined;

  const onToggleCheckbox = (e: CheckboxChangeEvent) => {
    tasksApi.editTask(applicationId, task.id, { isDone: e.target.checked }).then(() => mutateApplicationData());
  };

  return (
    <div className="shadow-md rounded-lg cursor-pointer hover:shadow-lg" onClick={onClick}>
      <div className="p-2">
        <div className="grid grid-cols-4 gap-2">
          <div className="flex items-center gap-2 col-span-3">
            <Checkbox
              className="rounded-full"
              checked={task.isDone}
              onChange={onToggleCheckbox}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="font-bold">{task.title}</div>
          </div>

          {dueDate && <div className="flex items-start justify-end text-xs">{makeDisplayDate(dueDate)}</div>}
        </div>

        {notificationDateTime && dueDate && (
          <div className="mt-2 flex justify-end items-center gap-1">
            <NotificationBell />
            <div className="text-xs text-gray-700">
              {makeDisplayNotificationDatetime(notificationDateTime, dueDate)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ApplicationTaskTimelineCard;
