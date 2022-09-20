import Link from 'next/link';
import { useRouter } from 'next/router';
import { WORLD_ROUTE } from '../../utils/constants';
import CreateApplicationButton from '../buttons/CreateApplicationButton';
import GlobeIcon from '../icons/GlobeIcon';
import UserIcon from '../icons/UserIcon';

export default function ApplicationNavBar() {
  const router = useRouter();

  const inactivatedClass = 'w-full text-center';
  const activatedClass = inactivatedClass + ' text-blue-500';

  const yourListClass = !router.pathname.startsWith(WORLD_ROUTE) ? activatedClass : inactivatedClass;
  const worldClass = router.pathname.startsWith(WORLD_ROUTE) ? activatedClass : inactivatedClass;

  return (
    <section className="block fixed bottom-0 w-full md:hidden cursor-pointer">
      <div className="flex items-center">
        <Link href="/">
          <div className={yourListClass}>
            <UserIcon size={15} />
            <span className="block text-xs">Your List</span>
          </div>
        </Link>

        <CreateApplicationButton />

        <Link href="/world">
          <div className={worldClass}>
            <GlobeIcon size={15} />
            <span className="block text-xs">World View</span>
          </div>
        </Link>
      </div>
    </section>
  );
}
