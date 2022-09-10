import '../styles/globals.css';
import type { AppProps } from 'next/app';
import AuthContext from '../context/AuthContext';
import useAnonymousLoginIfNeeded from '../hooks/useAnonymousLoginIfNeeded';
import { AxiosInterceptor } from '../axios/interceptor';

function MyApp({ Component, pageProps }: AppProps) {
  const authContextValue = useAnonymousLoginIfNeeded();
  return (
    <AuthContext.Provider value={authContextValue}>
      <AxiosInterceptor>
        <Component {...pageProps} />
      </AxiosInterceptor>
    </AuthContext.Provider>
  );
}

export default MyApp;
