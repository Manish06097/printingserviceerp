import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET_KEY);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define routes that require authentication and roles
  const protectedRoutes = ['/api/admin/users'];

  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    const authHeader = request.headers.get('authorization');

    // If no authorization header is present, return unauthorized response
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7).trim(); // Remove 'Bearer ' from the header

    try {
      // Verify the token using `jose`
      const { payload } = await jwtVerify(token, SECRET_KEY);

      // Extract user ID and role from the payload
      const { userId, role } = payload as { userId: number; role: string };

      // Check if the user is a SUPER_ADMIN
      if (role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      // Attach user info to the request if needed
      request.headers.set('x-user-id', String(userId));
      request.headers.set('x-user-role', role);
    } catch (error) {
      console.error('JWT Verification Error:', error);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/admin/users/:path*'], // Protect all subpaths of /api/admin/users
};
