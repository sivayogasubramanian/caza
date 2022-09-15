import { NextApiResponse } from 'next';
import { ApiResponse, Payload, StatusMessage, StatusMessageType } from '../../types/apiResponse';

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  RESET_CONTENT = 205,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  NOT_ALLOWED = 405,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

/**
 * Utility function that rejects all responses not in allowed methods with a 405 HTTP response.
 *
 * @param res The NextApiResponse object.
 * @param method The HTTP method that is rejected.
 */
export function rejectHttpMethod(res: NextApiResponse, method?: string) {
  res
    .status(HttpStatus.NOT_ALLOWED)
    .json(
      createJsonResponse(
        {},
        { type: StatusMessageType.ERROR, message: `HTTP method ${method ? method + ' ' : ''}not allowed!` },
      ),
    );
}

export function createJsonResponse<D extends Payload>(payload: D, ...messages: StatusMessage[]): ApiResponse<D> {
  return { payload, messages };
}

export function convertQueryParamToStringArray(
  paramValue: string | string[] | undefined,
  toArray: (value: string) => string[],
): string[] {
  if (paramValue === undefined) {
    return [];
  }

  return Array.isArray(paramValue) ? paramValue : toArray(paramValue);
}
