interface Props {
  content: JSX.Element;
}

function Modal({ content }: Props) {
  return (
    <div className="fixed inset-0 w-screen h-screen bg-gray-900/60 z-50 flex justify-center items-center">
      <div className="shadow-md rounded-lg bg-white w-5/6 flex-col items-center justify-between">{content}</div>
    </div>
  );
}

export default Modal;
