// src/app/api/stock/entries/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/stock/entries:
 *   post:
 *     summary: Create a new stock entry
 *     tags:
 *       - Stock Entries
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - partyName
 *               - dateReceived
 *               - stockItemIds
 *             properties:
 *               partyName:
 *                 type: string
 *                 example: "Supplier A"
 *               dateReceived:
 *                 type: string
 *                 format: date
 *                 example: "2023-09-25"
 *               stockItemIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *     responses:
 *       201:
 *         description: Stock entry created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StockEntry'
 *       400:
 *         description: Missing required fields or invalid data.
 *       500:
 *         description: Internal server error.
 */
export async function POST(request: Request) {
  try {
    const { partyName, dateReceived, stockItemIds } = await request.json();

    // Validate required fields
    if (!partyName || !dateReceived || !Array.isArray(stockItemIds) || stockItemIds.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate stockItemIds
    const stockItems = await prisma.stockItem.findMany({
      where: {
        id: { in: stockItemIds },
      },
    });

    if (stockItems.length !== stockItemIds.length) {
      return NextResponse.json({ error: 'One or more stock items not found' }, { status: 400 });
    }

    // Create StockEntry and StockEntryItems in a transaction
    const stockEntry = await prisma.$transaction(async (prisma) => {
      const newStockEntry = await prisma.stockEntry.create({
        data: {
          partyName,
          dateReceived: new Date(dateReceived),
        },
      });

      const stockEntryItemsData = stockItemIds.map((stockItemId: number) => ({
        stockEntryId: newStockEntry.id,
        stockItemId,
      }));

      await prisma.stockEntryItem.createMany({
        data: stockEntryItemsData,
      });

      return newStockEntry;
    });

    // Fetch the created StockEntry with related StockEntryItems and StockItems
    const createdStockEntry = await prisma.stockEntry.findUnique({
      where: { id: stockEntry.id },
      include: {
        stockItems: {
          include: {
            stockItem: true,
          },
        },
      },
    });

    return NextResponse.json(createdStockEntry, { status: 201 });
  } catch (error) {
    console.error('Create Stock Entry Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}




/**
 * @swagger
 * /api/stock/entries:
 *   get:
 *     summary: Get all stock entries
 *     tags:
 *       - Stock Entries
 *     responses:
 *       200:
 *         description: A list of stock entries.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StockEntry'
 *       500:
 *         description: Internal server error.
 */
export async function GET() {
    try {
      const stockEntries = await prisma.stockEntry.findMany({
        include: {
          stockItems: {
            include: {
              stockItem: true,
            },
          },
        },
      });
      return NextResponse.json(stockEntries, { status: 200 });
    } catch (error) {
      console.error('Get Stock Entries Error:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
  