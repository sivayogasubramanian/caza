export enum StatusMessageType {
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
}

export interface StatusMessage {
  type: StatusMessageType;
  message: string;
}

export interface ApiResponse<T> {
  payload: T | EmptyPayload;
  messages: StatusMessage[];
}

export type EmptyPayload = Record<string, never>;
