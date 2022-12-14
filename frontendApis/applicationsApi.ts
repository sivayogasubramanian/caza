import { ApiPromise, EmptyPayload } from '../types/apiResponse';
import {
  ApplicationData,
  ApplicationListData,
  ApplicationPostData,
  ApplicationQueryParams,
} from '../types/application';
import api from './api';

export const APPLICATIONS_API_ENDPOINT = 'applications';

class ApplicationsApi {
  public getApplications(
    applicationQueryParams: ApplicationQueryParams,
    token: string,
  ): ApiPromise<ApplicationListData[]> {
    return api.get(APPLICATIONS_API_ENDPOINT, {
      params: applicationQueryParams,
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  public getApplication(applicationId: number): ApiPromise<ApplicationData> {
    return api.get(`${APPLICATIONS_API_ENDPOINT}/${applicationId}`);
  }

  public createApplication(application: ApplicationPostData): ApiPromise<ApplicationData> {
    return api.post(APPLICATIONS_API_ENDPOINT, application);
  }

  public deleteApplication(applicationId: number): ApiPromise<EmptyPayload> {
    return api.delete(`${APPLICATIONS_API_ENDPOINT}/${applicationId}`);
  }
}

const applicationsApi = new ApplicationsApi();

export default applicationsApi;
