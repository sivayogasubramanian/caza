import { Button } from 'antd';
import HomeIcon from '../icons/HomeIcon';
import { log } from '../../utils/analytics';
import { HOMEPAGE_ROUTE } from '../../utils/constants';
import { useRouter } from 'next/router';

function GoToYourListViewButton() {
  const router = useRouter();

  const onClick = () => {
    log('click_list_view_button');
    router.push(HOMEPAGE_ROUTE);
  };

  return (
    <Button
      type="primary"
      icon={<HomeIcon isActive={false} />}
      className="items-center flex gap-1 bg-blue-400 text-black hover:text-black rounded-md hover:bg-blue-500 border-none hover:border-none"
      onClick={onClick}
    >
      Go To Your List View
    </Button>
  );
}

export default GoToYourListViewButton;
