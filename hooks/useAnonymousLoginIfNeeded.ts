import { useCallback, useEffect, useState } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { Auth, getAuth, onAuthStateChanged, signInAnonymously, User } from 'firebase/auth';

/**
 * Hook that handles anonymous log in / register if not already logged in. This will also handle firebase
 * initialization if needed.
 *
 * Note that this hook should not be needed in most cases as it is already called in `_app.tsx`.
 * Call this hook when firebase auth functions are required (e.g. `getAuth`, `signOut`, `signInWith`...)
 * Do not call this hook to access user object (Just use `AuthContext.Consumer`)
 */
export default function useAnonymousLoginIfNeeded() {
    const initFirebase = useCallback(() => {
        initializeApp({
            apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
            authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        });
    }, [initializeApp]);

    const [currentUser, setCurrentUser] = useState<User>();
    const [auth, setAuth] = useState<Auth>();

    const handleAuthStateChanged = useCallback(
        async (user: User | null) => {
            if (user) {
                setCurrentUser(user);
            } else {
                const auth = getAuth();
                await signInAnonymously(auth);
            }
        },
        [getAuth, signInAnonymously],
    );

    useEffect(() => {
        if (!getApps().length) {
            initFirebase();
        }

        const auth = getAuth();
        setAuth(auth);

        const unsubscribe = onAuthStateChanged(auth, handleAuthStateChanged);
        return () => unsubscribe();
    }, []);

    return { currentUser, setCurrentUser, auth };
}
