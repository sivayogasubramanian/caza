import {
  createMocks,
  getPrismaClientForTests,
  getUniqueModifier,
  getUserOrThrow,
  prismaMigrateReset,
} from '../../../util.test';
import stagesHandler from '../../../../../../pages/api/applications/[applicationId]/stages/index';
import { HttpMethod, HttpStatus } from '../../../../../../utils/http/httpHelpers';
import { ApplicationStagePostData } from '../../../../../../types/applicationStage';
import { ApplicationStageType, PrismaClient, User } from '@prisma/client';

beforeAll(prismaMigrateReset);
afterAll(prismaMigrateReset);

const createStagePostMocks = (uid: string, applicationId: number, body: ApplicationStagePostData) =>
  createMocks(stagesHandler, { uid, method: HttpMethod.POST, body, query: { applicationId: applicationId + '' } });

describe('POST to create stage works.', () => {
  const prisma = getPrismaClientForTests();

  it('Allows for POST creation', async () => {
    const uid = await createUser(prisma, { type: 'APPLIED', date: '2022-10-01' });
    const user = await getUserOrThrow(prisma, uid);
    const applicationId = user.applications[0].id;
    const type = 'OFFERED';
    const { req, res, getResult } = createStagePostMocks(uid, applicationId, {
      type,
      date: new Date(),
    });

    await stagesHandler(req, res);
    const { status, json } = getResult();

    const stage = await prisma.applicationStage.findFirstOrThrow({ where: { applicationId, type } });
    expect(status).toBe(HttpStatus.CREATED);
    expect(json.payload).toEqual(stage);
  });

  it('Does not POST with bad applicationId', async () => {
    const uid = await createUser(prisma, { type: 'APPLIED', date: '2022-10-01' });
    const user = await getUserOrThrow(prisma, uid);
    const applicationId = 'bad' as any as number;
    const type = 'OFFERED';
    const { req, res, getResult } = createStagePostMocks(uid, applicationId, {
      type,
      date: new Date(),
    });

    await stagesHandler(req, res);
    const { status, json } = getResult();

    expect(status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('Does not POST unauthorized applicationId', async () => {
    const uid = await createUser(prisma, { type: 'APPLIED', date: '2022-10-01' });
    const user = await getUserOrThrow(prisma, uid);
    const applicationId = 1;
    const type = 'OFFERED';
    const { req, res, getResult } = createStagePostMocks(uid, applicationId, {
      type,
      date: new Date(),
    });

    await stagesHandler(req, res);
    const { status, json } = getResult();

    expect(status).toBe(HttpStatus.NOT_FOUND);
  });

  it('Bad type parameter will fail', async () => {
    const uid = await createUser(prisma, { type: 'APPLIED', date: '2022-10-01' });
    const user = await getUserOrThrow(prisma, uid);
    const applicationId = user.applications[0].id;
    const type = 'OFFERE' as 'OFFERED';
    const { req, res, getResult } = createStagePostMocks(uid, applicationId, {
      type,
      date: new Date(),
    });

    await stagesHandler(req, res);
    const { status, json } = getResult();

    expect(status).toBe(HttpStatus.BAD_REQUEST);
  });

  function badDateParameterWillFail(notDate: any) {
    it(`Bad date parameter ${notDate} will fail`, async () => {
      const uid = await createUser(prisma, { type: 'APPLIED', date: '2022-10-01' });
      const user = await getUserOrThrow(prisma, uid);
      const applicationId = user.applications[0].id;
      const type = 'OFFERED';
      const { req, res, getResult } = createStagePostMocks(uid, applicationId, {
        type,
        date: notDate as Date,
      });

      await stagesHandler(req, res);
      const { status, json } = getResult();

      expect(status).toBe(HttpStatus.BAD_REQUEST);
    });
  }

  badDateParameterWillFail({});
  badDateParameterWillFail(null);
  badDateParameterWillFail(undefined);
  badDateParameterWillFail('');
});

describe.skip('Other HTTP methods will fail.', () => {
  const prisma = getPrismaClientForTests();

  function testMethod(method: HttpMethod) {
    it(`${method} method does not work`, async () => {
      const uid = await createUser(prisma, { type: 'APPLIED', date: '2022-10-01' });
      const user = await prisma.user.findUnique({ where: { uid }, include: { applications: true } });
      if (!user) {
        throw Error('Bad UID used.');
      }
      const applicationId = user.applications[0].id + '';
      const { req, res, getResult } = createMocks(stagesHandler, { uid, method, query: { applicationId } });

      await stagesHandler(req, res);
      const { status, json } = getResult();

      expect(status).toBe(HttpStatus.NOT_ALLOWED);
    });
  }

  testMethod(HttpMethod.PATCH);
  testMethod(HttpMethod.GET);
  testMethod(HttpMethod.DELETE);
});

async function createUser(prisma: PrismaClient, ...data: { type: ApplicationStageType; date: string }[]) {
  const uid = 'devUserVerifiedWithData' + getUniqueModifier();
  await prisma.user.create({ data: { uid } });
  if (data.length > 0) {
    const application = await prisma.application.create({ data: { roleId: 1, userId: uid } });
    for (const d of data) {
      const { type, date } = d;
      await prisma.applicationStage.create({ data: { type, date: new Date(date), applicationId: application.id } });
    }
  }
  return uid;
}
