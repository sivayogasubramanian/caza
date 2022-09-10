import { Form, InputNumber, Input, Select, Button } from 'antd';
import api from '../../api/api';
import { RolePostData } from '../../types/role';

const { Option } = Select;

function CreateRoleForm() {
  const [form] = Form.useForm();

  const onSubmit = (values: RolePostData) => {
    api.post('roles', values).then(() => {
      form.resetFields();
      alert('Role created successfully.');
    });
  };

  return (
    <Form name="Create New Role" form={form} labelCol={{ span: 4 }} className="flex flex-col" onFinish={onSubmit}>
      <Form.Item
        label="Company ID"
        name="companyId"
        rules={[{ required: true, message: 'Please input the company ID!' }]}
      >
        <InputNumber />
      </Form.Item>
      <Form.Item label="Title" name="title" rules={[{ required: true, message: 'Please input a title!' }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Type" name="type" rules={[{ required: true }]}>
        <Select>
          <Option value="SUMMER_INTERNSHIP">Summer Internship</Option>
          <Option value="FALL_INTERNSHIP">Fall Internship</Option>
          <Option value="WINTER_INTERNSHIP">Winter Internship</Option>
          <Option value="SPRING_INTERNSHIP">Spring Internship</Option>
          <Option value="FULL_TIME">Full-time Job</Option>
        </Select>
      </Form.Item>
      <Form.Item label="Year" name="year" rules={[{ required: true, message: 'Please input the year!' }]}>
        <InputNumber />
      </Form.Item>
      <Form.Item className="self-center">
        <Button type="primary" htmlType="submit" className="bg-black hover:bg-slate-600 ">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
}

export default CreateRoleForm;
