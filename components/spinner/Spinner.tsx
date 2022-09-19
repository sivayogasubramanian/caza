import { Spin } from 'antd';
import { ReactNode } from 'react';

interface Props {
  isLoading: boolean;
  children: ReactNode;
}

function Spinner({ isLoading, children }: Props) {
  return (
    <Spin
      spinning={isLoading}
      wrapperClassName={
        isLoading
          ? 'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-x-1/2 h-full [&>div]:h-full'
          : 'h-full [&>div]:h-full'
      }
    >
      {children}
    </Spin>
  );
}

export default Spinner;
