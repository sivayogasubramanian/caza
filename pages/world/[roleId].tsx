import { NextPage } from 'next';
import { useContext } from 'react';
import RoleSankey from '../../components/sankey/RoleSankey';
import AuthContext from '../../context/AuthContext';

const RoleWorldPage: NextPage = () => {
  const { currentUser } = useContext(AuthContext);
  if (!currentUser || currentUser.isAnonymous) {
    // TODO: Make a consistent component (shared between world/index.tsx and world/[roleId].tsx)
    return <div>Insert Log In or Go Back component here.</div>;
  }

  return (
    <div>
      <RoleSankey />
    </div>
  );
};

export default RoleWorldPage;
