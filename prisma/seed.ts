import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({ log: ['query'] });

const users: Prisma.UserCreateInput[] = [{ uid: '1' }, { uid: '2' }, { uid: '3' }, { uid: '4' }, { uid: '5' }];

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
        {
          title: 'Enterprise Engineer Intern',
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
          applications: {
            create: [
              {
                userId: '1',
                applicationStages: {
                  create: [
                    {
                      type: 'APPLIED',
                      date: new Date(2022, 8, 1),
                      emojiUnicodeHex: '1f628', // 😨
                    },
                    {
                      type: 'ONLINE_ASSESSMENT',
                      date: new Date(2022, 8, 7),
                      emojiUnicodeHex: '1f604', // 😄
                      remark: 'Passed all test cases!',
                    },
                    {
                      type: 'TECHNICAL',
                      date: new Date(2022, 8, 20),
                      remark: 'Think it went well, was able to devise and implement optimal solution.',
                    },
                  ],
                },
                tasks: {
                  create: [
                    {
                      title: 'Revise bit manipulation',
                      dueDate: new Date(2022, 8, 5),
                      notificationDateTime: new Date(2022, 8, 4),
                      isDone: true,
                    },
                    {
                      title: 'Prepare questions to ask engineer',
                      dueDate: new Date(2022, 8, 19),
                      notificationDateTime: new Date(2022, 8, 18),
                      isDone: false,
                    },
                  ],
                },
              },
              {
                userId: '2',
                applicationStages: {
                  create: [
                    {
                      type: 'APPLIED',
                      date: new Date(2022, 7, 22),
                    },
                    {
                      type: 'ONLINE_ASSESSMENT',
                      date: new Date(2022, 8, 7),
                    },
                  ],
                },
              },
              {
                userId: '3',
                applicationStages: {
                  create: [
                    {
                      type: 'APPLIED',
                      date: new Date(2022, 7, 23),
                    },
                    {
                      type: 'ONLINE_ASSESSMENT',
                      date: new Date(2022, 8, 7),
                    },
                  ],
                },
              },
              {
                userId: '4',
                applicationStages: {
                  create: [
                    {
                      type: 'APPLIED',
                      date: new Date(2022, 7, 30),
                    },
                  ],
                },
              },
              {
                userId: '5',
                applicationStages: {
                  create: [
                    {
                      type: 'APPLIED',
                      date: new Date(2022, 7, 28),
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          title: 'Customer Engineering Intern, Google Cloud, 2023',
          type: 'FALL_INTERNSHIP',
          year: 2023,
        },
        {
          title: 'Data Center Technician Intern, 2023',
          type: 'SUMMER_INTERNSHIP',
          year: 2023,
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
    users.map(async (user) => {
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
