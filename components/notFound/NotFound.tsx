import RandomKawaii from '../../components/notFound/RandomKawaii';

interface Props {
  message?: string;
}

function NotFound({ message }: Props) {
  return (
    <div className="flex flex-col justify-center items-center mt-10">
      <RandomKawaii isHappy={false} size={100} />

      {message && <p className="mt-1 text-gray-400">{message}</p>}
    </div>
  );
}

export default NotFound;
