import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
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
  getNotificationDateTime,
} from '../../utils/task/taskUtils';
import { Button, Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { confirm } = Modal;

interface Props {
  applicationId: number;
  initialTask: TaskData;
  setSelectedTask: React.Dispatch<React.SetStateAction<Nullable<TaskData>>>;
  setShouldFetchData: Dispatch<SetStateAction<boolean>>;
}

function EditTaskModal({ applicationId, initialTask, setSelectedTask, setShouldFetchData }: Props) {
  const [task, setTask] = useState(initialTask);
  const [initialValues, setInitialValues] = useState<TaskFormData>({
    notificationDaysOffset: 1,
  });
  const [shouldDisableSaveButton, setShouldDisableSaveButton] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const onCancel = () => {
    setSelectedTask(null);
  };

  const onSubmit = () => {
    setIsSubmitting(true);
  };

  const onDelete = () => {
    confirm({
      title: 'Are you sure about deleting this task?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action is irreversible',
      onOk() {
        handleDelete();
      },
    });
  };

  const handleSubmit = (values: TaskFormData) => {
    const taskPatchData: TaskPatchData = {
      title: values.title,
      dueDate: values.dueDate?.toISOString(),
      notificationDateTime: getNotificationDateTime(values),
      isDone: values.isDone,
    };

    tasksApi
      .editTask(applicationId, task.id, taskPatchData)
      .then((value) => {
        const updatedTask = value.payload as TaskData;
        setTask(updatedTask);
        setShouldFetchData(true);
        setSelectedTask(null);
      })
      .finally(() => setIsSubmitting(false));
  };

  const handleDelete = () =>
    tasksApi.deleteTask(applicationId, task.id).then(() => {
      setShouldFetchData(true);
      setSelectedTask(null);
    });

  return (
    <Modal
      open
      title="Edit Task"
      maskClosable={false}
      footer={[
        <Button key="delete" danger onClick={onDelete}>
          Delete
        </Button>,
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="save" type="primary" loading={isSubmitting} onClick={onSubmit} disabled={shouldDisableSaveButton}>
          Save
        </Button>,
      ]}
    >
      <TaskForm
        initialValues={initialValues}
        shouldTouchAllCompulsoryFields={false}
        shouldAllowMarkDone={true}
        isSubmitting={isSubmitting}
        setShouldDisableSaveButton={setShouldDisableSaveButton}
        setTaskFormData={setTaskFormData}
      />
    </Modal>
  );
}

export default EditTaskModal;
