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
      icon={<HomeIcon fillColor="#185ADB" isActive={false} />}
      className="hidden md:flex items-center gap-1 text-primary-four border-primary-four rounded-md bg-transparent"
      onClick={onClick}
    >
      Go To Your Applications
    </Button>
  );
}

export default GoToYourListViewButton;
