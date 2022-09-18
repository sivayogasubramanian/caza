import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';
import { WORLD_ROUTE } from '../../utils/constants';
import CreateApplicationButton from '../buttons/CreateApplicationButton';
import GlobeIcon from '../icons/GlobeIcon';
import UserIcon from '../icons/UserIcon';

interface Props {
  children: ReactNode;
}

export default function ApplicationNavBar({ children }: Props) {
  const router = useRouter();

  const inactivatedClass = 'w-full text-center';
  const activatedClass = inactivatedClass + ' text-blue-500';

  const yourListClass = !router.pathname.startsWith(WORLD_ROUTE) ? activatedClass : inactivatedClass;
  const worldClass = router.pathname.startsWith(WORLD_ROUTE) ? activatedClass : inactivatedClass;

  return (
    <>
      {children}

      <section className="block md:hidden fixed bottom-0 inset-x-0 z-50 bg-slate-100 pt-1 pb-1 cursor-pointer">
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
              <span className="block text-xs">Explore</span>
            </div>
          </Link>
        </div>
      </section>
    </>
  );
}
