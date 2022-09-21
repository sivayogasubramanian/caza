import { Form, Input, Modal } from 'antd';
import companiesApi from '../../frontendApis/companiesApi';
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
      <Form form={form} labelCol={{ span: 7 }} wrapperCol={{ span: 17 }}>
        <Form.Item
          name="name"
          label="Company name"
          rules={[{ required: true, message: 'Please input the company name!' }]}
        >
          <Input placeholder="Enter the company's name" />
        </Form.Item>
        <Form.Item
          name="companyUrl"
          label="Company website"
          rules={[{ required: true, message: 'Please input the company website!' }]}
        >
          <Input placeholder="Enter the company's website" />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default CreateCompanyForm;
