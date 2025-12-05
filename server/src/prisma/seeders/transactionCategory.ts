import { PrismaClient } from '@prisma/client';

export async function seedDefaultTransactionCategories(prisma: PrismaClient) {
  await prisma.transactionCategory.upsert({
    where: {
      id: 'cfb050f6-dd57-4061-89a8-4fc5c10e777e',
    },
    create: {
      id: 'cfb050f6-dd57-4061-89a8-4fc5c10e777e',
      name: 'Incoming Transfer',
      typeId: '1139551e-7723-49e3-89cd-a73fa6600580',
      icon: 'arrow-right-left.svg',
      color: '#60a5fa',
      iconColor: 'white',
    },
    update: {},
  });

  await prisma.transactionCategory.upsert({
    where: {
      id: 'befc41b9-2417-4d9e-b2b4-be92a0613156',
    },
    create: {
      id: 'befc41b9-2417-4d9e-b2b4-be92a0613156',
      name: 'Outgoing Transfer',
      typeId: '1139551e-7723-49e3-89cd-a73fa6600580',
      icon: 'arrow-right-left.svg',
      color: '#a8328f',
      iconColor: 'white',
    },
    update: {},
  });

  await prisma.transactionCategory.upsert({
    where: {
      id: '8e46c952-3378-49f6-bcfa-377351882dad',
    },
    create: {
      id: '8e46c952-3378-49f6-bcfa-377351882dad',
      name: 'Update',
      typeId: 'd2d456d8-79c4-458e-8ddc-104042c29a9a',
      icon: 'arrow-up-down.svg',
      color: '#fb923c',
      iconColor: 'white',
    },
    update: {},
  });
}

export async function seedUserTransactionCategories(prisma: PrismaClient, userId: string) {
  const results = await Promise.all([
    prisma.transactionCategory.create({
      data: {
        name: 'Salary',
        typeId: 'a6f2747a-8d68-49f7-9aab-3a9dcaaee850',
        userId,
        icon: 'hand-coins.svg',
        color: '#18b272',
        iconColor: 'white',
      },
    }),

    prisma.transactionCategory.create({
      data: {
        name: 'Business',
        typeId: 'a6f2747a-8d68-49f7-9aab-3a9dcaaee850',
        userId,
        icon: 'briefcase-business.svg',
        color: '#c78c00',
        iconColor: 'white',
      },
    }),

    prisma.transactionCategory.create({
      data: {
        name: 'Gifts',
        typeId: 'a6f2747a-8d68-49f7-9aab-3a9dcaaee850',
        userId,
        icon: 'gift.svg',
        color: '#18b272',
        iconColor: 'white',
      },
    }),

    prisma.transactionCategory.create({
      data: {
        name: 'Insurance Payout',
        typeId: 'a6f2747a-8d68-49f7-9aab-3a9dcaaee850',
        userId,
        icon: 'shield.svg',
        color: '#45a7e6',
        iconColor: 'white',
      },
    }),

    prisma.transactionCategory.create({
      data: {
        name: 'Investments',
        typeId: 'a6f2747a-8d68-49f7-9aab-3a9dcaaee850',
        userId,
        icon: 'chart-spline.svg',
        color: '#72c541',
        iconColor: 'white',
      },
    }),

    prisma.transactionCategory.create({
      data: {
        name: 'Loan',
        typeId: 'a6f2747a-8d68-49f7-9aab-3a9dcaaee850',
        userId,
        icon: 'landmark.svg',
        color: '#e06476',
        iconColor: 'white',
      },
    }),

    prisma.transactionCategory.create({
      data: {
        name: 'Other',
        typeId: 'a6f2747a-8d68-49f7-9aab-3a9dcaaee850',
        userId,
        icon: 'ellipsis.svg',
        color: '#27272a',
        iconColor: 'white',
      },
    }),

    prisma.transactionCategory.create({
      data: {
        name: 'Bills & Fees',
        typeId: '62919f5b-047d-45c7-96d9-1cd21a946d3a',
        userId,
        icon: 'banknote.svg',
        color: '#5ec4ac',
        iconColor: 'white',
      },
    }),

    prisma.transactionCategory.create({
      data: {
        name: 'Entertainment',
        typeId: '62919f5b-047d-45c7-96d9-1cd21a946d3a',
        userId,
        icon: 'drama.svg',
        color: '#ffa801',
        iconColor: 'white',
      },
    }),

    prisma.transactionCategory.create({
      data: {
        name: 'Car',
        typeId: '62919f5b-047d-45c7-96d9-1cd21a946d3a',
        userId,
        icon: 'car.svg',
        color: '#45a7e6',
        iconColor: 'white',
      },
    }),

    prisma.transactionCategory.create({
      data: {
        name: 'Beauty',
        typeId: '62919f5b-047d-45c7-96d9-1cd21a946d3a',
        userId,
        icon: 'flower.svg',
        color: '#7944d0',
        iconColor: 'white',
      },
    }),

    prisma.transactionCategory.create({
      data: {
        name: 'Education',
        typeId: '62919f5b-047d-45c7-96d9-1cd21a946d3a',
        userId,
        icon: 'graduation-cap.svg',
        color: '#3a75ad',
        iconColor: 'white',
      },
    }),

    prisma.transactionCategory.create({
      data: {
        name: 'Family & Personal',
        typeId: '62919f5b-047d-45c7-96d9-1cd21a946d3a',
        userId,
        icon: 'user.svg',
        color: '#45a7e6',
        iconColor: 'white',
      },
    }),

    prisma.transactionCategory.create({
      data: {
        name: 'Food & Drink',
        typeId: '62919f5b-047d-45c7-96d9-1cd21a946d3a',
        userId,
        icon: 'utensils.svg',
        color: '#ffa801',
        iconColor: 'white',
      },
    }),

    prisma.transactionCategory.create({
      data: {
        name: 'Gifts',
        typeId: '62919f5b-047d-45c7-96d9-1cd21a946d3a',
        userId,
        icon: 'gift.svg',
        color: '#18b272',
        iconColor: 'white',
      },
    }),

    prisma.transactionCategory.create({
      data: {
        name: 'Groceries',
        typeId: '62919f5b-047d-45c7-96d9-1cd21a946d3a',
        userId,
        icon: 'carrot.svg',
        color: '#dd8138',
        iconColor: 'white',
      },
    }),

    prisma.transactionCategory.create({
      data: {
        name: 'Healthcare',
        typeId: '62919f5b-047d-45c7-96d9-1cd21a946d3a',
        userId,
        icon: 'heart-pulse.svg',
        color: '#e06476',
        iconColor: 'white',
      },
    }),

    prisma.transactionCategory.create({
      data: {
        name: 'Home',
        typeId: '62919f5b-047d-45c7-96d9-1cd21a946d3a',
        userId,
        icon: 'house.svg',
        color: '#b6985c',
        iconColor: 'white',
      },
    }),

    prisma.transactionCategory.create({
      data: {
        name: 'Shopping',
        typeId: '62919f5b-047d-45c7-96d9-1cd21a946d3a',
        userId,
        icon: 'shopping-bag.svg',
        color: '#e36aef',
        iconColor: 'white',
      },
    }),

    prisma.transactionCategory.create({
      data: {
        name: 'Sport & Hobbies',
        typeId: '62919f5b-047d-45c7-96d9-1cd21a946d3a',
        userId,
        icon: 'dumbbell.svg',
        color: '#60d0ca',
        iconColor: 'white',
      },
    }),

    prisma.transactionCategory.create({
      data: {
        name: 'Transport',
        typeId: '62919f5b-047d-45c7-96d9-1cd21a946d3a',
        userId,
        icon: 'train-front.svg',
        color: '#c78c00',
        iconColor: 'white',
      },
    }),

    prisma.transactionCategory.create({
      data: {
        name: 'Travel',
        typeId: '62919f5b-047d-45c7-96d9-1cd21a946d3a',
        userId,
        icon: 'plane.svg',
        color: '#f964a0',
        iconColor: 'white',
      },
    }),

    prisma.transactionCategory.create({
      data: {
        name: 'Work',
        typeId: '62919f5b-047d-45c7-96d9-1cd21a946d3a',
        userId,
        icon: 'briefcase-business.svg',
        color: '#6d6e8a',
        iconColor: 'white',
      },
    }),

    prisma.transactionCategory.create({
      data: {
        name: 'Other',
        typeId: '62919f5b-047d-45c7-96d9-1cd21a946d3a',
        userId,
        icon: 'ellipsis.svg',
        color: '#27272a',
        iconColor: 'white',
      },
    }),
  ]);

  return results;
}
