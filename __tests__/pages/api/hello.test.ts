import helloHandler from '../../../pages/api/hello';
import { StatusMessageType } from '../../../types/apiResponse';
import { HttpMethod, HttpStatus } from '../../../utils/http/httpHelpers';
import { createMocks } from './util.test';

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
