import { PrismaClient } from '@prisma/client';

export async function seedAccountTypes(prisma: PrismaClient) {
  await prisma.accountType.upsert({
    where: {
      id: '590cf50e-09a5-414c-9444-a716b14d210f',
    },
    create: {
      id: '590cf50e-09a5-414c-9444-a716b14d210f',
      name: 'Asset',
    },
    update: {},
  });

  await prisma.accountType.upsert({
    where: {
      id: '645349f8-6b34-420c-91ef-c058eb065f2d',
    },
    create: {
      id: '645349f8-6b34-420c-91ef-c058eb065f2d',
      name: 'Liability',
    },
    update: {},
  });
}
