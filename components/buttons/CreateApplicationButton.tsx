import { PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useRouter } from 'next/router';
import { CREATE_APPLICATION_ROUTE } from '../../utils/constants';

function CreateApplicationButton() {
  const router = useRouter();

  return (
    <Button
      className="text-black hover:text-black bg-blue-400 hover:bg-blue-500 border-none hover:border-none"
      type="primary"
      shape="round"
      icon={<PlusOutlined />}
      onClick={() => router.push(CREATE_APPLICATION_ROUTE)}
    />
  );
}

export default CreateApplicationButton;
