import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import Link from 'next/link';

export function CreateApplicationButton() {
  return (
    <div className="flex fixed left-0 right-0 place-content-center bottom-20 md:bottom-4  w-full">
      <Button
        className="z-50 h-12 w-12 justify-center rounded-lg bg-blue-400 hover:bg-blue-500 border-none hover:border-none"
        type="primary"
        icon={<PlusOutlined />}
      ></Button>
    </div>
  );
}

export function ApplicationButtons({ isYourList }: { isYourList: boolean }) {
  const activatedClass =
    'items-center h-10 flex w-fit bg-black text-white rounded-md hover:bg-black border-black hover:border-black';
  const inactivatedClass =
    'items-center h-10 flex w-fit bg-white text-black rounded-md hover:bg-blue-400 hover:text-black focus:text-black border-black hover:border-black';
  return (
    <div className="invisible md:visible w-24 flex justify-between space-x-4">
      <Link href="/">
        <Button type="primary" icon={userIcon('h-6 w-6')} className={isYourList ? activatedClass : inactivatedClass}>
          <span className="block p-2 text-xs">Your List</span>
        </Button>
      </Link>
      <Link href="/world">
        <Button type="primary" icon={globeIcon('h-5 w-5')} className={!isYourList ? activatedClass : inactivatedClass}>
          <span className="block p-2 text-xs">Explore</span>
        </Button>
      </Link>
    </div>
  );
}

export function ApplicationNavBar({ isYourList }: { isYourList: boolean }) {
  const activatedClass = 'w-full justify-center inline-block text-center pt-2 pb-1 text-blue-500 hover:bg-white';
  const inactivatedClass = 'w-full justify-center inline-block text-center pt-2 pb-1 hover:bg-white';
  return (
    <section className="visible md:invisible h-16 block fixed bottom-0 inset-x-0 z-50 shadow-lg text-gray-400 bg-slate-100">
      <div className="flex justify-between h-16">
        <Link href="/">
          <a href="#" className={isYourList ? activatedClass : inactivatedClass}>
            {userIcon('h-8 w-8')}
            <span className="block text-xs">Your List</span>
          </a>
        </Link>
        <Link href="/world">
          <a href="#" className={!isYourList ? activatedClass : inactivatedClass}>
            {globeIcon('h-6 w-6')}
            <span className="block text-xs">Explore</span>
          </a>
        </Link>
      </div>
    </section>
  );
}

const userIcon = (heightWidthValues: string) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 16 16"
    className={heightWidthValues + ' inline-block mb-1'}
  >
    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z" />
  </svg>
);

const globeIcon = (heightWidthValues: string) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 16 16"
    className={heightWidthValues + ' inline-block mb-1'}
  >
    <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm7.5-6.923c-.67.204-1.335.82-1.887 1.855-.143.268-.276.56-.395.872.705.157 1.472.257 2.282.287V1.077zM4.249 3.539c.142-.384.304-.744.481-1.078a6.7 6.7 0 0 1 .597-.933A7.01 7.01 0 0 0 3.051 3.05c.362.184.763.349 1.198.49zM3.509 7.5c.036-1.07.188-2.087.436-3.008a9.124 9.124 0 0 1-1.565-.667A6.964 6.964 0 0 0 1.018 7.5h2.49zm1.4-2.741a12.344 12.344 0 0 0-.4 2.741H7.5V5.091c-.91-.03-1.783-.145-2.591-.332zM8.5 5.09V7.5h2.99a12.342 12.342 0 0 0-.399-2.741c-.808.187-1.681.301-2.591.332zM4.51 8.5c.035.987.176 1.914.399 2.741A13.612 13.612 0 0 1 7.5 10.91V8.5H4.51zm3.99 0v2.409c.91.03 1.783.145 2.591.332.223-.827.364-1.754.4-2.741H8.5zm-3.282 3.696c.12.312.252.604.395.872.552 1.035 1.218 1.65 1.887 1.855V11.91c-.81.03-1.577.13-2.282.287zm.11 2.276a6.696 6.696 0 0 1-.598-.933 8.853 8.853 0 0 1-.481-1.079 8.38 8.38 0 0 0-1.198.49 7.01 7.01 0 0 0 2.276 1.522zm-1.383-2.964A13.36 13.36 0 0 1 3.508 8.5h-2.49a6.963 6.963 0 0 0 1.362 3.675c.47-.258.995-.482 1.565-.667zm6.728 2.964a7.009 7.009 0 0 0 2.275-1.521 8.376 8.376 0 0 0-1.197-.49 8.853 8.853 0 0 1-.481 1.078 6.688 6.688 0 0 1-.597.933zM8.5 11.909v3.014c.67-.204 1.335-.82 1.887-1.855.143-.268.276-.56.395-.872A12.63 12.63 0 0 0 8.5 11.91zm3.555-.401c.57.185 1.095.409 1.565.667A6.963 6.963 0 0 0 14.982 8.5h-2.49a13.36 13.36 0 0 1-.437 3.008zM14.982 7.5a6.963 6.963 0 0 0-1.362-3.675c-.47.258-.995.482-1.565.667.248.92.4 1.938.437 3.008h2.49zM11.27 2.461c.177.334.339.694.482 1.078a8.368 8.368 0 0 0 1.196-.49 7.01 7.01 0 0 0-2.275-1.52c.218.283.418.597.597.932zm-.488 1.343a7.765 7.765 0 0 0-.395-.872C9.835 1.897 9.17 1.282 8.5 1.077V4.09c.81-.03 1.577-.13 2.282-.287z" />
  </svg>
);
