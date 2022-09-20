import { Button } from 'antd';
import Link from 'next/link';
import GlobeIcon from '../icons/GlobeIcon';

function GoToWorldViewButton() {
  return (
    <Link href="/world">
      <Button
        type="primary"
        icon={<GlobeIcon isActive={false} />}
        className="items-center flex gap-1 bg-blue-400 text-black hover:text-black rounded-md hover:bg-blue-500 border-none hover:border-none"
      >
        Go To World View
      </Button>
    </Link>
  );
}

export default GoToWorldViewButton;
