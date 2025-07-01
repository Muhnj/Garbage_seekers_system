import { NextResponse } from 'next/server';

export function middleware(request) {
  // Check for a cookie that indicates authentication
  const isLoggedIn = request.cookies.get('auth-user'); // Use your actual cookie name

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard') && !isLoggedIn) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};