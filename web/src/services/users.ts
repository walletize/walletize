import { getApiUrl } from "@/lib/api";

export async function updateMainCurrency(currencyId: string) {
  const res = await fetch(getApiUrl() + `/users/currency/${currencyId}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Origin: process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3101',
    },
  });

  const body = await res.json();
  return { ok: res.ok, message: body.message };
}

export async function updateUser(name: string) {
  const res = await fetch(getApiUrl() + '/users', {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Origin: process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3101',
    },
    body: JSON.stringify({
      name,
    }),
  });

  const body = await res.json();
  return { ok: res.ok, message: body.message };
}

export async function deleteUser() {
  const res = await fetch(getApiUrl() + '/users', {
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

export async function updatePassword(currentPassword: string, newPassword: string) {
  const res = await fetch(getApiUrl() + '/users/password', {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Origin: process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3101',
    },
    body: JSON.stringify({
      currentPassword,
      newPassword,
    }),
  });

  const body = await res.json();
  return { ok: res.ok, message: body.message };
}
