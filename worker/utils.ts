import { SW_PRECACHE_USER_DATA_MESSAGE } from '../utils/constants';

export const precacheUserData = (userToken: string): void => {
  window.navigator.serviceWorker.ready.then((worker) => {
    worker.active?.postMessage({
      message: SW_PRECACHE_USER_DATA_MESSAGE,
      token: userToken,
    });
  });
};
