import '../styles/globals.css';
import type { AppProps } from 'next/app';
import AuthContext from '../context/AuthContext';
import useAnonymousLoginIfNeeded from '../hooks/useAnonymousLoginIfNeeded';
import { AxiosInterceptor } from '../api/interceptor';
import { SWRConfig } from 'swr';
import api from '../api/api';

function MyApp({ Component, pageProps }: AppProps) {
  const authContextValue = useAnonymousLoginIfNeeded();
  return (
    <AuthContext.Provider value={authContextValue}>
      <AxiosInterceptor>
        <SWRConfig
          value={{
            fetcher: (url) => api.get(url).then((res) => res.data),
          }}
        >
          <Component {...pageProps} />
        </SWRConfig>
      </AxiosInterceptor>
    </AuthContext.Provider>
  );
}

export default MyApp;
