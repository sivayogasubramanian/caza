export enum StatusMessageType {
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
}

export interface StatusMessage {
  type: StatusMessageType;
  message: string;
}

export interface Response<D> {
  payload: D;
  messages: StatusMessage[];
}

export type EmptyPayload = Record<string, never>;

export type ApiResponse<D> = Response<D | EmptyPayload>;
