import { PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useRouter } from 'next/router';
import { log } from '../../utils/analytics';
import { CREATE_APPLICATION_ROUTE } from '../../utils/constants';
import { SizeType } from 'antd/es/config-provider/SizeContext';

interface Props {
  size?: SizeType;
}

function CreateApplicationButton({ size }: Props) {
  const router = useRouter();

  const onClick = () => {
    log('click_create_application_button');
    router.push(CREATE_APPLICATION_ROUTE);
  };

  return (
    <Button
      className="border-none hover:border-none shadow-primary"
      size={size}
      type="primary"
      shape="circle"
      icon={<PlusOutlined />}
      onClick={onClick}
    />
  );
}

export default CreateApplicationButton;
