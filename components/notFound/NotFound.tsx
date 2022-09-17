import RandomKawaii from '../../components/notFound/RandomKawaii';

interface Props {
  message?: string;
}

function NotFound({ message }: Props) {
  return (
    <div className="flex flex-col justify-center items-center mt-10">
      <RandomKawaii size={100} />

      {message && <p className="text-gray-400">{message}</p>}
    </div>
  );
}

export default NotFound;
