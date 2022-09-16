export enum StatusMessageType {
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
}

export interface StatusMessage {
  type: StatusMessageType;
  message: string;
}

export interface Response<D extends Payload> {
  payload: D;
  messages: StatusMessage[];
}

export type EmptyPayload = Record<string, never>;

export type ApiResponse<D extends Payload> = Response<D | EmptyPayload>;

export type Payload = PayloadInterface | PayloadInterface[];

interface PayloadInterface {
  [key: string]: undefined | null | string | number | boolean | Payload | string[] | number[] | Payload[];
}

export type ApiPromise<D extends Payload> = Promise<ApiResponse<D>>;
