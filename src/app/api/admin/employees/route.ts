// src/app/api/admin/employees/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/admin/employees:
 *   post:
 *     summary: Create a new employee
 *     description: Create a new employee with an associated user account.
 *     tags:
 *       - Employees
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
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 description: The email of the employee.
 *                 example: "johndoe@example.com"
 *               password:
 *                 type: string
 *                 description: The password for the employee.
 *                 example: "password123"
 *               role:
 *                 type: string
 *                 enum: [SUPER_ADMIN, ADMIN, STAFF]
 *                 description: The role of the employee.
 *                 example: "STAFF"
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: The start date of the employee.
 *                 example: "2023-09-24"
 *               salary:
 *                 type: number
 *                 description: The salary of the employee.
 *                 example: 50000.0
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *                 description: The status of the employee.
 *                 example: "ACTIVE"
 *     responses:
 *       201:
 *         description: Employee created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The ID of the employee.
 *                   example: 1
 *                 name:
 *                   type: string
 *                   description: The name of the employee.
 *                   example: "John Doe"
 *                 email:
 *                   type: string
 *                   description: The email of the employee.
 *                   example: "johndoe@example.com"
 *                 role:
 *                   type: string
 *                   description: The role of the employee.
 *                   example: "STAFF"
 *                 startDate:
 *                   type: string
 *                   format: date
 *                   description: The start date of the employee.
 *                   example: "2023-09-24"
 *                 salary:
 *                   type: number
 *                   description: The salary of the employee.
 *                   example: 50000.0
 *                 status:
 *                   type: string
 *                   description: The status of the employee.
 *                   example: "ACTIVE"
 *       400:
 *         description: Missing required fields.
 *       409:
 *         description: Email already exists.
 *       500:
 *         description: Internal server error.
 */
export async function POST(request: Request) {
  try {
    const { name, email, password, role, startDate, status, salary } = await request.json();

    // Validate input
    if (!name || !email || !password || !role || !startDate || salary === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User and Employee in a transaction
    const employee = await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: role in Role ? role : Role.STAFF,
        },
      });

      const employee = await prisma.employee.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: role in Role ? role : Role.STAFF,
          startDate: new Date(startDate),
          status: status || 'ACTIVE',
          salary: parseFloat(salary),
          userId: user.id,
        },
        include: {
          user: true,
        },
      });

      return employee;
    });

    // Exclude password from response
    const { password: _, ...employeeWithoutPassword } = employee;

    return NextResponse.json(employeeWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('Create Employee Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/admin/employees:
 *   get:
 *     summary: Get all employees
 *     description: Fetch a list of all employees with their associated user details.
 *     tags:
 *       - Employees
 *     responses:
 *       200:
 *         description: A list of employees.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The ID of the employee.
 *                     example: 1
 *                   name:
 *                     type: string
 *                     description: The name of the employee.
 *                     example: "John Doe"
 *                   email:
 *                     type: string
 *                     description: The email of the employee.
 *                     example: "johndoe@example.com"
 *                   role:
 *                     type: string
 *                     description: The role of the employee.
 *                     example: "STAFF"
 *                   startDate:
 *                     type: string
 *                     format: date
 *                     description: The start date of the employee.
 *                     example: "2023-09-24"
 *                   salary:
 *                     type: number
 *                     description: The salary of the employee.
 *                     example: 50000.0
 *                   status:
 *                     type: string
 *                     description: The status of the employee.
 *                     example: "ACTIVE"
 *       500:
 *         description: Internal server error.
 */
export async function GET(request: Request) {
  try {
    const employees = await prisma.employee.findMany({
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

    // Exclude passwords from response
    const employeesWithoutPasswords = employees.map(({ password, ...employee }) => employee);

    return NextResponse.json(employeesWithoutPasswords, { status: 200 });
  } catch (error) {
    console.error('Get Employees Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
