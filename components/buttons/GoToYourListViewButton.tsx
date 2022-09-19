import { Button } from 'antd';
import Link from 'next/link';
import UserIcon from '../icons/UserIcon';

function GoToYourListViewButton() {
  return (
    <Link href="/world">
      <Button
        type="primary"
        icon={<UserIcon size={15} />}
        className="items-center flex gap-1 bg-blue-400 text-black hover:text-black rounded-md hover:bg-blue-500 border-none hover:border-none"
      >
        Go To Your List View
      </Button>
    </Link>
  );
}

export default GoToYourListViewButton;
