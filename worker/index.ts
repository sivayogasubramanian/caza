import { SW_PRECACHE_USER_DATA_MESSAGE } from '../utils/constants';
import { precacheAllUserApplications } from './applications';

declare let self: ServiceWorkerGlobalScope;

self.addEventListener('message', (event?: ExtendableMessageEvent) => {
  if (!event) {
    return;
  }

  if (event.origin !== window.location.origin) {
    // Ignore if the event is not from the same origin
    return;
  }

  if (event.data.message === SW_PRECACHE_USER_DATA_MESSAGE) {
    event.waitUntil(precacheAllUserApplications(event.data.token));
  }
});
