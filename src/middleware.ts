// src/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

if (!process.env.JWT_SECRET_KEY) {
  throw new Error('JWT_SECRET_KEY is not defined in the environment variables');
}

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET_KEY);

const publicRoutes = [
  '/login',
  '/api/auth/login',
  '/favicon.ico',
  '/_next/static',
  '/api-docs', // Swagger UI
  // Add other public paths
];

const protectedFrontendRoutes = [
  '/', 
  '/dashboard',
  '/settings',
  // Add other protected frontend routes
];

const protectedApiRoutes: { path: string; roles: string[] }[] = [
  { path: '/api/admin/users', roles: ['SUPER_ADMIN'] },
  { path: '/api/admin/employees', roles: ['SUPER_ADMIN', 'ADMIN'] },
  // Add more protected API routes
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get('origin');

  const allowedOrigins = [
    'https://priyanshart.com',
    'https://www.priyanshart.com',
    // Add other allowed origins if necessary
  ];

  const response = NextResponse.next();

  // Handle CORS
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  }

  // Handle preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: response.headers,
    });
  }

  // Handle Public Routes
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  const token = request.cookies.get('token')?.value;
  if (isPublicRoute) {
    if (token && pathname.startsWith('/login')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return response;
  }

  // Handle Protected API Routes
  const matchedApiRoute = protectedApiRoutes.find((route) =>
    pathname.startsWith(route.path)
  );

  if (matchedApiRoute) {
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
    }

    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      const { role } = payload as { userId: number; role: string };
      if (!matchedApiRoute.roles.includes(role)) {
        return NextResponse.json({ error: 'Forbidden: Insufficient privileges' }, { status: 403 });
      }
    } catch (error) {
      console.error('JWT Verification Error:', error);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  }

  // Handle Protected Frontend Routes
  const isProtectedFrontendRoute = protectedFrontendRoutes.includes(pathname);
  if (isProtectedFrontendRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      await jwtVerify(token, SECRET_KEY);
    } catch (error) {
      console.error('JWT Verification Error:', error);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/login',
    '/api/auth/login',
    '/api/admin/:path*',
    '/',
    '/dashboard',
    '/settings',
    '/api-docs', // Swagger UI
    '/api/swagger',
    // Add other routes or patterns here
  ],
};
