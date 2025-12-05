import { z } from 'zod';

export const updateUserSchema = z
  .object({
    name: z.string().min(1),
  })
  .strict();

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(8).max(254),
    newPassword: z.string().min(8).max(254),
  })
  .strict();
