import { ApiPromise, EmptyPayload } from '../types/apiResponse';
import { TaskData, TaskPatchData, TaskPostData } from '../types/task';
import api from './api';
import { APPLICATIONS_API_ENDPOINT } from './applicationsApi';

export const TASKS_API_ENDPOINT = 'tasks';

class TasksApi {
  public createTask(applicationId: number, task: TaskPostData): ApiPromise<TaskData> {
    return api.post(this.makeTasksApiEndpoint(applicationId), task);
  }

  public editTask(applicationId: number, taskId: number, taskPatchData: TaskPatchData): ApiPromise<TaskData> {
    return api.post(`${this.makeTasksApiEndpoint(applicationId)}/${taskId}`, taskPatchData);
  }

  public deleteTask(applicationId: number, taskId: number): ApiPromise<EmptyPayload> {
    return api.delete(`${this.makeTasksApiEndpoint(applicationId)}/${taskId}`);
  }

  private makeTasksApiEndpoint(applicationId: number) {
    return `${APPLICATIONS_API_ENDPOINT}/${applicationId}/${TASKS_API_ENDPOINT}`;
  }
}

const tasksApi = new TasksApi();

export default tasksApi;
