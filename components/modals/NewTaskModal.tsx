import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import TaskForm from '../forms/TaskForm';
import { NotificationDateTimeType, TaskFormData, TaskPostData } from '../../types/task';
import tasksApi from '../../frontendApis/tasksApi';
import {
  DEFAULT_NOTIFICATION_DAYS_OFFSET,
  DEFAULT_NOTIFICATION_TIME,
  getIsoNotificationDateTime,
} from '../../utils/task/taskUtils';
import { Nullable } from '../../types/utils';
import { Modal } from 'antd';
import { KeyedMutator } from 'swr';
import { ApiResponse } from '../../types/apiResponse';
import { ApplicationData } from '../../types/application';

interface Props {
  applicationId: number;
  setIsAddingNewTask: Dispatch<SetStateAction<boolean>>;
  mutateApplicationData: KeyedMutator<ApiResponse<ApplicationData>>;
}

function NewTaskModal({ applicationId, setIsAddingNewTask, mutateApplicationData }: Props) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
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

  const submit = (values: TaskFormData) => {
    const notificationDateTime = getIsoNotificationDateTime(values);

    // Note: notificationDateTime can be null
    const taskPostData: TaskPostData = {
      title: values.title ?? 'Task',
      dueDate: values.dueDate?.toISOString() ?? new Date().toISOString(),
      notificationDateTime: notificationDateTime === undefined ? null : notificationDateTime,
    };

    tasksApi
      .createTask(applicationId, taskPostData)
      .then(() => {
        mutateApplicationData();
        setIsAddingNewTask(false);
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <Modal
      open
      title="New Task"
      okText="Create"
      onCancel={() => setIsAddingNewTask(false)}
      onOk={() => setIsSubmitting(true)}
      maskClosable={false}
    >
      <TaskForm
        initialValues={initialValues}
        shouldShowMarkDone={false}
        isSubmitting={isSubmitting}
        setIsSubmitting={setIsSubmitting}
        setTaskFormData={setTaskFormData}
      />
    </Modal>
  );
}

export default NewTaskModal;
