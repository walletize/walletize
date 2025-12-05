'use server';

import { RawFinancialAccount, FinancialAccount, serializeFinancialAccount } from '@/types/FinancialAccount';
import { cookies } from 'next/headers';

export async function getFinancialAccount(id: string) {
  const fetchAccount = await fetch(process.env.NEXT_PUBLIC_API_URL + '/accounts/' + id, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookies().toString(),
      Origin: process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3101',
    },
  });
  if (!fetchAccount.ok) {
    return null;
  }

  const rawAccount: RawFinancialAccount = await fetchAccount.json();
  const account: FinancialAccount = serializeFinancialAccount(rawAccount);

  return account;
}
