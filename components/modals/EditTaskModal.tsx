import { Button, Checkbox, DatePicker, Form, Input, InputNumber, Select, TimePicker } from 'antd';
import React, { useEffect, useState } from 'react';
import moment, { Moment } from 'moment';
import { TaskData } from '../../types/task';
import { isValidDate } from '../../utils/date/validations';
import { calculateDaysOffset } from '../../utils/date/formatters';
import { Nullable } from '../../types/utils';
import Modal from './Modal';

const { Option } = Select;

enum NotificationDateTimeType {
  NONE = 'NONE',
  DAY_OF_EVENT = 'DAY_OF_EVENT',
  DAYS_BEFORE = 'DAYS_BEFORE',
  DAYS_AFTER = 'DAYS_AFTER',
  ON_SELECTED_DATE = 'ON_SELECTED_DATE',
}

interface Props {
  initialTask: TaskData;
  setSelectedTask: React.Dispatch<React.SetStateAction<Nullable<TaskData>>>;
}

interface FormData {
  title?: string;
  dueDate?: Moment;
  notificationTime?: Moment;
  notificationDateTime?: Moment;
  notificationDaysOffset?: number;
  notificationDateTimeType?: NotificationDateTimeType;
  notificationDate?: Moment;
  isDone?: boolean;
}

function EditTaskModal({ initialTask, setSelectedTask }: Props) {
  const [shouldShowNotificationTimePicker, setShouldShowNotificationTimePicker] = useState(false);
  const [shouldShowNotificationDaysInput, setShouldShowNotificationDaysInput] = useState(false);
  const [shouldShowNotificationDatePicker, setShouldShowNotificationDatePicker] = useState(false);
  const [form] = Form.useForm();
  const [task, setTask] = useState(initialTask);
  const [initialValues, setInitialValues] = useState<FormData>({});
  const defaultNotificationTimeMoment = moment('09:00:00', 'HH:mm:ss');

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

    onSelectNotificationDateTimeType(notificationDateTimeType);
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

  useEffect(() => form.resetFields(), [initialValues]);

  const onSelectNotificationDateTimeType = (value: NotificationDateTimeType) => {
    setShouldShowNotificationTimePicker(value === NotificationDateTimeType.DAY_OF_EVENT);
    setShouldShowNotificationDaysInput(
      value === NotificationDateTimeType.DAYS_BEFORE || value === NotificationDateTimeType.DAYS_AFTER,
    );
    setShouldShowNotificationDatePicker(value === NotificationDateTimeType.ON_SELECTED_DATE);
  };

  const getTimePickerComponent = (givenStyle?: React.CSSProperties) => (
    <Form.Item
      name="notificationTime"
      style={givenStyle && givenStyle}
      rules={[{ required: true, message: 'Please select a time.' }]}
    >
      <TimePicker
        defaultValue={initialValues.notificationTime ?? defaultNotificationTimeMoment}
        style={{ width: '100%' }}
      />
    </Form.Item>
  );

  const onClickCancel = () => {
    setSelectedTask(null);
  };

  const shouldDisableSaveButton = () =>
    !form.isFieldsTouched() || form.getFieldsError().filter(({ errors }) => errors.length).length > 0;

  const formContent = () => (
    <>
      <div className="text-lg font-bold mt-1 mb-1 ml-2 mr-2">Edit Task</div>

      <Form form={form} initialValues={initialValues} className="mt-1 mb-1 ml-2 mr-2">
        <Form.Item
          label="Task"
          name="title"
          rules={[
            { required: true, message: 'Please describe your task.' },
            { whitespace: true, message: 'The task description cannot be empty.' },
          ]}
        >
          <Input placeholder="Describe your task" />
        </Form.Item>

        <Form.Item label="Due date" name="dueDate" rules={[{ required: true, message: 'Please select a date.' }]}>
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item label="Notification date" name="notificationDateTime">
          <div className="grid gap-2">
            <div className="flex">
              {shouldShowNotificationDaysInput && (
                <Form.Item
                  name="notificationDaysOffset"
                  rules={[{ required: true, message: 'Please enter a number.' }]}
                >
                  <InputNumber precision={0} min={0} max={400} defaultValue={1} />
                </Form.Item>
              )}

              <Form.Item name="notificationDateTimeType">
                <Select defaultValue={NotificationDateTimeType.NONE} onSelect={onSelectNotificationDateTimeType}>
                  <Option value={NotificationDateTimeType.NONE}>None</Option>
                  <Option value={NotificationDateTimeType.DAY_OF_EVENT}>On day of event</Option>
                  <Option value={NotificationDateTimeType.DAYS_BEFORE}>Day(s) before</Option>
                  <Option value={NotificationDateTimeType.DAYS_AFTER}>Day(s) after</Option>
                  <Option value={NotificationDateTimeType.ON_SELECTED_DATE}>On selected date</Option>
                </Select>
              </Form.Item>
            </div>

            {shouldShowNotificationDatePicker && (
              <div className="flex justify-between">
                <Form.Item
                  name="notificationDate"
                  style={{ width: '50%' }}
                  rules={[{ required: true, message: 'Please select a date.' }]}
                >
                  <DatePicker defaultValue={initialValues.notificationDate} style={{ width: '100%' }} />
                </Form.Item>

                {getTimePickerComponent({ width: '50%' })}
              </div>
            )}

            {shouldShowNotificationTimePicker && getTimePickerComponent()}
          </div>
        </Form.Item>

        <Form.Item name="isDone">
          <Checkbox>Done</Checkbox>
        </Form.Item>

        <div className="flex justify-end gap-2">
          <Form.Item>
            <Button shape="round" size="large" className="text-blue-400 border-blue-400" onClick={onClickCancel}>
              Cancel
            </Button>
          </Form.Item>

          <Form.Item shouldUpdate>
            {() => (
              <Button
                type="primary"
                htmlType="submit"
                shape="round"
                size="large"
                className="bg-blue-400"
                disabled={shouldDisableSaveButton()}
              >
                Save
              </Button>
            )}
          </Form.Item>
        </div>
      </Form>
    </>
  );

  return <Modal content={formContent()} />;
}

export default EditTaskModal;
