import { PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { FC } from 'react';

const CreateApplicationButton: FC = () => (
  <Button
    className="bg-blue-400 hover:bg-blue-500 border-none hover:border-none"
    type="primary"
    size="large"
    shape="round"
    icon={<PlusOutlined />}
  ></Button>
);

export default CreateApplicationButton;
