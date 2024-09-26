// src/app/api/stock/entries/[id]/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient,StockStatus } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/stock/entries/{id}:
 *   get:
 *     summary: Get a stock entry by ID
 *     tags:
 *       - Stock Entries
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The stock entry ID.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Stock entry retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StockEntry'
 *       404:
 *         description: Stock entry not found.
 *       500:
 *         description: Internal server error.
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const stockEntryId = Number(params.id);
    const stockEntry = await prisma.stockEntry.findUnique({
      where: { id: stockEntryId },
      include: {
        stockItems: {
          include: {
            stockItem: true,
          },
        },
      },
    });

    if (!stockEntry) {
      return NextResponse.json({ error: 'Stock entry not found' }, { status: 404 });
    }

    return NextResponse.json(stockEntry, { status: 200 });
  } catch (error) {
    console.error('Get Stock Entry Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


/**
 * @swagger
 * /api/stock/entries/{id}:
 *   put:
 *     summary: Update a stock entry
 *     tags:
 *       - Stock Entries
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The stock entry ID.
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               partyName:
 *                 type: string
 *                 example: "Supplier B"
 *               dateReceived:
 *                 type: string
 *                 format: date
 *                 example: "2023-09-26"
 *               stockItemIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [2, 3, 4]
 *     responses:
 *       200:
 *         description: Stock entry updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StockEntry'
 *       400:
 *         description: Invalid data or stock items not found.
 *       404:
 *         description: Stock entry not found.
 *       500:
 *         description: Internal server error.
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const stockEntryId = Number(params.id);
    const { partyName, dateReceived, stockItemIds } = await request.json();

    // Check if the stock entry exists
    const existingStockEntry = await prisma.stockEntry.findUnique({
      where: { id: stockEntryId },
    });

    if (!existingStockEntry) {
      return NextResponse.json({ error: 'Stock entry not found' }, { status: 404 });
    }

    // Prepare data for update
    const updateData: any = {};
    if (partyName) updateData.partyName = partyName;
    if (dateReceived) updateData.dateReceived = new Date(dateReceived);

    // Update stock entry and stock entry items in a transaction
    const updatedStockEntry = await prisma.$transaction(async (prisma) => {
      // Update stock entry
      const stockEntry = await prisma.stockEntry.update({
        where: { id: stockEntryId },
        data: updateData,
      });

      if (Array.isArray(stockItemIds)) {
        // Validate stockItemIds
        const stockItems = await prisma.stockItem.findMany({
          where: {
            id: { in: stockItemIds },
          },
        });

        if (stockItems.length !== stockItemIds.length) {
          throw new Error('One or more stock items not found');
        }

        // Delete existing stock entry items
        await prisma.stockEntryItem.deleteMany({
          where: { stockEntryId },
        });

        // Create new stock entry items
        const stockEntryItemsData = stockItemIds.map((stockItemId: number) => ({
          stockEntryId,
          stockItemId,
        }));

        await prisma.stockEntryItem.createMany({
          data: stockEntryItemsData,
        });
      }

      return stockEntry;
    });

    // Fetch the updated StockEntry with related StockEntryItems and StockItems
    const stockEntry = await prisma.stockEntry.findUnique({
      where: { id: stockEntryId },
      include: {
        stockItems: {
          include: {
            stockItem: true,
          },
        },
      },
    });

    return NextResponse.json(stockEntry, { status: 200 });
  } catch (error) {
    console.error('Update Stock Entry Error:', error);
    if (error.message === 'One or more stock items not found') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

  

/**
 * @swagger
 * /api/stock/entries/{id}:
 *   delete:
 *     summary: Delete a stock entry
 *     tags:
 *       - Stock Entries
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The stock entry ID.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Stock entry deleted successfully.
 *       404:
 *         description: Stock entry not found.
 *       500:
 *         description: Internal server error.
 */


// DELETE /api/stock/entries/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const stockEntryId = Number(params.id);

    // Check if the stock entry exists
    const existingStockEntry = await prisma.stockEntry.findUnique({
      where: { id: stockEntryId },
    });

    if (!existingStockEntry) {
      return NextResponse.json({ error: 'Stock entry not found' }, { status: 404 });
    }

    // Delete the stock entry; associated stock entry items will be deleted automatically
    await prisma.stockEntry.delete({
      where: { id: stockEntryId },
    });

    return NextResponse.json({ message: 'Stock entry deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Delete Stock Entry Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

  