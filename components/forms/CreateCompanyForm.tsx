import { Form, Input, Modal } from 'antd';
import companiesApi from '../../api/companiesApi';
import { CompanyData } from '../../types/company';

type Props = {
  isOpen: boolean;
  closeForm: () => void;
  onCreate: (company: CompanyData) => void;
};

function CreateCompanyForm({ isOpen, closeForm, onCreate }: Props) {
  const [form] = Form.useForm();

  const onSubmit = () => {
    form.validateFields().then((values) => {
      companiesApi.createCompany(values).then((resp) => {
        if (resp.payload.id === undefined) {
          return;
        }

        form.resetFields();
        closeForm();
        onCreate(resp.payload as CompanyData);
      });
    });
  };

  return (
    <Modal title={'Add new company'} open={isOpen} onOk={onSubmit} onCancel={closeForm}>
      <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
        <Form.Item name="name" label="Company name">
          <Input />
        </Form.Item>
        <Form.Item name="companyUrl" label="Company URL">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default CreateCompanyForm;
