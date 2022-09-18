import { Button } from 'antd';
import Link from 'next/link';
import { FC } from 'react';
import GlobeIcon from '../icons/GlobeIcon';

const GoToWorldViewButton: FC = () => (
  <Link href="/world">
    <Button
      type="primary"
      icon={<GlobeIcon side={15} />}
      className="items-center h-10 flex w-fit bg-blue-400 text-white rounded-md hover:bg-blue-500 border-none hover:border-none"
    >
      <span className="block p-2 text-xs">Go To World View</span>
    </Button>
  </Link>
);

export default GoToWorldViewButton;
