import { SW_PRECACHE_USER_DATA } from '../utils/constants';

export const precacheUserData = (userToken: string): void => {
  window.navigator.serviceWorker.ready.then((worker) => {
    worker.active?.postMessage({
      message: SW_PRECACHE_USER_DATA,
      token: userToken,
    });
  });
};
