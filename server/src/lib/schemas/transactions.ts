import { z } from 'zod';

export const createTransactionExpenseIncomeSchema = z
  .object({
    transaction: z
      .object({
        description: z.string(),
        amount: z.number(),
        rate: z.number().nullable(),
        categoryId: z.string().uuid(),
        accountId: z.string().uuid(),
        currencyId: z.string().uuid(),
        date: z.string().datetime(),
      })
      .strict(),
    selectedReccurence: z.enum([
      'never',
      'everyDay',
      'everyTwoDays',
      'everyWeekday',
      'everyWeekend',
      'everyWeek',
      'everyTwoWeeks',
      'everyFourWeeks',
      'everyMonth',
      'everyTwoMonths',
      'everyThreeMonths',
      'everySixMonths',
      'everyYear',
    ]),
    recurrenceEndDate: z.string().datetime(),
  })
  .strict();

export const createTransactionTransferSchema = z
  .object({
    description: z.string(),
    amount: z.number(),
    rate: z.number().nullable(),
    originAccountId: z.string().uuid(),
    destinationAccountId: z.string().uuid(),
    selectedCurrencyId: z.string().uuid(),
    date: z.string().datetime(),
    categoryId: z.string().uuid().nullable(),
    typeId: z.string().uuid().nullable(),
  })
  .strict();

export const createUpdateTransactionSchema = z
  .object({
    description: z.string(),
    newValue: z.number().nullable(),
    amount: z.number().nullable(),
    rate: z.number().nullable(),
    accountId: z.string().uuid(),
    currencyId: z.string().uuid(),
    date: z.string().datetime(),
  })
  .strict();

export const updateTransactionSchema = z
  .object({
    description: z.string(),
    amount: z.number(),
    rate: z.number().nullable(),
    categoryId: z.string().uuid(),
    accountId: z.string().uuid(),
    currencyId: z.string().uuid(),
    date: z.string().datetime(),
  })
  .strict();

export const deleteTransactionSchema = z
  .object({
    recurringDeleteType: z.enum(['all', 'this_and_following', 'this']),
  })
  .strict();

export const transactionCategorySchema = z
  .object({
    name: z.string().min(1),
    typeId: z.string().uuid(),
    color: z.string(),
    icon: z.string(),
    iconColor: z.string(),
  })
  .strict();
