// src/app/api/stock/types/[id]/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/stock/types/{id}:
 *   get:
 *     summary: Get a stock type by ID
 *     tags:
 *       - Stock Types
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The stock type ID.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Stock type retrieved successfully.
 *       404:
 *         description: Stock type not found.
 *       500:
 *         description: Internal server error.
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const stockTypeId = Number(params.id);
    const stockType = await prisma.stockType.findUnique({
      where: { id: stockTypeId },
    });

    if (!stockType) {
      return NextResponse.json({ error: 'Stock type not found' }, { status: 404 });
    }

    return NextResponse.json(stockType, { status: 200 });
  } catch (error) {
    console.error('Get Stock Type Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}



export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    try {
      const stockTypeId = Number(params.id);
      const { name } = await request.json();
  
      if (!name) {
        return NextResponse.json({ error: 'Name is required' }, { status: 400 });
      }
  
      const stockType = await prisma.stockType.update({
        where: { id: stockTypeId },
        data: { name },
      });
  
      return NextResponse.json(stockType, { status: 200 });
    } catch (error) {
      console.error('Update Stock Type Error:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

  
  export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    try {
      const stockTypeId = Number(params.id);
  
      await prisma.stockType.delete({
        where: { id: stockTypeId },
      });
  
      return NextResponse.json({ message: 'Stock type deleted successfully' }, { status: 200 });
    } catch (error) {
      console.error('Delete Stock Type Error:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
  