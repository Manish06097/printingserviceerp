// src/app/api/admin/employees/attendance/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient, AttendanceStatus } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/admin/employees/attendance:
 *   post:
 *     summary: Record attendance for an employee
 *     description: Create a new attendance record for a specific employee.
 *     tags:
 *       - Attendance
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               employeeId:
 *                 type: integer
 *                 description: The ID of the employee.
 *                 example: 1
 *               date:
 *                 type: string
 *                 format: date
 *                 description: The date of the attendance.
 *                 example: "2023-09-24"
 *               checkIn:
 *                 type: string
 *                 format: date-time
 *                 description: The check-in time for the employee.
 *                 example: "2023-09-24T09:00:00Z"
 *               checkOut:
 *                 type: string
 *                 format: date-time
 *                 description: The check-out time for the employee.
 *                 example: "2023-09-24T17:00:00Z"
 *               status:
 *                 type: string
 *                 enum: [PRESENT, ABSENT, LEAVE]
 *                 description: The attendance status.
 *                 example: "PRESENT"
 *     responses:
 *       201:
 *         description: Attendance recorded successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The ID of the attendance record.
 *                   example: 1
 *                 employeeId:
 *                   type: integer
 *                   description: The ID of the employee.
 *                   example: 1
 *                 date:
 *                   type: string
 *                   format: date
 *                   description: The date of the attendance.
 *                   example: "2023-09-24"
 *                 checkIn:
 *                   type: string
 *                   format: date-time
 *                   description: The check-in time.
 *                   example: "2023-09-24T09:00:00Z"
 *                 checkOut:
 *                   type: string
 *                   format: date-time
 *                   description: The check-out time.
 *                   example: "2023-09-24T17:00:00Z"
 *                 status:
 *                   type: string
 *                   description: The attendance status.
 *                   example: "PRESENT"
 *       400:
 *         description: Missing required fields.
 *       404:
 *         description: Employee not found.
 *       500:
 *         description: Internal server error.
 */
export async function POST(request: Request) {
  try {
    const { employeeId, date, checkIn, checkOut, status } = await request.json();

    // Validate input
    if (!employeeId || !date || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Create attendance record
    const attendance = await prisma.attendance.create({
      data: {
        employeeId,
        date: new Date(date),
        checkIn: checkIn ? new Date(checkIn) : null,
        checkOut: checkOut ? new Date(checkOut) : null,
        status: status in AttendanceStatus ? status : AttendanceStatus.PRESENT,
      },
    });

    return NextResponse.json(attendance, { status: 201 });
  } catch (error) {
    console.error('Record Attendance Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
