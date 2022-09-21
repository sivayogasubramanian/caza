import { initializeApp } from 'firebase/app';
import { AnimatePresence, motion } from 'framer-motion';
import Lottie from 'lottie-react';
import type { AppProps } from 'next/app';
import { useCallback, useEffect, useState } from 'react';
import { SWRConfig } from 'swr';
import splash from '../assets/splash.json';
import Header from '../components/header/Header';
import ApplicationNavBar from '../components/navigation/ApplicationNavBar';
import AuthContext from '../context/AuthContext';
import api from '../frontendApis/api';
import { AxiosInterceptor } from '../frontendApis/interceptor';
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

  const [isSplashScreenPlaying, setIsSplashScreenPlaying] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => {
      setIsSplashScreenPlaying(false);
    }, 3000);
  }, []);

  return (
    <AuthContext.Provider value={authContextValue}>
      <AxiosInterceptor>
        <SWRConfig
          value={{
            fetcher: (url) => api.get(url),
          }}
        >
          <AnimatePresence>
            {isSplashScreenPlaying && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Lottie className="h-screen w-60 m-auto" autoPlay loop animationData={splash} />
              </motion.div>
            )}
          </AnimatePresence>

          {!isSplashScreenPlaying && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }}>
              <Header />
              <Component {...pageProps} />
              <ApplicationNavBar />
            </motion.div>
          )}
        </SWRConfig>
      </AxiosInterceptor>
    </AuthContext.Provider>
  );
}

export default MyApp;
