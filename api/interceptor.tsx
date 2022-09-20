import { AxiosRequestConfig } from 'axios';
import { ReactElement, useContext, useEffect, useState } from 'react';
import { openNotification } from '../components/notification/Notifier';
import AuthContext from '../context/AuthContext';
import { StatusMessage } from '../types/apiResponse';
import { toQueryString } from '../utils/url';
import api from './api';

type Props = {
  children: ReactElement;
};

const AxiosInterceptor = ({ children }: Props) => {
  const { currentUser } = useContext(AuthContext);
  const [jwtToken, setJwtToken] = useState<string>();
  const [jwtExpiry, setJwtExpiry] = useState<Date>();
  const [isIntercepted, setIsIntercepted] = useState<boolean>(false);

  const refreshToken = () => {
    currentUser?.getIdTokenResult(true).then((result) => {
      setJwtToken(result.token);
      setJwtExpiry(new Date(result.expirationTime));
    });
  };

  const millisecondsToExpiry = jwtExpiry?.getTime() ?? 0 - new Date().getTime();
  const hasExpired = millisecondsToExpiry <= 0;
  useEffect(refreshToken, [currentUser, setJwtToken, hasExpired]);

  useEffect(() => {
    // Set the interceptor only when the token is available
    if (!jwtToken) return;

    const requestInterceptor = (config: AxiosRequestConfig) => {
      if (!config || !config.headers) {
        return config;
      }

      config.headers.Authorization = `Bearer ${jwtToken}`;
      config.paramsSerializer = toQueryString;

      return config;
    };

    const interceptor = api.client.interceptors.request.use(requestInterceptor);
    const responseInterceptor = api.client.interceptors.response.use(
      (response) => {
        const statusMessages = (response.data?.messages as StatusMessage[]) || [];

        statusMessages.forEach((message) => {
          openNotification(message);
        });

        return response;
      },
      (error) => {
        const statusMessages = (error.response?.data?.messages as StatusMessage[]) || [];

        statusMessages.forEach((message) => {
          openNotification(message);
        });

        return error;
      },
    );

    setIsIntercepted(true);

    return () => {
      api.client.interceptors.request.eject(interceptor);
      api.client.interceptors.response.eject(responseInterceptor);
    };
  }, [jwtToken, setIsIntercepted]);

  if (!isIntercepted) return null;

  return children;
};

export { AxiosInterceptor };
