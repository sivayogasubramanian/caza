import { Checkbox, DatePicker, Form, FormInstance, Input, InputNumber, Select, TimePicker } from 'antd';
import React, { useEffect, useState } from 'react';
import { NotificationDateTimeType, TaskFormData } from '../../types/task';
import { Nullable } from '../../types/utils';

interface Props {
  initialValues: TaskFormData;
  shouldTouchAllCompulsoryFields: boolean;
  shouldAllowMarkDone: boolean;
  shouldSubmit: boolean;
  setShouldDisableSaveButton: React.Dispatch<React.SetStateAction<boolean>>;
  setTaskFormData: React.Dispatch<React.SetStateAction<Nullable<TaskFormData>>>;
}

const { Option } = Select;

function TaskForm({
  initialValues,
  shouldTouchAllCompulsoryFields,
  shouldAllowMarkDone,
  shouldSubmit,
  setShouldDisableSaveButton,
  setTaskFormData,
}: Props) {
  const [form] = Form.useForm();

  const [shouldShowNotificationTimePicker, setShouldShowNotificationTimePicker] = useState(false);
  const [shouldShowNotificationDaysInput, setShouldShowNotificationDaysInput] = useState(false);
  const [shouldShowNotificationDatePicker, setShouldShowNotificationDatePicker] = useState(false);

  useEffect(() => {
    form.resetFields();
    onSelectNotificationDateTimeType(initialValues.notificationDateTimeType ?? NotificationDateTimeType.NONE);
  }, [initialValues]);

  useEffect(() => {
    if (shouldSubmit) {
      setTaskFormData(form.getFieldsValue());
    }
  }, [shouldSubmit]);

  const onSelectNotificationDateTimeType = (value: NotificationDateTimeType) => {
    setShouldShowNotificationTimePicker(
      value === NotificationDateTimeType.DAY_OF_EVENT ||
        value === NotificationDateTimeType.DAYS_BEFORE ||
        value === NotificationDateTimeType.DAYS_AFTER,
    );
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
      <TimePicker style={{ width: '100%' }} />
    </Form.Item>
  );

  const shouldDisableSaveButton = (form: FormInstance) => {
    const formHasSomeUntouchedField = shouldTouchAllCompulsoryFields
      ? !form.isFieldsTouched(['title', 'dueDate'], true)
      : !form.isFieldsTouched();
    const formHasSomeError = form.getFieldsError().filter(({ errors }) => errors.length).length > 0;
    return formHasSomeUntouchedField || formHasSomeError;
  };

  const onFormFieldsChange = () => setShouldDisableSaveButton(shouldDisableSaveButton(form));

  return (
    <Form form={form} initialValues={initialValues} onFieldsChange={onFormFieldsChange} className="mt-1 mb-1 ml-2 mr-2">
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
        <div className="grid">
          <div className="flex">
            {shouldShowNotificationDaysInput && (
              <Form.Item name="notificationDaysOffset" rules={[{ required: true, message: 'Please enter a number.' }]}>
                <InputNumber precision={0} min={0} max={400} />
              </Form.Item>
            )}

            <Form.Item name="notificationDateTimeType">
              <Select onSelect={onSelectNotificationDateTimeType}>
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
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>

              {getTimePickerComponent({ width: '50%' })}
            </div>
          )}

          {shouldShowNotificationTimePicker && getTimePickerComponent()}
        </div>
      </Form.Item>

      {shouldAllowMarkDone && (
        <Form.Item name="isDone" valuePropName="checked">
          <Checkbox>Done</Checkbox>
        </Form.Item>
      )}
    </Form>
  );
}

export default TaskForm;
