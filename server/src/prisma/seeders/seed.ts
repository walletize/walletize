import { PrismaClient } from '@prisma/client';
import { seedAccountTypes } from './accountType';
import { seedCurrencies } from './currency';
import { seedDefaultTransactionCategories } from './transactionCategory';
import { seedTransactionTypes } from './transactionType';

const prisma = new PrismaClient();

async function main() {
  await Promise.all([seedAccountTypes(prisma), seedTransactionTypes(prisma), seedCurrencies(prisma)]);
  await seedDefaultTransactionCategories(prisma);
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
