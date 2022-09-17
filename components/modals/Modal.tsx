import React from 'react';

interface Props {
  content: JSX.Element;
  title?: string;
}

function Modal({ content, title }: Props) {
  return (
    <div className="fixed inset-0 w-screen h-screen bg-gray-900/60 z-50 flex justify-center items-center">
      <div className="shadow-md rounded-lg bg-white w-5/6 flex-col items-center justify-between">
        {title && <div className="text-lg font-bold mt-1 mb-1 ml-2 mr-2">{title}</div>}
        {content}
      </div>
    </div>
  );
}

export default Modal;
