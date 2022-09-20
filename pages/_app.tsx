import { initializeApp } from 'firebase/app';
import type { AppProps } from 'next/app';
import { useCallback } from 'react';
import { SWRConfig } from 'swr';
import api from '../frontendApis/api';
import { AxiosInterceptor } from '../frontendApis/interceptor';
import Header from '../components/header/Header';
import ApplicationNavBar from '../components/navigation/ApplicationNavBar';
import AuthContext from '../context/AuthContext';
import useFirebaseLogin from '../hooks/useFirebaseLogin';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
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
  initFirebase();

  const authContextValue = useFirebaseLogin();
  return (
    <AuthContext.Provider value={authContextValue}>
      <AxiosInterceptor>
        <SWRConfig
          value={{
            fetcher: (url) => api.get(url),
          }}
        >
          <Header />
          <Component {...pageProps} />
          <ApplicationNavBar />
        </SWRConfig>
      </AxiosInterceptor>
    </AuthContext.Provider>
  );
}

export default MyApp;
