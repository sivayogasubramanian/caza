import { getApps } from 'firebase/app';
import { Auth, getAuth, getRedirectResult, onAuthStateChanged, signInAnonymously, User } from 'firebase/auth';
import { useCallback, useEffect, useState } from 'react';
import usersApi from '../frontendApis/usersApi';
import { openNotification } from '../components/notification/Notifier';
import { ApiResponse } from '../types/apiResponse';
import { UserData } from '../types/user';
import { Nullable } from '../types/utils';
import { getPreviousUserToken, removePreviousUserToken } from '../utils/localStorage/temporaryUserKeyStorage';
import { precacheUserData } from '../worker/utils';

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
        const newUserToken = await user.getIdToken();

        precacheUserData(newUserToken);

        const result = await getRedirectResult(getAuth());

        // This can happen due to a login flow or re-authentication required by firebase (cannot be predicted).
        // In event of re-authenticating by Github, previous user token should be set as undefined (no linking).
        if (result) {
          const oldUserToken = getPreviousUserToken() ?? undefined;
          usersApi
            .createAccount(newUserToken, oldUserToken)
            .catch((result: ApiResponse<UserData>) => result.messages.forEach((message) => openNotification(message)))
            .finally(removePreviousUserToken);
        }
      } else {
        const auth = getAuth();
        const newUser = await signInAnonymously(auth);
        user = newUser.user;
        user.getIdToken().then(usersApi.createAccount);
      }

      setCurrentUser(user);
      console.log('SET CURRENT USER');
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
