import { PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useRouter } from 'next/router';
import { FC } from 'react';
import { CREATE_APPLICATION_ROUTE } from '../../utils/constants';

const CreateApplicationButton: FC = () => {
  const router = useRouter();
  const onClickAddApplication: React.MouseEventHandler<HTMLElement> = (e) => {
    e.preventDefault();
    router.push(CREATE_APPLICATION_ROUTE);
  };

  return (
    <Button
      className="text-black hover:text-black bg-blue-400 hover:bg-blue-500 border-none hover:border-none"
      type="primary"
      size="large"
      shape="round"
      icon={<PlusOutlined />}
      onClick={onClickAddApplication}
    ></Button>
  );
};

export default CreateApplicationButton;
