import { Button, Checkbox, DatePicker, Form, Input, InputNumber, Select, TimePicker } from 'antd';
import React, { useEffect, useState } from 'react';
import moment from 'moment';

const { Option } = Select;

enum NotificationDateTimeType {
  NONE = 'NONE',
  DAY_OF_EVENT = 'DAY_OF_EVENT',
  DAYS_BEFORE = 'DAYS_BEFORE',
  DAYS_AFTER = 'DAYS_AFTER',
  ON_SELECTED_DATE = 'ON_SELECTED_DATE',
}

function EditTaskModal() {
  const defaultNotificationTimeMoment = moment('09:00:00', 'HH:mm:ss');

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
      <TimePicker defaultValue={defaultNotificationTimeMoment} style={{ width: '100%' }} />
    </Form.Item>
  );

  const [shouldShowNotificationTimePicker, setShouldShowNotificationTimePicker] = useState(false);
  const [shouldShowNotificationDaysInput, setShouldShowNotificationDaysInput] = useState(false);
  const [shouldShowNotificationDatePicker, setShouldShowNotificationDatePicker] = useState(false);
  const [form] = Form.useForm();

  return (
    <div className="fixed inset-0 w-screen h-screen bg-gray-900/60 z-50 flex justify-center items-center">
      <div className="shadow-md rounded-lg bg-white w-5/6 h-5/6 flex-col items-center justify-between">
        <div className="text-lg font-bold mt-1 mb-1 ml-2 mr-2">Edit Task</div>

        <Form form={form} className="mt-1 mb-1 ml-2 mr-2">
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

                <Select defaultValue={NotificationDateTimeType.NONE} onSelect={onSelectNotificationDateTimeType}>
                  <Option value={NotificationDateTimeType.NONE}>None</Option>
                  <Option value={NotificationDateTimeType.DAY_OF_EVENT}>On day of event</Option>
                  <Option value={NotificationDateTimeType.DAYS_BEFORE}>Day(s) before</Option>
                  <Option value={NotificationDateTimeType.DAYS_AFTER}>Day(s) after</Option>
                  <Option value={NotificationDateTimeType.ON_SELECTED_DATE}>On selected date</Option>
                </Select>
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

          <Form.Item name="isDone">
            <Checkbox>Done</Checkbox>
          </Form.Item>

          <div className="flex justify-end gap-2">
            <Form.Item>
              <Button shape="round" size="large" className="text-blue-400 border-blue-400">
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
                  disabled={
                    !form.isFieldsTouched(['title', 'dueDate'], true) ||
                    form.getFieldsError().filter(({ errors }) => errors.length).length > 0
                  }
                >
                  Save
                </Button>
              )}
            </Form.Item>
          </div>
        </Form>
      </div>
    </div>
  );
}

export default EditTaskModal;
