import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/** Cookie presence only here (Edge-safe). JWT validity is enforced by `/api/admin/auth` and admin APIs. */
function hasAdminCookie(request: NextRequest): boolean {
  return Boolean(request.cookies.get('admin_token')?.value);
}

function corsBase(req: NextRequest): Record<string, string> {
  const fixed = process.env.CORS_ORIGIN?.trim();
  if (fixed) {
    return {
      'Access-Control-Allow-Origin': fixed,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers':
        'Content-Type, Authorization, X-Requested-With, Cookie, X-CSRF-Token',
    };
  }
  const origin = req.headers.get('origin');
  if (origin) {
    return {
      'Access-Control-Allow-Origin': origin,
      Vary: 'Origin',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers':
        'Content-Type, Authorization, X-Requested-With, Cookie, X-CSRF-Token',
    };
  }
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers':
      'Content-Type, Authorization, X-Requested-With, Cookie, X-CSRF-Token',
  };
}

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: {
          ...corsBase(request),
          'Access-Control-Max-Age': '86400',
        },
      });
    }
    const response = NextResponse.next();
    for (const [k, v] of Object.entries(corsBase(request))) {
      response.headers.set(k, v);
    }
    return response;
  }

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
  matcher: ['/api/:path*', '/admin/:path*'],
};
