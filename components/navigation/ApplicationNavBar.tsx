import Link from 'next/link';
import UserIcon from '../icons/UserIcon';
import GlobeIcon from '../icons/GlobeIcon';
import CreateApplicationButton from '../buttons/CreateApplicationButton';

export default function ApplicationNavBar({
  location,
  visibilityModifier,
}: {
  location: 'USER_VIEW' | 'WORLD_VIEW';
  visibilityModifier: string;
}) {
  const activatedClass = 'w-full justify-center inline-block text-center pt-2 pb-1 text-blue-500 hover:bg-white';
  const inactivatedClass = 'w-full justify-center inline-block text-center pt-2 pb-1 hover:bg-white';

  const yourListClass = location === 'USER_VIEW' ? activatedClass : inactivatedClass;
  const worldClass = location === 'WORLD_VIEW' ? activatedClass : inactivatedClass;
  return (
    <section
      className={visibilityModifier + ' h-16 block fixed bottom-0 inset-x-0 z-50 shadow-lg text-gray-400 bg-slate-100'}
    >
      <div className="flex items-center justify-between h-16">
        <Link href="/">
          <a href="#" className={yourListClass}>
            <UserIcon side={30} />
            <span className="block text-xs">Your List</span>
          </a>
        </Link>
        <CreateApplicationButton />
        <Link href="/world">
          <a href="#" className={worldClass}>
            <GlobeIcon side={30} />
            <span className="block text-xs">Explore</span>
          </a>
        </Link>
      </div>
    </section>
  );
}
