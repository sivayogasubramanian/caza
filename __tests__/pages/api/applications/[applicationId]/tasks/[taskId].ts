import { createMocks, getPrismaClientForTests, getUniqueModifier, prismaMigrateReset } from '../../../util.test';
import taskHandler from '../../../../../../pages/api/applications/[applicationId]/tasks/[taskId]';
import { HttpMethod, HttpStatus } from '../../../../../../utils/http/httpHelpers';
import { TaskPatchData, TaskPostData } from '../../../../../../types/task';
import { Application, Task } from '@prisma/client';

const DEFAULT_TASK_DATA = {
  title: 'Default Title',
  dueDate: new Date('2022-01-01'),
  notificationDateTime: new Date('2022-01-01'),
  isDone: false,
};
const ALTERNATE_TASK_DATA = {
  title: 'Other Title',
  dueDate: new Date('2022-09-09'),
  notificationDateTime: new Date('2022-09-09'),
  isDone: true,
};
const SELECT_CLAUSE = { select: { id: true, title: true, dueDate: true, notificationDateTime: true, isDone: true } };

const KNOWN_ROLE_ID = 1;
const createTaskMocks = (
  uid: string,
  method: HttpMethod,
  applicationId: number,
  taskId: number,
  body?: TaskPatchData,
) => createMocks(taskHandler, { uid, method, body, query: { applicationId: '' + applicationId, taskId: '' + taskId } });

const createTaskPatchMocks = (uid: string, applicationId: number, taskId: number, body: TaskPatchData) =>
  createTaskMocks(uid, HttpMethod.PATCH, applicationId, taskId, body);
const createTaskDeleteMocks = (uid: string, applicationId: number, taskId: number) =>
  createTaskMocks(uid, HttpMethod.DELETE, applicationId, taskId);

beforeAll(prismaMigrateReset);
const prisma = getPrismaClientForTests();

describe('PATCH tasks', () => {
  it('Can PATCH valid task', async () => {
    const { uid, applicationId, tasks } = await createUserWithDefaultData();
    const { req, res, getResult } = createTaskPatchMocks(uid, applicationId, tasks[0].id, ALTERNATE_TASK_DATA);

    await taskHandler(req, res);
    const { status, json } = getResult();

    const newTask = { ...ALTERNATE_TASK_DATA, id: tasks[0].id };
    expect(status).toEqual(HttpStatus.OK);
    expect(
      await prisma.task.findMany({
        where: { applicationId },
        ...SELECT_CLAUSE,
      }),
    ).toEqual([newTask]);
  });

  it('Can PATCH without any updates', async () => {
    const { uid, applicationId, tasks } = await createUserWithDefaultData();
    const { req, res, getResult } = createTaskPatchMocks(uid, applicationId, tasks[0].id, {});

    await taskHandler(req, res);
    const { status, json } = getResult();

    expect(status).toEqual(HttpStatus.OK);
    expect(await prisma.task.findMany({ where: { applicationId }, ...SELECT_CLAUSE })).toEqual(tasks);
  });

  it('Fails to PATCH non-existent tasks', async () => {
    const otherApplicationId = 99999;
    const { uid, tasks } = await createUserWithDefaultData();
    const { req, res, getResult } = createTaskPatchMocks(uid, otherApplicationId, tasks[0].id, ALTERNATE_TASK_DATA);

    await taskHandler(req, res);
    const { status, json } = getResult();

    expect(status).toEqual(HttpStatus.NOT_FOUND);
    expect(json.payload).toEqual({});
  });

  it('Fails to PATCH other tasks', async () => {
    const otherApplicationId = (await createUserWithDefaultData()).applicationId;
    const { uid, tasks } = await createUserWithDefaultData();
    const { req, res, getResult } = createTaskPatchMocks(uid, otherApplicationId, tasks[0].id, {});

    await taskHandler(req, res);
    const { status, json } = getResult();

    expect(status).toEqual(HttpStatus.NOT_FOUND);
    expect(json.payload).toEqual({});
  });
});

describe('DELETE tasks', () => {
  it('Can DELETE valid task.', async () => {
    const { uid, applicationId, tasks } = await createUserWithDefaultData();
    const { req, res, getResult } = createTaskDeleteMocks(uid, applicationId, tasks[0].id);

    await taskHandler(req, res);
    const { status, json } = getResult();

    expect(status).toEqual(HttpStatus.OK);
    expect(await prisma.task.findMany({ where: { applicationId }, ...SELECT_CLAUSE })).toEqual(tasks.slice(1));
  });

  it('Fails to DELETE non-existent tasks.', async () => {
    const otherTaskId = 99999;
    const { uid, applicationId, tasks } = await createUserWithDefaultData();
    const { req, res, getResult } = createTaskDeleteMocks(uid, applicationId, otherTaskId);

    await taskHandler(req, res);
    const { status, json } = getResult();

    expect(status).toEqual(HttpStatus.NOT_FOUND);
    expect(await prisma.task.findMany({ where: { applicationId }, ...SELECT_CLAUSE })).toEqual(tasks);
  });

  it('Fails to DELETE non-user tasks.', async () => {
    const otherTaskId = (await createUserWithDefaultData()).tasks[0].id;
    const { uid, applicationId, tasks } = await createUserWithDefaultData();
    const { req, res, getResult } = createTaskDeleteMocks(uid, applicationId, otherTaskId);

    await taskHandler(req, res);
    const { status, json } = getResult();

    expect(status).toEqual(HttpStatus.NOT_FOUND);
    expect(await prisma.task.findMany({ where: { applicationId }, ...SELECT_CLAUSE })).toEqual(tasks);
  });
});

describe('Handles bad path or bad method', () => {
  // TODO: This may be a problem.
  it.skip('Fails with bad applicationId.', async () => {
    const otherApplicationId = '' as any as number;
    const { uid } = await createUserWithDefaultData();
    const { req, res, getResult } = createTaskDeleteMocks(uid, otherApplicationId, 0);

    await taskHandler(req, res);
    const { status, json } = getResult();

    expect(status).toEqual(HttpStatus.BAD_REQUEST);
  });

  it('Fails with bad applicationId.', async () => {
    const otherApplicationId = 'bad' as any as number;
    const { uid } = await createUserWithDefaultData();
    const { req, res, getResult } = createTaskDeleteMocks(uid, otherApplicationId, 0);

    await taskHandler(req, res);
    const { status, json } = getResult();

    expect(status).toEqual(HttpStatus.BAD_REQUEST);
  });

  it('Fails with bad applicationId.', async () => {
    const otherTaskId = 'bad' as any as number;
    const { uid, applicationId, tasks } = await createUserWithDefaultData();
    const { req, res, getResult } = createTaskDeleteMocks(uid, applicationId, otherTaskId);

    await taskHandler(req, res);
    const { status, json } = getResult();

    expect(status).toEqual(HttpStatus.BAD_REQUEST);
  });
});

async function createUser() {
  const uid = 'devUserTaskTests' + getUniqueModifier();
  await prisma.user.create({ data: { uid } });
  return uid;
}

async function createUserWithDefaultData() {
  const uid = await createUser();
  const application = await prisma.application.create({ data: { userId: uid, roleId: KNOWN_ROLE_ID } });

  // Add default data
  await prisma.task.create({
    data: {
      title: DEFAULT_TASK_DATA.title,
      dueDate: DEFAULT_TASK_DATA.dueDate,
      notificationDateTime: DEFAULT_TASK_DATA.notificationDateTime,
      applicationId: application.id,
    },
  });

  const newApplication = (await prisma.application.findUnique({
    where: { id: application.id },
    include: { tasks: { ...SELECT_CLAUSE } },
  })) as Application & {
    tasks: {
      id: number;
      title: string;
      dueDate: Date;
      notificationDateTime: Date | null;
      isDone: boolean;
    }[];
  };
  return {
    uid,
    applicationId: application.id,
    tasks: newApplication?.tasks,
  };
}
