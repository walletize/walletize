import { getApiUrl } from "@/lib/api";

export async function signUp(name: string, email: string, password: string) {
  const res = await fetch(getApiUrl() + '/auth/signup', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Origin: process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3101',
    },
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });

  const body = await res.json();
  return { ok: res.ok, message: body.message };
}

export async function logIn(email: string, password: string) {
  const res = await fetch(getApiUrl() + '/auth/login', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Origin: process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3101',
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const body = await res.json();
  return { ok: res.ok, body };
}

export async function logOut() {
  const res = await fetch(getApiUrl() + '/auth/logout', {
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
