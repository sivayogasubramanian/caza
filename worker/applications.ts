export const precacheAllUserApplications = async (token: string) => {
  const applicationsResponse = await getApplicationList(token);
  const { payload } = await applicationsResponse.json();
  if (!Array.isArray(payload)) {
    return;
  }

  const applicationIds = payload.map((application) => application.id);
  applicationIds.forEach((applicationId) => {
    getIndividualApplication(token, applicationId);
  });
};

const getApplicationList = async (token: string) => {
  const listRequest = new Request('/api/applications', { headers: { Authorization: `Bearer ${token}` } });
  const response = await fetch(listRequest);

  caches.open('apis').then((cache) => {
    cache.put(listRequest, response.clone());
  });

  return response;
};

const getIndividualApplication = async (token: string, applicationId: number) => {
  const getRequest = new Request(`/api/applications/${applicationId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const response = await fetch(getRequest);

  caches.open('apis').then((cache) => {
    cache.put(getRequest, response.clone());
  });
};
