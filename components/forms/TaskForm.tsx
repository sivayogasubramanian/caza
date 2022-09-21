import { Checkbox, DatePicker, Form, Input, InputNumber, Select, TimePicker } from 'antd';
import { CSSProperties, Dispatch, SetStateAction, useEffect, useState } from 'react';
import { NotificationDateTimeType, TaskFormData } from '../../types/task';
import { Nullable } from '../../types/utils';

interface Props {
  initialValues: TaskFormData;
  shouldShowMarkDone: boolean;
  isSubmitting: boolean;
  setIsSubmitting: Dispatch<SetStateAction<boolean>>;
  setTaskFormData: Dispatch<SetStateAction<Nullable<TaskFormData>>>;
}

interface TaskFormTimePickerProps {
  isOpen: boolean;
}

function TaskForm({ initialValues, shouldShowMarkDone, isSubmitting, setIsSubmitting, setTaskFormData }: Props) {
  const [form] = Form.useForm();

  const [shouldShowNotificationDaysOffsetInput, setShouldShowNotificationDaysOffsetInput] = useState<boolean>(false);
  const [shouldShowNotificationDateTimePicker, setShouldShowNotificationDateTimePicker] = useState<boolean>(false);
  const [shouldShowNotificationTimePicker, setShouldShowNotificationTimePicker] = useState<boolean>(false);

  useEffect(() => {
    form.resetFields();
    onSelectNotificationDateTimeType(initialValues.notificationDateTimeType ?? NotificationDateTimeType.NONE);
  }, [initialValues]);

  useEffect(() => {
    if (isSubmitting) {
      form
        .validateFields()
        .then(() => setTaskFormData(form.getFieldsValue()))
        .catch(() => setIsSubmitting(false));
    }
  }, [isSubmitting]);

  const onSelectNotificationDateTimeType = (value: NotificationDateTimeType) => {
    setShouldShowNotificationTimePicker(
      value === NotificationDateTimeType.DAY_OF_EVENT ||
        value === NotificationDateTimeType.DAYS_BEFORE ||
        value === NotificationDateTimeType.DAYS_AFTER,
    );
    setShouldShowNotificationDaysOffsetInput(
      value === NotificationDateTimeType.DAYS_BEFORE || value === NotificationDateTimeType.DAYS_AFTER,
    );
    setShouldShowNotificationDateTimePicker(value === NotificationDateTimeType.ON_SELECTED_DATE);
  };

  return (
    <Form form={form} initialValues={initialValues} labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} labelAlign="left">
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
        <DatePicker className="w-full" />
      </Form.Item>

      <Form.Item label="Notification date">
        <Form.Item name="notificationDateTimeType" className="flex-grow">
          <Select onSelect={onSelectNotificationDateTimeType}>
            <Select.Option value={NotificationDateTimeType.NONE}>None</Select.Option>
            <Select.Option value={NotificationDateTimeType.DAY_OF_EVENT}>On day of event</Select.Option>
            <Select.Option value={NotificationDateTimeType.DAYS_BEFORE}>Day(s) before</Select.Option>
            <Select.Option value={NotificationDateTimeType.DAYS_AFTER}>Day(s) after</Select.Option>
            <Select.Option value={NotificationDateTimeType.ON_SELECTED_DATE}>On selected date</Select.Option>
          </Select>
        </Form.Item>

        <div className="flex">
          {shouldShowNotificationDaysOffsetInput && (
            <Form.Item name="notificationDaysOffset" rules={[{ required: true, message: 'Please enter a number.' }]}>
              <InputNumber precision={0} />
            </Form.Item>
          )}

          {shouldShowNotificationDateTimePicker && (
            <div className="flex justify-evenly w-full">
              <Form.Item name="notificationDate" rules={[{ required: true, message: 'Please select a date.' }]}>
                <DatePicker className="w-full" />
              </Form.Item>

              <TaskFormTimePicker isOpen />
            </div>
          )}

          <TaskFormTimePicker isOpen={shouldShowNotificationTimePicker} />
        </div>
      </Form.Item>

      {shouldShowMarkDone && (
        <Form.Item name="isDone" valuePropName="checked">
          <Checkbox>Done</Checkbox>
        </Form.Item>
      )}
    </Form>
  );
}

function TaskFormTimePicker({ isOpen }: TaskFormTimePickerProps) {
  return isOpen ? (
    <Form.Item
      name="notificationTime"
      rules={[{ required: true, message: 'Please select a time.' }]}
      className="flex-grow"
    >
      <TimePicker className="w-full" />
    </Form.Item>
  ) : null;
}

export default TaskForm;
