// src/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Ensure the SECRET_KEY is defined
if (!process.env.JWT_SECRET_KEY) {
  throw new Error('JWT_SECRET_KEY is not defined in the environment variables');
}

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET_KEY);

// Define public routes that don't require authentication
const publicRoutes = [
  '/login',
  '/api/auth/login',
  '/favicon.ico',
  '/_next/static', 
  // Add any other public paths that don't require authentication
];

// Define protected frontend routes (add more as needed)
const protectedFrontendRoutes = [
  '/',               // Main page
  '/dashboard',      // Example protected page
  '/settings',       // Another example
  // Add other frontend routes you want to protect
];

// Define protected API routes with role-based access
const protectedApiRoutes: { path: string; roles: string[] }[] = [
  { path: '/api/admin/users', roles: ['SUPER_ADMIN'] },
  { path: '/api/admin/employees', roles: ['SUPER_ADMIN', 'ADMIN'] },
  // Add more API routes with required roles
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Handle Public Routes
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // If user is authenticated and trying to access a public route like /login, redirect to main page
  const token = request.cookies.get('token')?.value;
  if (isPublicRoute) {
    if (token && pathname.startsWith('/login')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // Allow access to public routes
    return NextResponse.next();
  }

  // 2. Handle API Route Protection with Role-Based Access
  const matchedApiRoute = protectedApiRoutes.find((route) =>
    pathname.startsWith(route.path)
  );

  if (matchedApiRoute) {
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
    }

    try {
      // Verify the token
      const { payload } = await jwtVerify(token, SECRET_KEY);

      // Extract userId and role from payload
      const { role } = payload as { userId: number; role: string };

      // Check if the user has the required role
      if (!matchedApiRoute.roles.includes(role)) {
        return NextResponse.json({ error: 'Forbidden: Insufficient privileges' }, { status: 403 });
      }
    } catch (error) {
      console.error('JWT Verification Error:', error);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  }

  // 3. Handle Frontend Route Protection
  const isProtectedFrontendRoute = protectedFrontendRoutes.includes(pathname);

  if (isProtectedFrontendRoute) {
    if (!token) {
      // If no token, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // Verify the token
      await jwtVerify(token, SECRET_KEY);
    } catch (error) {
      console.error('JWT Verification Error:', error);
      // If token is invalid, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 4. If none of the above conditions matched, allow the request
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Apply middleware to all routes except public ones
    '/login',
    '/api/auth/login',
    '/api/admin/:path*',
    '/',
    '/dashboard',
    '/settings',
    // Add other routes or patterns here
  ],
};
