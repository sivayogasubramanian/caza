import { PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useRouter } from 'next/router';
import { log } from '../../utils/analytics';
import { CREATE_APPLICATION_ROUTE } from '../../utils/constants';

function CreateApplicationButton() {
  const router = useRouter();

  const onClick = () => {
    log('click_create_application_button');
    router.push(CREATE_APPLICATION_ROUTE);
  };

  return (
    <Button
      className="bg-primary-one focus:bg-primary-one border-none hover:border-none shadow-primary w-10"
      size="large"
      type="primary"
      shape="circle"
      icon={<PlusOutlined />}
      onClick={onClick}
    />
  );
}

export default CreateApplicationButton;
