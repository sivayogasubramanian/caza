import { TaskData } from '../../types/task';
import { makeDisplayDate, makeDisplayNotificationDatetime } from '../../utils/date/formatters';
import NotificationBell from '../icons/notifiationBell';
import { Checkbox } from 'antd';

interface Props {
  task: TaskData;
}

function ApplicationTaskTimelineCard({ task }: Props) {
  return (
    <div className="shadow-md rounded-lg">
      <div className="mt-1 mb-1 ml-1 mr-1">
        <div className="grid grid-cols-3 gap-2">
          <div className="flex items-start gap-1 col-span-2">
            <Checkbox className="mt-1" checked={task.isDone} />
            <div className="text-lg font-bold">{task.title}</div>
          </div>

          <div className="flex items-start justify-end">{makeDisplayDate(task.dueDate)}</div>
        </div>

        {task.notificationDateTime && (
          <div className="flex justify-end items-center gap-1">
            <NotificationBell />
            <div className="text-gray-700">
              {makeDisplayNotificationDatetime(task.notificationDateTime, task.dueDate)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ApplicationTaskTimelineCard;
