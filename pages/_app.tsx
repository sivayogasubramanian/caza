import type { AppProps } from 'next/app';
import { SWRConfig } from 'swr';
import api from '../api/api';
import { AxiosInterceptor } from '../api/interceptor';
import Header from '../components/header/Header';
import ApplicationNavBar from '../components/navigation/ApplicationNavBar';
import AuthContext from '../context/AuthContext';
import useAnonymousLoginIfNeeded from '../hooks/useAnonymousLoginIfNeeded';
import '../styles/globals.css';

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
            <ApplicationNavBar>
              <Component {...pageProps} />
            </ApplicationNavBar>
          </Header>
        </SWRConfig>
      </AxiosInterceptor>
    </AuthContext.Provider>
  );
}

export default MyApp;
