import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
    process.env.AUTH_SECRET || 'your-secret-key-change-this-in-production'
);

// Routes that are only for unauthenticated users (redirect to /connect if logged in)
const guestOnlyRoutes = ['/', '/login'];

// Public API routes (no auth required)
const publicApiRoutes = ['/api/auth/login', '/api/auth/google', '/api/auth/github'];

// Routes that require authentication (protected pages)
const protectedRoutes = ['/connect', '/viewer', '/settings'];

async function isAuthenticated(request: NextRequest): Promise<boolean> {
    const token = request.cookies.get('session')?.value;
    if (!token) return false;

    try {
        await jwtVerify(token, SECRET_KEY);
        return true;
    } catch {
        return false;
    }
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public API routes without any checks
    if (publicApiRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    const authenticated = await isAuthenticated(request);

    // Check if this is a guest-only route (home, login)
    if (guestOnlyRoutes.includes(pathname)) {
        if (authenticated) {
            // Redirect authenticated users to /connect
            return NextResponse.redirect(new URL('/connect', request.url));
        }
        return NextResponse.next();
    }

    // Check if the route is protected
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    if (isProtectedRoute) {
        if (!authenticated) {
            // Redirect to login if not authenticated
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }
        return NextResponse.next();
    }

    // For all other routes, allow access
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.ico).*)',
    ],
};
