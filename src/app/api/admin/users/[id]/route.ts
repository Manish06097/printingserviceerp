// // src/app/api/admin/users/[id]/route.ts

// import { NextResponse } from 'next/server';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// export async function GET(
//   request: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const userId = Number(params.id);

//     const user = await prisma.user.findUnique({
//       where: { id: userId },
//       select: {
//         id: true,
//         name: true,
//         email: true,
//         role: true,
//         createdAt: true,
//         updatedAt: true,
//       },
//     });

//     if (!user) {
//       return NextResponse.json({ error: 'User not found' }, { status: 404 });
//     }

//     return NextResponse.json(user, { status: 200 });
//   } catch (error) {
//     console.error('Get User Error:', error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// }

// export async function PUT(
//   request: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const userId = Number(params.id);
//     const data = await request.json();

//     // Optional: Validate data here

//     // Prevent updating the password directly
//     if ('password' in data) {
//       delete data.password;
//     }

//     const updatedUser = await prisma.user.update({
//       where: { id: userId },
//       data,
//       select: {
//         id: true,
//         name: true,
//         email: true,
//         role: true,
//         createdAt: true,
//         updatedAt: true,
//       },
//     });

//     return NextResponse.json(updatedUser, { status: 200 });
//   } catch (error) {
//     console.error('Update User Error:', error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// }

// export async function DELETE(
//   request: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const userId = Number(params.id);

//     // Prevent deletion of self
//     const requesterId = request.headers.get('x-user-id');
//     if (Number(requesterId) === userId) {
//       return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
//     }

//     await prisma.user.delete({
//       where: { id: userId },
//     });

//     return NextResponse.json({ message: 'User deleted' }, { status: 200 });
//   } catch (error) {
//     console.error('Delete User Error:', error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// }
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     description: Fetch a user by their unique ID.
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Numeric ID of the user to retrieve.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A user object.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: User not found.
 *       401:
 *         description: Unauthorized access (invalid or missing token).
 *       500:
 *         description: Internal server error.
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = Number(params.id);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error('Get User Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/admin/users/{id}:
 *   put:
 *     summary: Update a user by ID
 *     description: Update the details of an existing user.
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Numeric ID of the user to update.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               role:
 *                 type: string
 *                 example: ADMIN
 *     responses:
 *       200:
 *         description: The updated user object.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: User not found.
 *       401:
 *         description: Unauthorized access (invalid or missing token).
 *       500:
 *         description: Internal server error.
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = Number(params.id);
    const data = await request.json();

    // Prevent updating the password directly
    if ('password' in data) {
      delete data.password;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error('Update User Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     description: Delete an existing user from the system.
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Numeric ID of the user to delete.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User deleted
 *       400:
 *         description: Cannot delete yourself.
 *       404:
 *         description: User not found.
 *       401:
 *         description: Unauthorized access (invalid or missing token).
 *       500:
 *         description: Internal server error.
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = Number(params.id);

    // Prevent deletion of self
    const requesterId = request.headers.get('x-user-id');
    if (Number(requesterId) === userId) {
      return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: 'User deleted' }, { status: 200 });
  } catch (error) {
    console.error('Delete User Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
