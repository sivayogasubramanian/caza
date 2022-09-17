import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { NotificationDateTimeType, TaskData, TaskFormData, TaskPatchData } from '../../types/task';
import { isValidDate } from '../../utils/date/validations';
import { calculateDaysOffset } from '../../utils/date/formatters';
import { Nullable } from '../../types/utils';
import Modal from './Modal';
import TaskForm from '../forms/TaskForm';
import tasksApi from '../../api/tasksApi';

interface Props {
  applicationId: number;
  initialTask: TaskData;
  setSelectedTask: React.Dispatch<React.SetStateAction<Nullable<TaskData>>>;
}

function EditTaskModal({ applicationId, initialTask, setSelectedTask }: Props) {
  const [task, setTask] = useState(initialTask);
  const [initialValues, setInitialValues] = useState<TaskFormData>({
    notificationDaysOffset: 1,
  });

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

  const onSubmit = (values: TaskFormData) => {
    const taskPatchData: TaskPatchData = {
      title: values.title,
      dueDate: values.dueDate?.toISOString(),
      notificationDateTime: getNotificationDateTime(values),
      isDone: values.isDone,
    };

    tasksApi.editTask(applicationId, task.id, taskPatchData).then((value) => {
      const updatedTask = value.payload as TaskData;
      setTask(updatedTask);
    });
  };

  const getNotificationDateTime = (values: TaskFormData) => {
    const notificationTime = values.notificationTime?.utc().format('HH:mm:ss');

    switch (values.notificationDateTimeType) {
      case NotificationDateTimeType.NONE:
        return null;
      case NotificationDateTimeType.DAY_OF_EVENT:
        const dueDate = values.dueDate?.utc().format('YYYY-MM-DD');
        return dueDate && notificationTime ? `${dueDate}T${notificationTime}Z` : undefined;
      case NotificationDateTimeType.DAYS_BEFORE:
        const beforeDueDate = values.dueDate
          ?.subtract(values.notificationDaysOffset, 'days')
          .utc()
          .format('YYYY-MM-DD');
        return beforeDueDate && notificationTime ? `${beforeDueDate}T${notificationTime}Z` : undefined;
      case NotificationDateTimeType.DAYS_AFTER:
        const afterDueDate = values.dueDate?.add(values.notificationDaysOffset, 'days').utc().format('YYYY-MM-DD');
        return afterDueDate && notificationTime ? `${afterDueDate}T${notificationTime}Z` : undefined;
      case NotificationDateTimeType.ON_SELECTED_DATE:
        return values.notificationDateTime?.toISOString();
    }
  };

  const formContent = () => (
    <TaskForm
      initialValues={initialValues}
      shouldTouchAllCompulsoryFields={false}
      shouldAllowMarkDone={true}
      onCancel={onCancel}
      onSubmit={onSubmit}
    />
  );

  return <Modal title="Edit Task" content={formContent()} />;
}

export default EditTaskModal;
