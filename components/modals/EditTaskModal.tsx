import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import moment from 'moment';
import { NotificationDateTimeType, TaskData, TaskFormData, TaskPatchData } from '../../types/task';
import { isValidDate } from '../../utils/date/validations';
import { calculateDaysOffset } from '../../utils/date/formatters';
import { Nullable } from '../../types/utils';
import TaskForm from '../forms/TaskForm';
import tasksApi from '../../api/tasksApi';
import {
  DEFAULT_NOTIFICATION_DAYS_OFFSET,
  DEFAULT_NOTIFICATION_TIME,
  getIsoNotificationDateTime,
} from '../../utils/task/taskUtils';
import { Button, Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { KeyedMutator } from 'swr';
import { ApiResponse } from '../../types/apiResponse';
import { ApplicationData } from '../../types/application';

interface Props {
  applicationId: number;
  initialTask: TaskData;
  setSelectedTask: Dispatch<SetStateAction<Nullable<TaskData>>>;
  mutateApplicationData: KeyedMutator<ApiResponse<ApplicationData>>;
}

function EditTaskModal({ applicationId, initialTask, setSelectedTask, mutateApplicationData }: Props) {
  const [task] = useState<TaskData>(initialTask);
  const [initialValues, setInitialValues] = useState<TaskFormData>({
    notificationDaysOffset: DEFAULT_NOTIFICATION_DAYS_OFFSET,
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [taskFormData, setTaskFormData] = useState<Nullable<TaskFormData>>(null);

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
      taskDueDate && taskNotificationDateTime
        ? calculateDaysOffset(taskNotificationDateTime, taskDueDate)
        : DEFAULT_NOTIFICATION_DAYS_OFFSET;
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
      notificationDaysOffset: Math.abs(calculatedNotificationDaysOffset),
      notificationDateTimeType: notificationDateTimeType,
      notificationDate: taskNotificationDateTimeMoment,
      notificationTime: taskNotificationDateTimeMoment ?? DEFAULT_NOTIFICATION_TIME,
      isDone: task.isDone,
    });
  }, [task]);

  useEffect(() => {
    if (taskFormData !== null) {
      handleSubmit(taskFormData);
    }
  }, [taskFormData]);

  const onCancel = () => setIsSubmitting(true);

  const onDelete = () => {
    Modal.confirm({
      title: 'Are you sure about deleting this task?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action is irreversible',
      onOk: handleDelete,
    });
  };

  const handleSubmit = (values: TaskFormData) => {
    const taskPatchData: TaskPatchData = {
      title: values.title,
      dueDate: values.dueDate?.toISOString(),
      notificationDateTime: getIsoNotificationDateTime(values),
      isDone: values.isDone,
    };

    tasksApi
      .editTask(applicationId, task.id, taskPatchData)
      .then(() => {
        mutateApplicationData();
        setSelectedTask(null);
      })
      .finally(() => setIsSubmitting(false));
  };

  const handleDelete = () =>
    tasksApi.deleteTask(applicationId, task.id).then(() => {
      mutateApplicationData();
      setSelectedTask(null);
    });

  return (
    <Modal
      open
      title="Edit Task"
      onCancel={onCancel}
      maskClosable={false}
      footer={[
        <Button key="delete" danger onClick={onDelete}>
          Delete
        </Button>,
        <Button key="cancel" onClick={() => setSelectedTask(null)}>
          Cancel
        </Button>,
        <Button key="save" type="primary" loading={isSubmitting} onClick={onCancel}>
          Save
        </Button>,
      ]}
    >
      <TaskForm
        initialValues={initialValues}
        shouldShowMarkDone={true}
        isSubmitting={isSubmitting}
        setTaskFormData={setTaskFormData}
      />
    </Modal>
  );
}

export default EditTaskModal;
