import { NextApiRequest, NextApiResponse } from 'next';
import helloHandler from '../../../pages/api/hello';
import { ApiResponse, StatusMessageType } from '../../../types/apiResponse';
import { HttpMethod, HttpStatus } from '../../../utils/http/httpHelpers';

function createMocks<D>(
  handler: (req: NextApiRequest, res: NextApiResponse<ApiResponse<D>>) => void,
  // eslint-disable-next-line
  { uid, method, query, body }: { uid: string; method: HttpMethod; query?: Record<string, string>; body?: any },
) {
  const req = { method, headers: { authorization: `Bearer ${uid}` }, query, body } as NextApiRequest;

  const sendFn = jest.fn((_json) => {});
  const status = jest.fn((_statusCode) => {
    return { json: sendFn };
  });
  const res = { status } as unknown as NextApiResponse<ApiResponse<D>>;

  const getResult = () => {
    const jsonCalls = sendFn.mock.lastCall;
    const statusCalls = status.mock.lastCall;
    return {
      status: (statusCalls as HttpStatus[])[0],
      json: (jsonCalls as ApiResponse<D>[])[0],
    };
  };

  return { req, res, getResult };
}

describe('/api/hello API Endpoint', () => {
  function mock(uid: string, method: HttpMethod) {
    return createMocks(helloHandler, { uid, method });
  }

  it('Should succeed', async () => {
    const { req, res, getResult } = mock('foo', HttpMethod.GET);
    await helloHandler(req, res);
    const { status, json } = getResult();
    expect(status).toBe(HttpStatus.OK);
    expect(json.messages.map((m) => m.type)).toContain(StatusMessageType.SUCCESS);
    expect(json.messages.map((m) => m.message) + '').toContain('Hello!');
  });
});
