// // src/app/api/auth/register/route.ts

// import { NextResponse } from 'next/server';
// import { PrismaClient, Role } from '@prisma/client';
// import bcrypt from 'bcryptjs';

// const prisma = new PrismaClient();

// export async function POST(request: Request) {
//   try {
//     const { name, email, password, role } = await request.json();

//     // Validate input
//     if (!name || !email || !password) {
//       return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
//     }

//     // Check if user already exists
//     const existingUser = await prisma.user.findUnique({
//       where: { email },
//     });

//     if (existingUser) {
//       return NextResponse.json({ error: 'User already exists' }, { status: 409 });
//     }

//     // Hash the password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create the user
//     const user = await prisma.user.create({
//       data: {
//         name,
//         email,
//         password: hashedPassword,
//         role: role in Role ? role : Role.STAFF, // Validate role
//       },
//     });

//     // Exclude the password from the response
//     const { password: _, ...userWithoutPassword } = user;

//     return NextResponse.json(userWithoutPassword, { status: 201 });
//   } catch (error) {
//     console.error('Registration Error:', error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// }


import { NextResponse } from 'next/server';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user by providing a name, email, password, and role. If the role is not provided, the default role is "STAFF".
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the user
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 description: The email of the user
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 description: The password for the user
 *                 example: password123
 *               role:
 *                 type: string
 *                 description: The role of the user (e.g., SUPER_ADMIN, ADMIN, STAFF). Defaults to STAFF.
 *                 example: ADMIN
 *     responses:
 *       201:
 *         description: User created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The user ID
 *                   example: 1
 *                 name:
 *                   type: string
 *                   description: The name of the user
 *                   example: John Doe
 *                 email:
 *                   type: string
 *                   description: The email of the user
 *                   example: johndoe@example.com
 *                 role:
 *                   type: string
 *                   description: The role of the user
 *                   example: ADMIN
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: Timestamp when the user was created
 *                   example: 2023-09-22T12:34:56.789Z
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   description: Timestamp when the user was last updated
 *                   example: 2023-09-22T12:34:56.789Z
 *       400:
 *         description: Missing required fields (name, email, or password).
 *       409:
 *         description: User with the provided email already exists.
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
        role: role in Role ? role : Role.STAFF, // Validate role
      },
    });

    // Exclude the password from the response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
