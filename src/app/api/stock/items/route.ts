// src/app/api/stock/items/route.ts


import { NextResponse } from 'next/server';
import { PrismaClient, QuantityType, StockStatus } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/stock/items:
 *   post:
 *     summary: Create a new stock item
 *     tags:
 *       - Stock Items
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - stockTypeId
 *               - quantityType
 *               - totalQuantity
 *               - finalAmount
 *               - status
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Laptop"
 *               image:
 *                 type: string
 *                 example: "image-url.jpg"
 *               stockTypeId:
 *                 type: integer
 *                 example: 1
 *               quantityType:
 *                 type: string
 *                 enum: [GROSS, PACKET, WEIGHT]
 *                 example: "PACKET"
 *               totalQuantity:
 *                 type: integer
 *                 example: 100
 *               totalWeight:
 *                 type: number
 *                 example: 50.5
 *               finalAmount:
 *                 type: number
 *                 example: 5000.0
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, CONSUMED]
 *                 example: "ACTIVE"
 *     responses:
 *       201:
 *         description: Stock item created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StockItem'
 *       400:
 *         description: Missing required fields.
 *       404:
 *         description: Stock type not found.
 *       500:
 *         description: Internal server error.
 */
export async function POST(request: Request) {
  try {
    const {
      name,
      image,
      stockTypeId,
      quantityType,
      totalQuantity,
      totalWeight,
      finalAmount,
      status,
    } = await request.json();

    // Validate required fields
    if (
      !name ||
      !stockTypeId ||
      !quantityType ||
      totalQuantity === undefined ||
      finalAmount === undefined ||
      !status
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if the stock type exists
    const stockType = await prisma.stockType.findUnique({
      where: { id: stockTypeId },
    });
    if (!stockType) {
      return NextResponse.json({ error: 'Stock type not found' }, { status: 404 });
    }

    // Validate quantityType
    if (!(quantityType in QuantityType)) {
      return NextResponse.json({ error: 'Invalid quantityType' }, { status: 400 });
    }

    // Validate status
    if (!(status in StockStatus)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const stockItem = await prisma.stockItem.create({
      data: {
        name,
        image,
        stockTypeId,
        quantityType,
        totalQuantity,
        totalWeight,
        finalAmount,
        status,
      },
    });

    return NextResponse.json(stockItem, { status: 201 });
  } catch (error) {
    console.error('Create Stock Item Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}




/**
 * @swagger
 * /api/stock/items:
 *   get:
 *     summary: Get all stock items
 *     tags:
 *       - Stock Items
 *     responses:
 *       200:
 *         description: A list of stock items.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StockItem'
 *       500:
 *         description: Internal server error.
 */
export async function GET() {
    try {
      const stockItems = await prisma.stockItem.findMany({
        include: {
          stockType: true,
        },
      });
      return NextResponse.json(stockItems, { status: 200 });
    } catch (error) {
      console.error('Get Stock Items Error:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
  