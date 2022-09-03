import { User, Auth } from 'firebase/auth';
import { createContext } from 'react';

type ContextProps = {
    currentUser: User | undefined;
    setCurrentUser: Function;
    auth: Auth | undefined;
};

const AuthContext = createContext<ContextProps>({
    currentUser: undefined,
    setCurrentUser: () => {},
    auth: undefined,
});

export default AuthContext;
