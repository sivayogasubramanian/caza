import { User, Auth } from 'firebase/auth';
import { createContext } from 'react';

type ContextProps = {
  currentUser: User | undefined;
  setCurrentUser: (newUser: User) => void;
  auth: Auth | undefined;
};

const AuthContext = createContext<ContextProps>({
  currentUser: undefined,
  setCurrentUser: () => undefined,
  auth: undefined,
});

export default AuthContext;
