'use server';

import { User } from '@/types/User';
import { cookies } from 'next/headers';
import { cache } from 'react';

export const validateSession = cache(async () => {
  const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/auth/session/validate', {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookies().toString(),
      Origin: process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3101',
    },
  });
  const json: User = await res.json();

  return json;
});
