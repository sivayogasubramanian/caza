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
      type="primary"
      icon={<GlobeIcon isActive={false} />}
      className="items-center flex gap-1 bg-blue-400 text-black hover:text-black rounded-md hover:bg-blue-500 border-none hover:border-none"
      onClick={onClick}
    >
      Go To World View
    </Button>
  );
}

export default GoToWorldViewButton;
