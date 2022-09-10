import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../types/apiResponse';
import { HttpMethod, HttpStatus } from '../../../utils/http/httpHelpers';

let prisma: PrismaClient;

export function getPrismaClientForTests() {
  // Use package.json scripts to set up and expose a postgres docker instance at 5433.
  process.env.DATABASE_URL = 'postgresql://postgres:password@localhost:5433';
  if (!prisma) prisma = new PrismaClient();

  // If you wish to ensure different test suites don't conflict, run jest with "--runInBand".
  // Alternatively, just follow good practice and make sure you don't use the same resources in the database.
  return prisma;
}

export function createMocks<D>(
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

test.skip('Workaround to use test file for exporting only.', () => undefined);
