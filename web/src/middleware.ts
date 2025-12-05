import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Redirect root to dashboard
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Disable signup if env variable is set
  if (process.env.DISABLE_SIGNUP === 'true' && request.nextUrl.pathname === '/signup') {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/', '/signup'],
};
