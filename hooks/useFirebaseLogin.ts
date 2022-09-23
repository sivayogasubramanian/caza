import { getApps } from 'firebase/app';
import { Auth, getAuth, onAuthStateChanged, signInAnonymously, User } from 'firebase/auth';
import { useCallback, useEffect, useState } from 'react';
import usersApi from '../frontendApis/usersApi';
import { Nullable } from '../types/utils';
import { precacheUserData } from '../worker/client';

/**
 * Hook that handles anonymous log in / register if not already logged in or attaches the verified login.
 *
 * Note that this hook should not be needed in most cases as it is already called in `_app.tsx`.
 * Call this hook when firebase auth functions are required (e.g. `getAuth`, `signOut`, `signInWith`...)
 * Do not call this hook to access user object (Just use `AuthContext.Consumer`)
 */
export default function useFirebaseLogin() {
  const [currentUser, setCurrentUser] = useState<User>();
  const [auth, setAuth] = useState<Auth>();

  const handleAuthStateChanged = useCallback(
    async (user: Nullable<User>) => {
      if (user) {
        user.getIdToken().then(precacheUserData);
      } else {
        const auth = getAuth();
        const newUser = await signInAnonymously(auth);
        user = newUser.user;
        user.getIdToken().then(usersApi.createAccount);
      }

      setCurrentUser(user);
    },

    [getAuth, signInAnonymously],
  );

  useEffect(() => {
    if (!getApps().length) {
      throw new Error('Firebase app has not been initiated.');
    }

    const auth = getAuth();
    setAuth(auth);

    const unsubscribe = onAuthStateChanged(auth, handleAuthStateChanged);
    return () => unsubscribe();
  }, []);

  return { currentUser, setCurrentUser, auth };
}
