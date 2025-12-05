import { parseCurrencyInput } from '@/lib/utils';
import { AccountCategory } from '@/types/AccountCategory';
import { AccountInvite } from '@/types/AccountInvite';
import { Currency } from '@/types/Currency';
import { FinancialAccount } from '@/types/FinancialAccount';
import { User } from '@/types/User';
import { getApiUrl } from '@/lib/api';

export async function addFinancialAccount(
  formData: FormData,
  user: User,
  category: AccountCategory,
  currency: Currency,
  icon: string,
  color: string,
  iconColor: string,
  accountInvites: AccountInvite[],
) {
  const name = formData.get('name') as string;
  const initialValue = formData.get('initialValue') as string;
  let parsedInitialValue = 0;
  if (initialValue != '') {
    parsedInitialValue = parseCurrencyInput(initialValue);
  }

  await fetch(getApiUrl() + '/accounts', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Origin: process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3101',
    },
    body: JSON.stringify({
      account: {
        userId: user.id,
        name,
        categoryId: category.id,
        currencyId: currency.id,
        initialValue: parsedInitialValue,
        icon,
        color,
        iconColor,
      },
      accountInvites,
    }),
  });
}

export async function addFinancialAccountCategory(formData: FormData, typeId?: string) {
  const name = formData.get('name') as string;

  const res = await fetch(getApiUrl() + '/accounts/categories', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Origin: process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3101',
    },
    body: JSON.stringify({
      name,
      typeId,
    }),
  });

  const body = await res.json();
  return { ok: res.ok, message: body.message };
}

export async function updateFinancialAccountCategory(id: string, formData: FormData, typeId: string) {
  const name = formData.get('name') as string;

  const res = await fetch(getApiUrl() + '/accounts/categories/' + id, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Origin: process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3101',
    },
    body: JSON.stringify({
      name,
      typeId,
    }),
  });

  const body = await res.json();
  return { ok: res.ok, message: body.message };
}

export async function deleteFinancialAccountCategory(id: string) {
  const res = await fetch(getApiUrl() + '/accounts/categories/' + id, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Origin: process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3101',
    },
  });

  const body = await res.json();
  return { ok: res.ok, message: body.message };
}

export async function deleteFinancialAccount(account: FinancialAccount) {
  const res = await fetch(getApiUrl() + '/accounts/' + account.id, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Origin: process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3101',
    },
  });

  const body = await res.json();
  return { ok: res.ok, message: body.message };
}

export async function updateFinancialAccount(
  formData: FormData,
  category: AccountCategory,
  account: FinancialAccount,
  currency: Currency,
  user: User,
  icon: string,
  color: string,
  iconColor: string,
) {
  const name = formData.get('name') as string;
  const initialValue = formData.get('initialValue') as string;
  let parsedInitialValue = 0;
  if (initialValue != '') {
    parsedInitialValue = parseCurrencyInput(initialValue);
  }

  const res = await fetch(getApiUrl() + '/accounts/' + account.id, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Origin: process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3101',
    },
    body: JSON.stringify({
      userId: user.id,
      name,
      categoryId: category.id,
      currencyId: currency.id,
      initialValue: parsedInitialValue,
      icon,
      color,
      iconColor,
    }),
  });

  const body = await res.json();
  return { ok: res.ok, message: body.message };
}

export async function sendAccountInvite(email: string, accountId: string) {
  const res = await fetch(getApiUrl() + '/accounts/invites', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Origin: process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3101',
    },
    body: JSON.stringify({ email, accountId }),
  });

  const body = await res.json();
  return { ok: res.ok, message: body.message };
}

export async function deleteAccountInvite(accountInviteId: string) {
  const res = await fetch(getApiUrl() + '/accounts/invites/' + accountInviteId, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Origin: process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3101',
    },
  });

  const body = await res.json();
  return { ok: res.ok, message: body.message };
}

export async function acceptAccountInvite(inviteId: string) {
  const res = await fetch(`${getApiUrl()}/accounts/invites/${inviteId}/accept`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Origin: process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3101',
    },
  });

  const body = await res.json();
  return { ok: res.ok, message: body.message };
}

export async function declineAccountInvite(inviteId: string) {
  const res = await fetch(`${getApiUrl()}/accounts/invites/${inviteId}/decline`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Origin: process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3101',
    },
  });

  const body = await res.json();
  return { ok: res.ok, message: body.message };
}

export async function leaveAccount(accountId: string) {
  const res = await fetch(`${getApiUrl()}/accounts/invites/${accountId}/leave`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Origin: process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3101',
    },
  });

  const body = await res.json();
  return { ok: res.ok, message: body.message };
}
