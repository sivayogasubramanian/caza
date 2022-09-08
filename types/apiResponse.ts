export enum StatusMessageType {
  Error = 0,
  Warning = 1,
  Information = 2,
  Success = 3,
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
