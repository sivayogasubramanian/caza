import '../styles/globals.css';
import type { AppProps } from 'next/app';
import AuthContext from '../context/AuthContext';
import useAnonymousLoginIfNeeded from '../hooks/useAnonymousLoginIfNeeded';

function MyApp({ Component, pageProps }: AppProps) {
  const authContextValue = useAnonymousLoginIfNeeded();
  return (
    <AuthContext.Provider value={authContextValue}>
      <Component {...pageProps} />
    </AuthContext.Provider>
  );
}

export default MyApp;
