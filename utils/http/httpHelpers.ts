import { NextApiResponse } from 'next';
import { ApiResponse, EmptyPayload, StatusMessage, StatusMessageType } from '../../types/apiResponse';

export const HTTP_GET_METHOD = 'GET';
export const HTTP_POST_METHOD = 'POST';
export const HTTP_PUT_METHOD = 'PUT';
export const HTTP_DELETE_METHOD = 'DELETE';
export const HTTP_PATCH_METHOD = 'PATCH';
export const HTTP_HEAD_METHOD = 'HEAD';

export const HTTP_STATUS_OK = 200;
export const HTTP_STATUS_CREATED = 201;
export const HTTP_STATUS_ACCEPTED = 202;
export const HTTP_STATUS_NO_CONTENT = 204;
export const HTTP_STATUS_BAD_REQUEST = 400;
export const HTTP_STATUS_UNAUTHORIZED = 401;
export const HTTP_STATUS_FORBIDDEN = 403;
export const HTTP_STATUS_NOT_FOUND = 404;
export const HTTP_STATUS_METHOD_NOT_ALLOWED = 405;
export const HTTP_STATUS_CONFLICT = 409;
export const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500;

/**
 * Utility function that rejects all responses not in allowed methods with a 405 HTTP response.
 *
 * @param res The NextApiResponse object.
 * @param method The HTTP method that is rejected.
 */
export function rejectHttpMethod(res: NextApiResponse, method?: string) {
  res
    .status(405)
    .json(createJsonResponse({}, [{ type: StatusMessageType.Error, message: `HTTP method ${method} not allowed!` }]));
}

export function createJsonResponse<D>(payload: D | EmptyPayload, messages?: StatusMessage[]): ApiResponse<D> {
  return {
    payload: payload,
    messages: messages ?? [],
  };
}
