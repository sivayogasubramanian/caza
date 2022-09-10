import { createMocks, getPrismaClientForTests, prismaMigrateReset } from '../util.test';
import userHandler from '../../../../pages/api/user/index';
import { HttpMethod, HttpStatus } from '../../../../utils/http/httpHelpers';

const KNOWN_ROLE_ID = 1;
const createUserMocks = (uid: string, method: HttpMethod, oldToken?: string) =>
  createMocks(userHandler, { uid, method, body: { oldToken } });

describe('DELETE accounts', () => {
  const createUserDeleteMocks = (uid: string) => createUserMocks(uid, HttpMethod.DELETE);
  const prisma = getPrismaClientForTests();

  beforeAll(prismaMigrateReset);

  it('delete accounts with no data', async () => {
    const uid = 'devUserWithoutData';
    const { req, res, getResult } = createUserDeleteMocks(uid);
    expect(await prisma.user.count({ where: { uid } })).toStrictEqual(1);

    await userHandler(req, res);
    const { status, json } = getResult();

    expect(status).toEqual(HttpStatus.OK);
    expect(await prisma.user.count({ where: { uid } })).toStrictEqual(0);
    expect(json.payload).toEqual({});
  });

  it('delete accounts with data', async () => {
    const uid = 'devUserWithData';
    const { req, res, getResult } = createUserDeleteMocks(uid);
    expect(await prisma.user.count({ where: { uid } })).toStrictEqual(1);

    await userHandler(req, res);
    const { status, json } = getResult();

    expect(await prisma.user.count({ where: { uid } })).toStrictEqual(0);
    expect(status).toEqual(HttpStatus.OK);
    expect(json.payload).toEqual({});
  });

  it('cannot delete missing accounts', async () => {
    const uid = 'devUserDoesNotExistInDatabase';
    const { req, res, getResult } = createUserDeleteMocks(uid);
    expect(await prisma.user.count({ where: { uid } })).toStrictEqual(0);

    await userHandler(req, res);
    const { status, json } = getResult();

    expect(status).toEqual(HttpStatus.NOT_FOUND);
  });
});

describe('POST accounts without linking', () => {
  const createUserPostMocks = (uid: string) => createUserMocks(uid, HttpMethod.POST);
  const prisma = getPrismaClientForTests();

  beforeAll(prismaMigrateReset);

  it('create new user', async () => {
    const uid = 'devUserDoesNotExistP1';
    const { req, res, getResult } = createUserPostMocks(uid);
    expect(await prisma.user.count({ where: { uid } })).toStrictEqual(0);

    await userHandler(req, res);
    const user = await prisma.user.findUnique({ where: { uid } });
    const { status, json } = getResult();

    expect(status).toEqual(HttpStatus.CREATED);
    expect(await prisma.user.count({ where: { uid } })).toStrictEqual(1);
    expect(json.payload).toEqual({ uid });
  });

  it('fails to recreate existing user.', async () => {
    const uid = 'devUserDoesNotExistP2';
    await prisma.user.create({ data: { uid } });
    expect(await prisma.user.count({ where: { uid } })).toStrictEqual(1);
    const { req, res, getResult } = createUserPostMocks(uid);

    await userHandler(req, res);
    const { status, json } = getResult();

    expect(status).toEqual(HttpStatus.CONFLICT);
    expect(await prisma.user.count({ where: { uid } })).toStrictEqual(1);
    expect(json.payload).toEqual({});
  });
});

describe('POST accounts with linking', () => {
  const createLinkMocks = (oldUid: string, newUid: string) => createUserMocks(newUid, HttpMethod.POST, oldUid);
  const prisma = getPrismaClientForTests();

  beforeAll(prismaMigrateReset);

  it('will link anon to verified.', async () => {
    const oldUid = 'devUserFoo';
    const newUid = 'devUserVerifiedBar';
    await prisma.user.create({ data: { uid: oldUid } });
    const { req, res, getResult } = createLinkMocks(oldUid, newUid);

    await userHandler(req, res);
    const { status, json } = getResult();

    expect(status).toEqual(HttpStatus.OK);
    expect(json.payload).toEqual({ uid: newUid });
  });

  it('will link anon to verified (does not exist) and transfer data.', async () => {
    const oldUid = 'devUserWithDataBar';
    const newUid = 'devUserVerifiedWithoutDataBar';
    await prisma.user.create({ data: { uid: oldUid } });
    const application = await prisma.application.create({ data: { userId: oldUid, roleId: KNOWN_ROLE_ID } });
    expect(await prisma.user.count({ where: { uid: newUid } })).toStrictEqual(0);
    const { req, res, getResult } = createLinkMocks(oldUid, newUid);

    await userHandler(req, res);
    const { status, json } = getResult();

    expect(await prisma.user.count({ where: { uid: oldUid } })).toBe(0);
    const newUser = await prisma.user.findUnique({ where: { uid: newUid }, include: { applications: true } });
    expect(newUser?.applications.map((a) => a.id)).toStrictEqual([application.id]);
    expect(status).toEqual(HttpStatus.OK);
    expect(json.payload).toEqual({ uid: newUid });
  });

  it('will not link anon to existing verified.', async () => {
    const oldUid = 'devUserWithDataFoo';
    const newUid = 'devUserVerifiedWithoutDataFoo';
    await prisma.user.create({ data: { uid: oldUid } });
    await prisma.user.create({ data: { uid: newUid } });
    const { req, res, getResult } = createLinkMocks(oldUid, newUid);

    await userHandler(req, res);
    const { status, json } = getResult();

    expect(status).toEqual(HttpStatus.CONFLICT);
    expect(json.payload).toEqual({});
  });

  function willFailToLinkExceptAnonToVerified(oldUid: string, newUid: string, expectedStatus: HttpStatus) {
    it(`will fail to link ${oldUid} to ${newUid} as it is not anon to verified.`, async () => {
      const { req, res, getResult } = createLinkMocks(oldUid, newUid);

      await userHandler(req, res);
      const { status, json } = getResult();

      expect(status).toEqual(expectedStatus);
      expect(json.payload).toEqual({});
    });
  }

  willFailToLinkExceptAnonToVerified('devUserAnonFoo', 'devUserAnonBar', HttpStatus.UNAUTHORIZED);
  willFailToLinkExceptAnonToVerified('devUserVerifiedFoo', 'devUserAnonBar', HttpStatus.UNAUTHORIZED);
  willFailToLinkExceptAnonToVerified('devUserVerifiedFoo', 'devUserVerifiedFoo', HttpStatus.BAD_REQUEST);
});
