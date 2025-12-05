import { z } from 'zod';

const accountSchema = z
  .object({
    userId: z.string().uuid(),
    name: z.string().min(1),
    categoryId: z.string().uuid(),
    currencyId: z.string().uuid(),
    initialValue: z.number(),
    icon: z.string(),
    color: z.string(),
    iconColor: z.string(),
  })
  .strict();

export const createAccountSchema = z.object({
  account: accountSchema,
  accountInvites: z.array(
    z
      .object({
        email: z.string().email(),
      })
      .strict(),
  ),
});

export const createAccountInviteSchema = z
  .object({
    email: z.string().email(),
    accountId: z.string().uuid(),
  })
  .strict();

export const updateAccountSchema = accountSchema;

export const accountCategorySchema = z
  .object({
    name: z.string().min(1),
    typeId: z.string().uuid(),
  })
  .strict();
