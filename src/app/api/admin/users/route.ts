// // src/app/api/admin/users/route.ts
// import bcrypt from 'bcryptjs'; // Add this import
// import { NextResponse } from 'next/server';
// import { PrismaClient, Role } from '@prisma/client'; // Ensure Role is imported correctly


// const prisma = new PrismaClient();

// export async function GET(request: Request) {
//   try {
//     const users = await prisma.user.findMany({
//       select: {
//         id: true,
//         name: true,
//         email: true,
//         role: true,
//         createdAt: true,
//         updatedAt: true,
//       },
//     });

//     return NextResponse.json(users, { status: 200 });
//   } catch (error) {
//     console.error('Get Users Error:', error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// }


// export async function POST(request: Request) {
//     try {
//       const { name, email, password, role } = await request.json();
  
//       // Validate input
//       if (!name || !email || !password) {
//         return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
//       }
  
//       // Check if user already exists
//       const existingUser = await prisma.user.findUnique({
//         where: { email },
//       });
  
//       if (existingUser) {
//         return NextResponse.json({ error: 'User already exists' }, { status: 409 });
//       }
  
//       // Hash the password
//       const hashedPassword = await bcrypt.hash(password, 10);
  
//       // Create the user
//       const user = await prisma.user.create({
//         data: {
//           name,
//           email,
//           password: hashedPassword,
//           role: role in Role ? role : Role.STAFF, // Default to STAFF if role is invalid
//         },
//         select: {
//           id: true,
//           name: true,
//           email: true,
//           role: true,
//           createdAt: true,
//           updatedAt: true,
//         },
//       });
  
//       return NextResponse.json(user, { status: 201 });
//     } catch (error) {
//       console.error('Create User Error:', error);
//       return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//     }
//   }

import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users
 *     description: Fetch a list of all users in the system.
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of users.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: User ID
 *                     example: 1
 *                   name:
 *                     type: string
 *                     description: User's name
 *                     example: John Doe
 *                   email:
 *                     type: string
 *                     description: User's email
 *                     example: johndoe@example.com
 *                   role:
 *                     type: string
 *                     description: User's role (e.g., ADMIN, STAFF)
 *                     example: ADMIN
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     description: Date when the user was created
 *                     example: 2023-09-22T12:34:56.789Z
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     description: Date when the user was last updated
 *                     example: 2023-09-22T12:34:56.789Z
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */
export async function GET(request: Request) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error('Get Users Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/admin/users:
 *   post:
 *     summary: Create a new user
 *     description: Create a new user with the specified name, email, password, and role.
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the new user
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 description: The email of the new user
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 description: The password for the new user
 *                 example: password123
 *               role:
 *                 type: string
 *                 description: The role for the new user (SUPER_ADMIN, ADMIN, STAFF)
 *                 example: ADMIN
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: User ID
 *                   example: 1
 *                 name:
 *                   type: string
 *                   description: User's name
 *                   example: John Doe
 *                 email:
 *                   type: string
 *                   description: User's email
 *                   example: johndoe@example.com
 *                 role:
 *                   type: string
 *                   description: User's role
 *                   example: ADMIN
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: Date when the user was created
 *                   example: 2023-09-22T12:34:56.789Z
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   description: Date when the user was last updated
 *                   example: 2023-09-22T12:34:56.789Z
 *       409:
 *         description: User already exists.
 *       400:
 *         description: Missing required fields.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */
export async function POST(request: Request) {
  try {
    const { name, email, password, role } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role in Role ? role : Role.STAFF, // Default to STAFF if role is invalid
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Create User Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
