// src/app/api/stock/types/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/stock/types:
 *   post:
 *     summary: Create a new stock type
 *     tags:
 *       - Stock Types
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Electronics"
 *     responses:
 *       201:
 *         description: Stock type created successfully.
 *       400:
 *         description: Missing required fields.
 *       409:
 *         description: Stock type already exists.
 *       500:
 *         description: Internal server error.
 */
export async function POST(request: Request) {
  try {
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Check if the stock type already exists
    const existingType = await prisma.stockType.findUnique({ where: { name } });
    if (existingType) {
      return NextResponse.json({ error: 'Stock type already exists' }, { status: 409 });
    }

    const stockType = await prisma.stockType.create({
      data: { name },
    });

    return NextResponse.json(stockType, { status: 201 });
  } catch (error) {
    console.error('Create Stock Type Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


/**
 * @swagger
 * /api/stock/types:
 *   get:
 *     summary: Get all stock types
 *     tags:
 *       - Stock Types
 *     responses:
 *       200:
 *         description: A list of stock types.
 *       500:
 *         description: Internal server error.
 */
export async function GET() {
    try {
      const stockTypes = await prisma.stockType.findMany();
      return NextResponse.json(stockTypes, { status: 200 });
    } catch (error) {
      console.error('Get Stock Types Error:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
  