import React, { Dispatch, SetStateAction } from 'react';
import TaskForm from '../forms/TaskForm';
import { NotificationDateTimeType, TaskFormData, TaskPostData } from '../../types/task';
import moment from 'moment';
import Modal from './Modal';
import tasksApi from '../../api/tasksApi';
import { getNotificationDateTime } from '../../utils/applicationStage/applicationStageUtils';

interface Props {
  applicationId: number;
  setIsAddingNewTask: React.Dispatch<React.SetStateAction<boolean>>;
  setShouldFetchData: Dispatch<SetStateAction<boolean>>;
}

function NewTaskModal({ applicationId, setIsAddingNewTask, setShouldFetchData }: Props) {
  const defaultNotificationTime = moment('09:00:00', 'hh:mm:ss');
  const defaultNotificationDaysOffset = 1;

  const initialValues: TaskFormData = {
    notificationTime: defaultNotificationTime,
    notificationDaysOffset: defaultNotificationDaysOffset,
    notificationDateTimeType: NotificationDateTimeType.NONE,
    isDone: false,
  };

  const onCancel = () => {
    setIsAddingNewTask(false);
  };

  const onSubmit = (values: TaskFormData) => {
    const notificationDateTime = getNotificationDateTime(values);

    // Note: notificationDateTime can be null
    const taskPostData: TaskPostData = {
      title: values.title ?? 'Task',
      dueDate: values.dueDate?.toISOString() ?? new Date().toISOString(),
      notificationDateTime: notificationDateTime === undefined ? new Date().toISOString() : notificationDateTime,
    };

    tasksApi.createTask(applicationId, taskPostData).then(() => {
      setShouldFetchData(true);
      setIsAddingNewTask(false);
    });
  };

  const formContent = () => (
    <TaskForm
      initialValues={initialValues}
      shouldTouchAllCompulsoryFields={true}
      shouldAllowMarkDone={false}
      onCancel={onCancel}
      onSubmit={onSubmit}
    />
  );

  return <Modal title="New Task" content={formContent()} />;
}

export default NewTaskModal;
