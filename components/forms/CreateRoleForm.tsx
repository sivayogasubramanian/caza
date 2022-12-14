import { Form, InputNumber, Input, Modal } from 'antd';
import rolesApi from '../../frontendApis/rolesApi';
import { CompanyListData } from '../../types/company';
import { RoleData } from '../../types/role';
import { Nullable } from '../../types/utils';
import { log } from '../../utils/analytics';
import { DEFAULT_NUM_MONTHS_BEFORE_ROLE_START } from '../../utils/constants';
import CompanyOption from '../CompanyOption';
import RoleTypesSelect from './RoleTypesSelect';

type Props = {
  company: Nullable<CompanyListData>;

  isOpen: boolean;
  closeForm: () => void;
  onCreate: (role: RoleData) => void;
};

function getDefaultRoleYear(): number {
  const date = new Date();
  date.setMonth(date.getMonth() + DEFAULT_NUM_MONTHS_BEFORE_ROLE_START);
  return date.getFullYear();
}

function CreateRoleForm({ company, isOpen, closeForm, onCreate }: Props) {
  const [form] = Form.useForm();

  const onSubmit = (companyId: number) => {
    log('submit_create_company_form');
    form
      .validateFields()
      .then(({ title, type, year }) => {
        log('create_role_form_valid');
        rolesApi.createRole({ companyId, title, type, year }).then((resp) => {
          if (resp.payload.id === undefined) {
            return;
          }

          form.resetFields();
          closeForm();
          onCreate(resp.payload as RoleData);
        });
      })
      .catch((errorInfo) => {
        log('create_role_form_invalid', { errorInfo });
      });
  };

  const onCancel = () => {
    log('cancel_create_role_form');
    form.resetFields();
    closeForm();
  };

  if (company === null) {
    return null;
  }

  return (
    <Modal title={'Add new role'} open={isOpen} onOk={() => onSubmit(company.id)} onCancel={onCancel}>
      <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} initialValues={{ year: getDefaultRoleYear() }}>
        <Form.Item label="Company" name="companyName">
          <CompanyOption company={company} />
        </Form.Item>
        <Form.Item label="Title" name="title" rules={[{ required: true, message: 'Please input a title!' }]}>
          <Input placeholder="Enter the role title" />
        </Form.Item>
        <Form.Item label="Type" name="type" rules={[{ required: true, message: 'Please select a role type!' }]}>
          <RoleTypesSelect placeholder="Select a role type" />
        </Form.Item>
        <Form.Item label="Year" name="year" rules={[{ required: true, message: 'Please input the year!' }]}>
          <InputNumber />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default CreateRoleForm;
