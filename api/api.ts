/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError, AxiosPromise, AxiosResponse } from 'axios';
import { ApiPromise, ApiResponse, Payload, StatusMessageType } from '../types/apiResponse';

class BaseApi {
  client = axios.create({
    baseURL: '/api/',
    timeout: 10 * 1000, // 10 seconds
  });

  private getData<D extends Payload>(url: string, params?: any): AxiosPromise<ApiResponse<D>> {
    return this.client.get(url, params);
  }

  private postData<D extends Payload>(url: string, data: any = {}): AxiosPromise<ApiResponse<D>> {
    return this.client.post(url, data);
  }

  private patchData<D extends Payload>(url: string, data: any = {}): AxiosPromise<ApiResponse<D>> {
    return this.client.patch(url, data);
  }

  private deleteData<D extends Payload>(url: string): AxiosPromise<ApiResponse<D>> {
    return this.client.delete(url);
  }

  public get<D extends Payload>(url: string, params?: any): ApiPromise<D> {
    return processRequest(url, this.getData(url, params));
  }

  public post<D extends Payload>(url: string, data: any = {}): ApiPromise<D> {
    return processRequest(url, this.postData(url, data));
  }

  public patch<D extends Payload>(url: string, data: any = {}): ApiPromise<D> {
    return processRequest(url, this.patchData(url, data));
  }

  public delete<D extends Payload>(url: string): ApiPromise<D> {
    return processRequest(url, this.deleteData(url));
  }
}

export function processRequest<D extends Payload>(
  endpoint: string,
  promise: AxiosPromise<ApiResponse<D>>,
): ApiPromise<D> {
  return promise
    .then((response: AxiosResponse<ApiResponse<D>>) => {
      const apiResponse = response.data;

      if (process.env.NODE_ENV === 'development') {
        console.info(`[API] ${response.status} ${endpoint} : ${getResponseMessages(apiResponse)}`);
      }

      return apiResponse;
    })
    .catch((error: AxiosError<ApiResponse<D>>) => {
      if (process.env.NODE_ENV === 'development') {
        console.error(`[API] ${error.code} ${endpoint} : ${error.message}`);
      }

      throw makeApiErrorResponse(error);
    });
}

function makeApiErrorResponse<D extends Payload>(error: AxiosError<ApiResponse<D>>): ApiResponse<D> {
  if (!error?.response?.data.messages) {
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

  return error.response.data;
}

function getResponseMessages(response: ApiResponse<any>): string {
  return response.messages?.length > 0 ? response.messages.map((m) => m.message).join(' : ') : '-';
}

const api = new BaseApi();

export default api;
