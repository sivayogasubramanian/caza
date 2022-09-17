import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import TaskForm from '../forms/TaskForm';
import { NotificationDateTimeType, TaskFormData, TaskPostData } from '../../types/task';
import tasksApi from '../../api/tasksApi';
import {
  DEFAULT_NOTIFICATION_DAYS_OFFSET,
  DEFAULT_NOTIFICATION_TIME,
  getNotificationDateTime,
} from '../../utils/task/taskUtils';
import { Nullable } from '../../types/utils';
import { Modal } from 'antd';

interface Props {
  applicationId: number;
  setIsAddingNewTask: React.Dispatch<React.SetStateAction<boolean>>;
  setShouldFetchData: Dispatch<SetStateAction<boolean>>;
}

function NewTaskModal({ applicationId, setIsAddingNewTask, setShouldFetchData }: Props) {
  const [shouldDisableSaveButton, setShouldDisableSaveButton] = useState(true);
  const [shouldSubmit, setShouldSubmit] = useState(false);
  const [taskFormData, setTaskFormData] = useState<Nullable<TaskFormData>>(null);
  const [initialValues] = useState<TaskFormData>({
    notificationTime: DEFAULT_NOTIFICATION_TIME,
    notificationDaysOffset: DEFAULT_NOTIFICATION_DAYS_OFFSET,
    notificationDateTimeType: NotificationDateTimeType.NONE,
    isDone: false,
  });

  useEffect(() => {
    if (taskFormData !== null) {
      submit(taskFormData);
    }
  }, [taskFormData]);

  const onCancel = () => {
    setIsAddingNewTask(false);
  };

  const onSubmit = () => {
    setShouldSubmit(true);
  };

  const submit = (values: TaskFormData) => {
    const notificationDateTime = getNotificationDateTime(values);

    // Note: notificationDateTime can be null
    const taskPostData: TaskPostData = {
      title: values.title ?? 'Task',
      dueDate: values.dueDate?.toISOString() ?? new Date().toISOString(),
      notificationDateTime: notificationDateTime === undefined ? new Date().toISOString() : notificationDateTime,
    };

    tasksApi
      .createTask(applicationId, taskPostData)
      .then(() => {
        setShouldFetchData(true);
        setIsAddingNewTask(false);
      })
      .finally(() => setShouldSubmit(false));
  };

  return (
    <Modal
      open
      title="New Task"
      okButtonProps={{ disabled: shouldDisableSaveButton }}
      okText="Create"
      onCancel={onCancel}
      onOk={onSubmit}
      maskClosable={false}
    >
      <TaskForm
        initialValues={initialValues}
        shouldTouchAllCompulsoryFields={true}
        shouldAllowMarkDone={false}
        isSubmitting={shouldSubmit}
        setShouldDisableSaveButton={setShouldDisableSaveButton}
        setTaskFormData={setTaskFormData}
      />
    </Modal>
  );
}

export default NewTaskModal;
