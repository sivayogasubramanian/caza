import { Button } from 'antd';
import { useRouter } from 'next/router';
import { log } from '../../utils/analytics';
import { WORLD_ROUTE } from '../../utils/constants';
import GlobeIcon from '../icons/GlobeIcon';

function GoToWorldViewButton() {
  const router = useRouter();

  const onClick = () => {
    log('click_world_view_button');
    router.push(WORLD_ROUTE);
  };

  return (
    <Button
      icon={<GlobeIcon fillColor="#185ADB" isActive={false} />}
      className="hidden md:flex items-center gap-1 text-primary-four border-primary-four rounded-md bg-transparent"
      onClick={onClick}
    >
      Go To World View
    </Button>
  );
}

export default GoToWorldViewButton;
