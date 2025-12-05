import { PrismaClient } from '@prisma/client';

export async function seedAccountCategories(prisma: PrismaClient, userId: string) {
  const results = await Promise.all([
    prisma.accountCategory.create({
      data: {
        name: 'Savings Account',
        typeId: '590cf50e-09a5-414c-9444-a716b14d210f',
        userId,
      },
    }),

    prisma.accountCategory.create({
      data: {
        name: 'Checking Account',
        typeId: '590cf50e-09a5-414c-9444-a716b14d210f',
        userId,
      },
    }),

    prisma.accountCategory.create({
      data: {
        name: 'Cash',
        typeId: '590cf50e-09a5-414c-9444-a716b14d210f',
        userId,
      },
    }),

    prisma.accountCategory.create({
      data: {
        name: 'Stocks',
        typeId: '590cf50e-09a5-414c-9444-a716b14d210f',
        userId,
      },
    }),

    prisma.accountCategory.create({
      data: {
        name: 'Cryptocurrencies',
        typeId: '590cf50e-09a5-414c-9444-a716b14d210f',
        userId,
      },
    }),

    prisma.accountCategory.create({
      data: {
        name: 'Real Estate',
        typeId: '590cf50e-09a5-414c-9444-a716b14d210f',
        userId,
      },
    }),

    prisma.accountCategory.create({
      data: {
        name: 'Vehicle',
        typeId: '590cf50e-09a5-414c-9444-a716b14d210f',
        userId,
      },
    }),

    prisma.accountCategory.create({
      data: {
        name: 'Retirement Accounts',
        typeId: '590cf50e-09a5-414c-9444-a716b14d210f',
        userId,
      },
    }),

    prisma.accountCategory.create({
      data: {
        name: 'Gold',
        typeId: '590cf50e-09a5-414c-9444-a716b14d210f',
        userId,
      },
    }),

    prisma.accountCategory.create({
      data: {
        name: 'Insurance',
        typeId: '590cf50e-09a5-414c-9444-a716b14d210f',
        userId,
      },
    }),

    prisma.accountCategory.create({
      data: {
        name: 'Collectibles',
        typeId: '590cf50e-09a5-414c-9444-a716b14d210f',
        userId,
      },
    }),

    prisma.accountCategory.create({
      data: {
        name: 'Other',
        typeId: '590cf50e-09a5-414c-9444-a716b14d210f',
        userId,
      },
    }),

    prisma.accountCategory.create({
      data: {
        name: 'Loan',
        typeId: '645349f8-6b34-420c-91ef-c058eb065f2d',
        userId,
      },
    }),

    prisma.accountCategory.create({
      data: {
        name: 'Credit Card',
        typeId: '645349f8-6b34-420c-91ef-c058eb065f2d',
        userId,
      },
    }),

    prisma.accountCategory.create({
      data: {
        name: 'Bills',
        typeId: '645349f8-6b34-420c-91ef-c058eb065f2d',
        userId,
      },
    }),

    prisma.accountCategory.create({
      data: {
        name: 'Mortgage',
        typeId: '645349f8-6b34-420c-91ef-c058eb065f2d',
        userId,
      },
    }),

    prisma.accountCategory.create({
      data: {
        name: 'Other',
        typeId: '645349f8-6b34-420c-91ef-c058eb065f2d',
        userId,
      },
    }),
  ]);

  return results;
}
