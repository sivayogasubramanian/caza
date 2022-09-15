import { Form, InputNumber, Input, Button } from 'antd';
import rolesApi from '../../api/rolesApi';
import { RolePostData } from '../../types/role';
import RoleTypesSelect from './RoleTypesSelect';

function CreateRoleForm() {
  const [form] = Form.useForm();

  const onSubmit = (values: RolePostData) => {
    rolesApi
      .createRole(values)
      .then(() => {
        form.resetFields();
        alert('Role created successfully!');
      })
      .catch((error) => alert(error)); // temporarily while we set up error displays
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
        <RoleTypesSelect />
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
