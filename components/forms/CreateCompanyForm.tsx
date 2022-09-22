import { Form, Input, Modal } from 'antd';
import companiesApi from '../../frontendApis/companiesApi';
import { CompanyData } from '../../types/company';
import { log } from '../../utils/analytics';

type Props = {
  isOpen: boolean;
  closeForm: () => void;
  onCreate: (company: CompanyData) => void;
};

function CreateCompanyForm({ isOpen, closeForm, onCreate }: Props) {
  const [form] = Form.useForm();

  const onSubmit = () => {
    log('submit_create_company_form');
    form
      .validateFields()
      .then((values) => {
        log('create_company_form_valid');
        companiesApi.createCompany(values).then((resp) => {
          if (resp.payload.id === undefined) {
            return;
          }

          form.resetFields();
          closeForm();
          onCreate(resp.payload as CompanyData);
        });
      })
      .catch((errorInfo) => {
        log('create_company_form_invalid', { errorInfo });
      });
  };

  const onCancel = () => {
    log('cancel_create_company_form');
    form.resetFields();
    closeForm();
  };

  return (
    <Modal title={'Add new company'} open={isOpen} onOk={onSubmit} onCancel={onCancel}>
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
