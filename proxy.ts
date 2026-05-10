import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/** Cookie presence only here (Edge-safe). JWT validity is enforced by `/api/admin/auth` and admin APIs. */
function hasAdminCookie(request: NextRequest): boolean {
  return Boolean(request.cookies.get('admin_token')?.value);
}

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin/dashboard')) {
    if (!hasAdminCookie(request)) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    return NextResponse.next();
  }

  if (request.nextUrl.pathname === '/admin/login') {
    if (hasAdminCookie(request)) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
