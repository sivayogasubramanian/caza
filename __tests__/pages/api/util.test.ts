import { PrismaClient } from '@prisma/client';
import { spawn, spawnSync } from 'child_process';
import { NextApiRequest, NextApiResponse } from 'next';
import { cwd } from 'process';
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

let x = (new Date().getTime() % 100000) * 1000;

export function getUniqueModifier() {
  x += 1;
  return x;
}

export function prismaMigrateReset() {
  process.stdout.write('Resetting database.');

  const command = 'yarn';
  const args = ['prisma', 'migrate', 'reset', '--force'];
  const options = {
    shell: true,
    cwd: cwd(),
  };

  spawnSync(command, args, options);
}

export async function getUser(prisma: PrismaClient, uid: string) {
  return prisma.user.findUnique({
    where: { uid },
    select: { applications: { include: { applicationStages: true, tasks: true } } },
  });
}

export async function getUserOrThrow(prisma: PrismaClient, uid: string) {
  return getUser(prisma, uid).then((user) => {
    if (!user) {
      throw new Error('Test utility: Bad UID.');
    }
    return user;
  });
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
