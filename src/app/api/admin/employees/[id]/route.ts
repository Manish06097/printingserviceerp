// src/app/api/admin/employees/[id]/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/admin/employees/{id}:
 *   get:
 *     summary: Get employee by ID
 *     description: Retrieve an employee's details by their ID.
 *     tags:
 *       - Employees
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the employee to retrieve.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Employee retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The employee ID.
 *                   example: 1
 *                 name:
 *                   type: string
 *                   description: The employee's name.
 *                   example: John Doe
 *                 email:
 *                   type: string
 *                   description: The employee's email.
 *                   example: johndoe@example.com
 *                 role:
 *                   type: string
 *                   description: The employee's role.
 *                   example: STAFF
 *                 salary:
 *                   type: number
 *                   description: The employee's salary.
 *                   example: 50000.0
 *       404:
 *         description: Employee not found.
 *       500:
 *         description: Internal server error.
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const employeeId = Number(params.id);

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Exclude password from response
    const { password, ...employeeWithoutPassword } = employee;

    return NextResponse.json(employeeWithoutPassword, { status: 200 });
  } catch (error) {
    console.error('Get Employee Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/admin/employees/{id}:
 *   put:
 *     summary: Update employee by ID
 *     description: Update an employee's details by their ID.
 *     tags:
 *       - Employees
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the employee to update.
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the employee.
 *                 example: "Jane Doe"
 *               email:
 *                 type: string
 *                 description: The email of the employee.
 *                 example: "janedoe@example.com"
 *               role:
 *                 type: string
 *                 enum: [SUPER_ADMIN, ADMIN, STAFF]
 *                 description: The role of the employee.
 *                 example: "STAFF"
 *               salary:
 *                 type: number
 *                 description: The salary of the employee.
 *                 example: 55000.0
 *     responses:
 *       200:
 *         description: Employee updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The employee ID.
 *                   example: 1
 *                 name:
 *                   type: string
 *                   description: The employee's name.
 *                   example: Jane Doe
 *                 email:
 *                   type: string
 *                   description: The employee's email.
 *                   example: janedoe@example.com
 *                 role:
 *                   type: string
 *                   description: The employee's role.
 *                   example: STAFF
 *                 salary:
 *                   type: number
 *                   description: The employee's salary.
 *                   example: 55000.0
 *       404:
 *         description: Employee not found.
 *       500:
 *         description: Internal server error.
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const employeeId = Number(params.id);
    const data = await request.json();

    // Prevent updating password directly
    if ('password' in data) {
      delete data.password;
    }

    const updatedEmployee = await prisma.employee.update({
      where: { id: employeeId },
      data: {
        ...data,
        user: {
          update: {
            name: data.name,
            email: data.email,
            role: data.role,
          },
        },
      },
      include: {
        user: true,
      },
    });

    // Exclude password from response
    const { password, ...employeeWithoutPassword } = updatedEmployee;

    return NextResponse.json(employeeWithoutPassword, { status: 200 });
  } catch (error) {
    console.error('Update Employee Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/admin/employees/{id}:
 *   delete:
 *     summary: Delete employee by ID
 *     description: Delete an employee and their associated user account by ID.
 *     tags:
 *       - Employees
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the employee to delete.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Employee deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                   example: Employee deleted successfully
 *       404:
 *         description: Employee not found.
 *       500:
 *         description: Internal server error.
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const employeeId = Number(params.id);

    // Check if the employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Delete the employee and the associated user
    await prisma.employee.delete({
      where: { id: employeeId },
    });

    return NextResponse.json({ message: 'Employee deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Delete Employee Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
