// src/app/api/admin/employees/attendance/[id]/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/admin/employees/attendance/{id}:
 *   get:
 *     summary: Get attendance records for an employee
 *     description: Retrieve all attendance records for a specific employee by their ID.
 *     tags:
 *       - Attendance
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the employee whose attendance records are being retrieved.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Attendance records retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The ID of the attendance record.
 *                     example: 1
 *                   employeeId:
 *                     type: integer
 *                     description: The ID of the employee.
 *                     example: 1
 *                   date:
 *                     type: string
 *                     format: date
 *                     description: The date of the attendance.
 *                     example: "2023-09-24"
 *                   checkIn:
 *                     type: string
 *                     format: date-time
 *                     description: The check-in time for the employee.
 *                     example: "2023-09-24T09:00:00Z"
 *                   checkOut:
 *                     type: string
 *                     format: date-time
 *                     description: The check-out time for the employee.
 *                     example: "2023-09-24T17:00:00Z"
 *                   status:
 *                     type: string
 *                     description: The attendance status.
 *                     example: "PRESENT"
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

    // Check if employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Get attendance records
    const attendanceRecords = await prisma.attendance.findMany({
      where: { employeeId },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(attendanceRecords, { status: 200 });
  } catch (error) {
    console.error('Get Attendance Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
