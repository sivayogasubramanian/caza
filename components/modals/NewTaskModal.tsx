import React from 'react';
import TaskForm from '../forms/TaskForm';
import { NotificationDateTimeType, TaskFormData } from '../../types/task';
import moment from 'moment';
import Modal from './Modal';

interface Props {
  setIsAddingNewTask: React.Dispatch<React.SetStateAction<boolean>>;
}

function NewTaskModal({ setIsAddingNewTask }: Props) {
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

  const formContent = () => (
    <TaskForm
      initialValues={initialValues}
      onCancel={onCancel}
      shouldTouchAllCompulsoryFields={true}
      shouldAllowMarkDone={false}
    />
  );

  return <Modal title="New Task" content={formContent()} />;
}

export default NewTaskModal;
