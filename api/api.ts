/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError, AxiosPromise, AxiosResponse } from 'axios';
import { ApiPromise, ApiResponse, EmptyPayload, StatusMessageType } from '../types/apiResponse';
class BaseApi {
  client = axios.create({
    baseURL: '/api/',
    timeout: 10 * 1000, // 10 seconds
  });

  private getData<D>(url: string, params?: any): AxiosPromise<ApiResponse<D>> {
    return this.client.get(url, params);
  }

  private postData<D>(url: string, data: any = {}): AxiosPromise<ApiResponse<D>> {
    return this.client.post(url, data);
  }

  private patchData<D>(url: string, data: any = {}): AxiosPromise<ApiResponse<D>> {
    return this.client.patch(url, data);
  }

  private deleteData<D>(url: string): AxiosPromise<ApiResponse<D>> {
    return this.client.delete(url);
  }

  public get<D>(url: string, params?: any): ApiPromise<D> {
    return processRequest(url, this.getData(url, params));
  }

  public post<D>(url: string, data: any = {}): ApiPromise<D> {
    return processRequest(url, this.postData(url, data));
  }

  public patch<D>(url: string, data: any = {}): ApiPromise<D> {
    return processRequest(url, this.patchData(url, data));
  }

  public delete<D>(url: string): ApiPromise<D> {
    return processRequest(url, this.deleteData(url));
  }
}

function processRequest<D>(endpoint: string, promise: AxiosPromise<ApiResponse<D>>): ApiPromise<D> {
  return promise
    .then((response: AxiosResponse) => {
      const apiResponse = response.data;

      if (process.env.NODE_ENV === 'development') {
        console.info(`[API] ${response.status} ${endpoint} : ${getResponseMessages(apiResponse)}`);
      }

      return apiResponse;
    })
    .catch((error: AxiosError) => {
      if (process.env.NODE_ENV === 'development') {
        console.error(`[API] ${error.code} ${endpoint} : ${error.message}`);
      }

      throw makeApiErrorResponse(error);
    });
}

function makeApiErrorResponse(error: AxiosError): ApiResponse<EmptyPayload> {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (!error.response || !error.response.data || !error.response.data.messages) {
    return {
      payload: {},
      messages: [
        {
          type: StatusMessageType.ERROR,
          message: 'Request failed, please check your internet connection or refresh the page and try again.',
        },
      ],
    };
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return error.response.data;
}

function getResponseMessages(response: ApiResponse<any>): string {
  return response.messages?.length > 0 ? response.messages.map((m) => m.message).join(' : ') : '-';
}

const api = new BaseApi();

export default api;
