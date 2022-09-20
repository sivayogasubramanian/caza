import { PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useRouter } from 'next/router';
import { CREATE_APPLICATION_ROUTE } from '../../utils/constants';

function CreateApplicationButton() {
  const router = useRouter();

  return (
    <Button
      className="bg-button-primary focus:bg-button-primary border-none hover:border-none shadow-primary w-10"
      size="large"
      type="primary"
      shape="circle"
      icon={<PlusOutlined />}
      onClick={() => router.push(CREATE_APPLICATION_ROUTE)}
    />
  );
}

export default CreateApplicationButton;
