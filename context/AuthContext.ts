import { User, Auth } from 'firebase/auth';
import { createContext } from 'react';

type AuthContextProps = {
  currentUser: User | undefined;
  setCurrentUser: (newUser: User) => void;
  auth: Auth | undefined;
};

const AuthContext = createContext<AuthContextProps>({
  currentUser: undefined,
  setCurrentUser: () => undefined,
  auth: undefined,
});

export default AuthContext;
