import { ApiPromise, EmptyPayload } from '../types/apiResponse';
import { ApplicationStageData, ApplicationStagePatchData, ApplicationStagePostData } from '../types/applicationStage';
import api from './api';
import { APPLICATIONS_API_ENDPOINT } from './applicationsApi';

export const APPLICATION_STAGES_API_ENDPOINT = 'stages';

class ApplicationStagesApi {
  public createApplicationStage(
    applicationId: number,
    stage: ApplicationStagePostData,
  ): ApiPromise<ApplicationStageData> {
    return api.post(this.makeApplicationStagesApiEndpoint(applicationId), stage);
  }

  public editApplicationStage(
    applicationId: number,
    stageId: number,
    stagePatchData: ApplicationStagePatchData,
  ): ApiPromise<ApplicationStageData> {
    return api.patch(`${this.makeApplicationStagesApiEndpoint(applicationId)}/${stageId}`, stagePatchData);
  }

  public deleteApplicationStage(applicationId: number, stageId: number): ApiPromise<EmptyPayload> {
    return api.delete(`${APPLICATIONS_API_ENDPOINT}/${applicationId}/${APPLICATION_STAGES_API_ENDPOINT}/${stageId}`);
  }

  private makeApplicationStagesApiEndpoint(applicationId: number) {
    return `${APPLICATIONS_API_ENDPOINT}/${applicationId}/${APPLICATION_STAGES_API_ENDPOINT}`;
  }
}

const applicationStagesApi = new ApplicationStagesApi();

export default applicationStagesApi;
