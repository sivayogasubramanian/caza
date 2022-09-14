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
  public getApplications(applicationQueryParams: ApplicationQueryParams): ApiPromise<ApplicationListData[]> {
    return api.get(APPLICATIONS_API_ENDPOINT, { params: applicationQueryParams }).then((res) => res.data);
  }

  public getApplication(applicationId: number): ApiPromise<ApplicationData> {
    return api.get(`${APPLICATIONS_API_ENDPOINT}/${applicationId}`).then((res) => res.data);
  }

  public createApplication(application: ApplicationPostData): ApiPromise<ApplicationData> {
    return api.post(APPLICATIONS_API_ENDPOINT, application).then((res) => res.data);
  }

  public deleteApplication(applicationId: number): ApiPromise<EmptyPayload> {
    return api.delete(`${APPLICATIONS_API_ENDPOINT}/${applicationId}`).then((res) => res.data);
  }
}

const applicationsApi = new ApplicationsApi();

export default applicationsApi;
