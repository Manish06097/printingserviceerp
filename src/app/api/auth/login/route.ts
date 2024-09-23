// // src/app/api/auth/login/route.ts

// import { NextResponse } from 'next/server';
// import { PrismaClient } from '@prisma/client';
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';

// const prisma = new PrismaClient();
// const SECRET_KEY = process.env.JWT_SECRET_KEY || 'your-secret-key';

// export async function POST(request: Request) {
//   try {
//     const { email, password } = await request.json();

//     // Validate input
//     if (!email || !password) {
//       return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
//     }

//     // Find the user
//     const user = await prisma.user.findUnique({
//       where: { email },
//     });

//     if (!user) {
//       return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
//     }

//     // Compare the password
//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
//     }

//     // Generate a JWT token
//     const token = jwt.sign({ userId: user.id, role: user.role }, SECRET_KEY, { expiresIn: '7d' });

//     // Exclude the password from the response
//     const { password: _, ...userWithoutPassword } = user;

//     return NextResponse.json({ token, user: userWithoutPassword }, { status: 200 });
//   } catch (error) {
//     console.error('Login Error:', error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// }

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

const prisma = new PrismaClient();
const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET_KEY || 'your-secret-key');

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate a user by email and password. Returns a JWT token if authentication is successful.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email of the user
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 description: The password of the user
 *                 example: password123
 *     responses:
 *       200:
 *         description: Successful login, returns JWT token and user information.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: User ID
 *                       example: 1
 *                     name:
 *                       type: string
 *                       description: The name of the user
 *                       example: John Doe
 *                     email:
 *                       type: string
 *                       description: The email of the user
 *                       example: johndoe@example.com
 *                     role:
 *                       type: string
 *                       description: The role of the user
 *                       example: ADMIN
 *       400:
 *         description: Missing email or password.
 *       401:
 *         description: Invalid credentials.
 *       500:
 *         description: Internal server error.
 */
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Compare the password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Generate a JWT token using `SignJWT` from `jose`
    const token = await new SignJWT({ userId: user.id, role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(SECRET_KEY);

    // Exclude the password from the response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({ token, user: userWithoutPassword }, { status: 200 });
  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
