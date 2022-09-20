import Link from 'next/link';
import { useRouter } from 'next/router';
import { WORLD_ROUTE } from '../../utils/constants';
import CreateApplicationButton from '../buttons/CreateApplicationButton';
import GlobeIcon from '../icons/GlobeIcon';
import HomeIcon from '../icons/HomeIcon';

export default function ApplicationNavBar() {
  const router = useRouter();

  const inactivatedClass = 'w-full text-center';
  const activatedClass = inactivatedClass + ' text-bold';

  const yourListClass = !router.pathname.startsWith(WORLD_ROUTE) ? activatedClass : inactivatedClass;
  const worldClass = router.pathname.startsWith(WORLD_ROUTE) ? activatedClass : inactivatedClass;

  return (
    <section className="bg-white shadow-top block fixed p-2 bottom-0 w-full md:hidden cursor-pointer">
      <div className="flex items-center">
        <Link href="/">
          <div className={yourListClass}>
            <HomeIcon isActive={!router.pathname.startsWith(WORLD_ROUTE)} />
            <span className="block text-xs">Your List</span>
          </div>
        </Link>

        <CreateApplicationButton />

        <Link href="/world">
          <div className={worldClass}>
            <GlobeIcon isActive={router.pathname.startsWith(WORLD_ROUTE)} />
            <span className="block text-xs">World View</span>
          </div>
        </Link>
      </div>
    </section>
  );
}
