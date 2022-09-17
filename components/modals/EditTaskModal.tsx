import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { NotificationDateTimeType, TaskData, TaskFormData } from '../../types/task';
import { isValidDate } from '../../utils/date/validations';
import { calculateDaysOffset } from '../../utils/date/formatters';
import { Nullable } from '../../types/utils';
import Modal from './Modal';
import TaskForm from '../forms/TaskForm';

interface Props {
  initialTask: TaskData;
  setSelectedTask: React.Dispatch<React.SetStateAction<Nullable<TaskData>>>;
}

function EditTaskModal({ initialTask, setSelectedTask }: Props) {
  const [task, setTask] = useState(initialTask);
  const [initialValues, setInitialValues] = useState<TaskFormData>({});

  useEffect(() => {
    const taskDueDate = isValidDate(task.dueDate) ? new Date(task.dueDate) : undefined;
    const taskDueDateMoment = taskDueDate !== undefined ? moment(taskDueDate) : undefined;
    const taskNotificationDateTime =
      task.notificationDateTime !== null && isValidDate(task.notificationDateTime)
        ? new Date(task.notificationDateTime)
        : undefined;
    const taskNotificationDateTimeMoment =
      taskNotificationDateTime !== undefined ? moment(taskNotificationDateTime) : undefined;
    const calculatedNotificationDaysOffset =
      taskDueDate && taskNotificationDateTime ? calculateDaysOffset(taskNotificationDateTime, taskDueDate) : 1;
    const notificationDateTimeType =
      taskNotificationDateTime === undefined
        ? NotificationDateTimeType.NONE
        : calculatedNotificationDaysOffset === 0
        ? NotificationDateTimeType.DAY_OF_EVENT
        : calculatedNotificationDaysOffset > 0
        ? NotificationDateTimeType.DAYS_BEFORE
        : NotificationDateTimeType.DAYS_AFTER;

    setInitialValues({
      title: task.title,
      dueDate: taskDueDateMoment,
      notificationTime: taskNotificationDateTimeMoment,
      notificationDateTime: taskNotificationDateTimeMoment,
      notificationDaysOffset: Math.abs(calculatedNotificationDaysOffset),
      notificationDateTimeType: notificationDateTimeType,
      notificationDate: taskNotificationDateTimeMoment,
      isDone: task.isDone,
    });
  }, [task]);

  const onCancel = () => {
    setSelectedTask(null);
  };

  const formContent = () => (
    <>
      <div className="text-lg font-bold mt-1 mb-1 ml-2 mr-2">Edit Task</div>
      <TaskForm
        initialValues={initialValues}
        onCancel={onCancel}
        shouldTouchAllCompulsoryFields={false}
        shouldAllowMarkDone={true}
      />
    </>
  );

  return <Modal content={formContent()} />;
}

export default EditTaskModal;
