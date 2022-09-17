import '../styles/globals.css';
import type { AppProps } from 'next/app';
import AuthContext from '../context/AuthContext';
import useAnonymousLoginIfNeeded from '../hooks/useAnonymousLoginIfNeeded';
import { AxiosInterceptor } from '../api/interceptor';
import { SWRConfig } from 'swr';
import api from '../api/api';
import Header from '../components/header/Header';

function MyApp({ Component, pageProps }: AppProps) {
  const authContextValue = useAnonymousLoginIfNeeded();
  return (
    <AuthContext.Provider value={authContextValue}>
      <AxiosInterceptor>
        <SWRConfig
          value={{
            fetcher: (url) => api.get(url),
          }}
        >
          <Header>
            <Component {...pageProps} />
          </Header>
        </SWRConfig>
      </AxiosInterceptor>
    </AuthContext.Provider>
  );
}

export default MyApp;
