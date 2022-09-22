import { SW_PRECACHE_USER_DATA_MESSAGE } from '../utils/constants';
import { precacheAllUserApplications } from './applications';

declare let self: ServiceWorkerGlobalScope;

self.addEventListener('message', (event?: ExtendableMessageEvent) => {
  console.log('Service worker received a message:', event);
  if (!event) {
    return;
  }

  if (event.data.message === SW_PRECACHE_USER_DATA_MESSAGE) {
    event.waitUntil(precacheAllUserApplications(event.data.token));
  }
});
