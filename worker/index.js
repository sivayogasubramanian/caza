'use strict';

const logRequest = (request) => {
  console.log(`LOG FROM SERVICE WORKER: [Request] ${request.method} ${request.url}`);
};

const logResponse = async (response) => {
  console.log(
    `LOG FROM SERVICE WORKER: [Response] Endpoint ${response.url} returned with ${response.status} ${response.statusText}`,
  );
  console.log(await response.json());
};

const precacheAllUserApplications = async (token) => {
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

const getApplicationList = async (token) => {
  const listRequest = new Request('/api/applications', { headers: { Authorization: `Bearer ${token}` } });
  logRequest(listRequest);

  const response = await fetch(listRequest);
  logResponse(response.clone());

  caches.open('apis').then((cache) => {
    cache.put(listRequest, response.clone());
  });

  return response;
};

const getIndividualApplication = async (token, applicationId) => {
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

self.addEventListener('message', (event) => {
  if (event.origin !== 'http://localhost:3000') {
    return;
  }

  if (event.data.message === 'PRECACHE_USER_APPLICATIONS') {
    event.waitUntil(precacheAllUserApplications(event.data.token));
  }
});
