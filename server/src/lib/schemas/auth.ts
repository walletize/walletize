import { z } from 'zod';

const emailPasswordSchema = z
  .object({
    email: z.string().email().min(5).max(254),
    password: z.string().min(8).max(254),
  })
  .strict();

export const signupSchema = z
  .object({
    name: z.string().min(3).max(254),
    ...emailPasswordSchema.shape,
  })
  .strict();

export const loginSchema = emailPasswordSchema;
