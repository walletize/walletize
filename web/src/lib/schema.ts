import { z } from 'zod';

const email = z
  .string()
  .email({ message: 'Please enter a valid email address' })
  .min(5, { message: 'Email must be at least 5 characters long' })
  .max(254, { message: 'Email must be 254 characters or less' });
const password = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters long' })
  .max(254, { message: 'Password must be 254 characters or less' });
const name = z
  .string()
  .min(3, { message: 'Name must be at least 3 characters long' })
  .max(254, { message: 'Name must be 254 characters or less' });

export const loginSchema = z.object({
  email,
  password,
});
export const signupSchema = loginSchema.extend({
  name,
});
export const generateInviteUserSchema = (currentEmail: string) => {
  return z.object({
    email: z
      .string()
      .email()
      .refine((email) => email !== currentEmail, {
        message: 'You cannot enter your own email',
      }),
  });
};

export const updatePasswordSchema = z
  .object({
    currentPassword: password,
    newPassword: password,
    confirmPassword: password,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Your passwords did not match.',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password.',
    path: ['newPassword'],
  });
