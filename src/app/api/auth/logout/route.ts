// src/app/api/auth/logout/route.ts (if you're using App Directory structure)

import { NextResponse } from 'next/server';
import { destroyCookie } from 'nookies';

export async function GET() {
  const response = NextResponse.json({ message: 'Logged out' });
  
  // Remove the cookie by setting it to expire
  response.cookies.set('token', '', {
    httpOnly: true,
    expires: new Date(0), // Expire the cookie
    path: '/', // Ensure the path is the same as where it was set
  });

  return response;
}
