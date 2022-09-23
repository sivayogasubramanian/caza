import { ApplicationStageType, Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({ log: ['query'] });

function makeUserCreateInput(): Prisma.UserCreateInput[] {
  const users: Prisma.UserCreateInput[] = [];
  for (let uid = 1; uid <= 100; uid++) {
    users.push({ uid: uid.toString(), isVerified: true });
  }
  return users;
}

const processes = [
  { stage: ApplicationStageType.APPLIED, daysAfterPrevStage: 0 },
  { stage: ApplicationStageType.ONLINE_ASSESSMENT, daysAfterPrevStage: 7 },
  { stage: ApplicationStageType.TECHNICAL, daysAfterPrevStage: 14 },
  { stage: ApplicationStageType.OFFERED, daysAfterPrevStage: 5 },
  { stage: ApplicationStageType.ACCEPTED, daysAfterPrevStage: 2 },
];

function randomDate(start: Date, daysAfterPrevStage: number) {
  return new Date(start.getTime() + (0.5 + Math.random()) * (daysAfterPrevStage * 24 * 60 * 60 * 1000));
}

function makeApplicationCreateInput(
  roleId: number,
  latestStageBreakdown: { [stage: string]: number },
): Prisma.ApplicationUncheckedCreateInput[] {
  const applications: Prisma.ApplicationUncheckedCreateInput[] = [];

  const latestStageArr: { stage: ApplicationStageType; isRejected: boolean }[] = [];

  for (const [stage, count] of Object.entries(latestStageBreakdown)) {
    for (let i = 0; i < count; i++) {
      latestStageArr.push({ stage: stage as ApplicationStageType, isRejected: count > 10 && i >= count / 2 });
    }
  }

  for (let userId = 1; userId <= 100; userId++) {
    const { stage, isRejected } = latestStageArr[userId - 1];
    const stages: Prisma.ApplicationStageUncheckedCreateWithoutApplicationInput[] = [];
    let prevDate = new Date();
    for (let i = 0; i < processes.length; i++) {
      prevDate = randomDate(prevDate, processes[i].daysAfterPrevStage);
      stages.push({
        type: processes[i].stage,
        date: prevDate,
      });

      if (processes[i].stage === stage) {
        break;
      }
    }

    if (stage !== ApplicationStageType.ACCEPTED && isRejected) {
      stages.push({
        type: ApplicationStageType.REJECTED,
        date: randomDate(prevDate, 8),
      });
    }

    applications.push({
      userId: userId.toString(),
      roleId,
      applicationStages: {
        create: stages,
      },
    });
  }

  return applications;
}

const companies: Prisma.CompanyCreateInput[] = [
  {
    name: 'Facebook',
    companyUrl: 'facebook.com',
    isVerified: true,
    roles: {
      create: [
        {
          title: 'Software Engineer Intern',
          type: 'SUMMER_INTERNSHIP',
          year: 2023,
          isVerified: true,
        },
      ],
    },
  },
  {
    name: 'Apple',
    companyUrl: 'apple.com',
    isVerified: true,
  },
  {
    name: 'Amazon',
    companyUrl: 'amazon.com',
    isVerified: true,
  },
  {
    name: 'Netflix',
    companyUrl: 'netflix.com',
    isVerified: true,
  },
  {
    name: 'Google',
    companyUrl: 'google.com',
    isVerified: true,
    roles: {
      create: [
        {
          title: 'Software Engineering Intern, 2023',
          type: 'SUMMER_INTERNSHIP',
          year: 2023,
          isVerified: true,
        },
      ],
    },
  },
  {
    name: 'Computing for Voluntary Welfare Organisations',
    companyUrl: 'https://www.comp.nus.edu.sg/~vwo/',
    isVerified: false,
  },
];

async function main() {
  await Promise.all(
    makeUserCreateInput().map(async (user) => {
      await prisma.user.create({
        data: user,
      });
    }),
  );

  await Promise.all(
    companies.map(async (company) => {
      await prisma.company.create({
        data: company,
      });
    }),
  );

  const facebookSweApplications = makeApplicationCreateInput(1, {
    [ApplicationStageType.APPLIED]: 40,
    [ApplicationStageType.ONLINE_ASSESSMENT]: 33,
    [ApplicationStageType.TECHNICAL]: 15,
    [ApplicationStageType.OFFERED]: 5,
    [ApplicationStageType.ACCEPTED]: 7,
  });

  const googleSweApplications = makeApplicationCreateInput(2, {
    [ApplicationStageType.APPLIED]: 53,
    [ApplicationStageType.ONLINE_ASSESSMENT]: 30,
    [ApplicationStageType.TECHNICAL]: 8,
    [ApplicationStageType.OFFERED]: 3,
    [ApplicationStageType.ACCEPTED]: 6,
  });

  await Promise.all([
    facebookSweApplications.map(async (application) => {
      await prisma.application.create({
        data: application,
      });
    }),
    googleSweApplications.map(async (application) => {
      await prisma.application.create({
        data: application,
      });
    }),
  ]);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
