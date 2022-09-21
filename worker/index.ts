import { SW_PRECACHE_USER_DATA_MESSAGE } from '../utils/constants';

declare let self: ServiceWorkerGlobalScope;

const logRequest = (request: Request) => {
  console.log(`LOG FROM SERVICE WORKER: [Request] ${request.method} ${request.url}`);
};

const logResponse = async (response: Response) => {
  console.log(
    `LOG FROM SERVICE WORKER: [Response] Endpoint ${response.url} returned with ${response.status} ${response.statusText}`,
  );
  console.log(await response.json());
};

const precacheAllUserApplications = async (token: string) => {
  const applicationsResponse = await getApplicationList(token);
  const { payload, messages } = await applicationsResponse.json();
  if (!Array.isArray(payload)) {
    console.log('Empty payload received. Messages:', messages);
    return;
  }

  const applicationIds = payload.map((application) => application.id);
  applicationIds.forEach((applicationId) => {
    getIndividualApplication(token, applicationId);
  });
};

const getApplicationList = async (token: string) => {
  const listRequest = new Request('/api/applications', { headers: { Authorization: `Bearer ${token}` } });
  logRequest(listRequest);

  const response = await fetch(listRequest);
  logResponse(response.clone());

  caches.open('apis').then((cache) => {
    cache.put(listRequest, response.clone());
  });

  return response;
};

const getIndividualApplication = async (token: string, applicationId: number) => {
  const getRequest = new Request(`/api/applications/${applicationId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  logRequest(getRequest);

  const response = await fetch(getRequest);
  logResponse(response.clone());

  caches.open('apis').then((cache) => {
    cache.put(getRequest, response.clone());
  });
};

self.addEventListener('message', (event?: ExtendableMessageEvent) => {
  if (!event) {
    return;
  }

  if (event.origin !== 'http://localhost:3000') {
    return;
  }

  if (event.data.message === SW_PRECACHE_USER_DATA_MESSAGE) {
    event.waitUntil(precacheAllUserApplications(event.data.token));
  }
});
