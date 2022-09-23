import { useRouter } from 'next/router';
import { log } from '../../utils/analytics';
import { HOMEPAGE_ROUTE, WORLD_ROUTE } from '../../utils/constants';
import CreateApplicationButton from '../buttons/CreateApplicationButton';
import GlobeIcon from '../icons/GlobeIcon';
import HomeIcon from '../icons/HomeIcon';

export default function ApplicationNavBar() {
  const router = useRouter();

  return (
    <div className="bg-white shadow-top block fixed p-2 bottom-0 w-full md:hidden cursor-pointer">
      <div className="flex items-center">
        <div
          className="w-full text-center flex flex-col text-xs items-center"
          onClick={() => {
            log('click_list_view_tab');
            router.push(HOMEPAGE_ROUTE);
          }}
        >
          <HomeIcon isActive={!router.pathname.startsWith(WORLD_ROUTE)} />
          <span className="mt-1">Your List</span>
        </div>

        <CreateApplicationButton size="large" />

        <div
          className="w-full text-center flex flex-col text-xs items-center"
          onClick={() => {
            log('click_world_view_tab');
            router.push(WORLD_ROUTE);
          }}
        >
          <GlobeIcon isActive={router.pathname.startsWith(WORLD_ROUTE)} />
          <span className="mt-1">World View</span>
        </div>
      </div>
    </div>
  );
}
