import axios, { AxiosRequestConfig } from 'axios';
import { ReactElement, useContext, useEffect, useState } from 'react';
import AuthContext from '../context/AuthContext';

type Props = {
  children: ReactElement;
};

const AxiosInterceptor = ({ children }: Props) => {
  const { currentUser } = useContext(AuthContext);
  const [jwtToken, setJwtToken] = useState<string>();
  const [isIntercepted, setIsIntercepted] = useState<boolean>(false);

  useEffect(() => {
    currentUser?.getIdToken().then(setJwtToken);
  }, [currentUser, setJwtToken]);

  useEffect(() => {
    // Set the interceptor only when the token is available
    if (!jwtToken) return;

    const requestInterceptor = (config: AxiosRequestConfig) => {
      if (!config || !config.headers) {
        return config;
      }

      config.headers.Authorization = `Bearer ${jwtToken}`;
      return config;
    };

    const interceptor = axios.interceptors.request.use(requestInterceptor);
    setIsIntercepted(true);

    return () => axios.interceptors.request.eject(interceptor);
  }, [jwtToken]);

  if (!isIntercepted) return null;

  return children;
};

export { AxiosInterceptor };
