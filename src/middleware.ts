import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { environment } from '@/config/environment';

export function middleware(request: NextRequest) {
  try {
    const isApiRoute = request.nextUrl.pathname.startsWith('/api/');
    const isPublicRoute = request.nextUrl.pathname.startsWith('/_next/') || 
                         request.nextUrl.pathname.startsWith('/static/') ||
                         request.nextUrl.pathname.includes('.');

    // Allow public routes and API routes
    if (isPublicRoute || isApiRoute) {
      return NextResponse.next();
    }

    // Only enforce authentication in production
    if (environment.isProduction && environment.features.enableAzureAD) {
      const isAuthenticated = request.cookies.has('msal.idtoken');
      const isAuthPage = request.nextUrl.pathname.startsWith('/auth/');

      // Redirect unauthenticated users to sign in
      if (!isAuthenticated && !isAuthPage) {
        const signInUrl = new URL('/auth/signin', request.url);
        signInUrl.searchParams.set('from', request.nextUrl.pathname);
        return NextResponse.redirect(signInUrl);
      }

      // Redirect authenticated users away from auth pages
      if (isAuthenticated && isAuthPage) {
        const from = request.nextUrl.searchParams.get('from') || '/';
        return NextResponse.redirect(new URL(from, request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api/ (API routes)
     * 2. /_next/ (Next.js internals)
     * 3. /static/ (static files)
     * 4. .*\\..*$ (files with extensions - e.g. favicon.ico)
     */
    '/((?!api|_next|static|.*\\..*$).*)'
  ]
}; 