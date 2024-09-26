// src/app/api/stock/items/[id]/route.ts




import { NextResponse } from 'next/server';
import { PrismaClient, QuantityType, StockStatus } from '@prisma/client';

const prisma = new PrismaClient();
/**
 * @swagger
 * /api/stock/items/{id}:
 *   get:
 *     summary: Get a stock item by ID
 *     tags:
 *       - Stock Items
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The stock item ID.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Stock item retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StockItem'
 *       404:
 *         description: Stock item not found.
 *       500:
 *         description: Internal server error.
 */

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const stockItemId = Number(params.id);
    const stockItem = await prisma.stockItem.findUnique({
      where: { id: stockItemId },
      include: {
        stockType: true,
      },
    });

    if (!stockItem) {
      return NextResponse.json({ error: 'Stock item not found' }, { status: 404 });
    }

    return NextResponse.json(stockItem, { status: 200 });
  } catch (error) {
    console.error('Get Stock Item Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}





/**
 * @swagger
 * /api/stock/items/{id}:
 *   put:
 *     summary: Update a stock item
 *     description: Update an existing stock item by its ID.
 *     tags:
 *       - Stock Items
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the stock item to update.
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
 *                 description: The new name of the stock item.
 *                 example: "Updated Item Name"
 *               image:
 *                 type: string
 *                 description: The new image URL of the stock item.
 *                 example: "https://example.com/new-image.jpg"
 *               stockTypeId:
 *                 type: integer
 *                 description: The ID of the stock type to associate with this item.
 *                 example: 2
 *               quantityType:
 *                 type: string
 *                 enum: [GROSS, PACKET, WEIGHT]
 *                 description: The quantity type.
 *                 example: "PACKET"
 *               totalQuantity:
 *                 type: integer
 *                 description: Total quantity of the item.
 *                 example: 150
 *               totalWeight:
 *                 type: number
 *                 description: Total weight of the item.
 *                 example: 75.5
 *               finalAmount:
 *                 type: number
 *                 description: Final amount for the item.
 *                 example: 7500.0
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, CONSUMED]
 *                 description: The status of the stock item.
 *                 example: "CONSUMED"
 *     responses:
 *       200:
 *         description: Stock item updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StockItem'
 *       400:
 *         description: Missing required fields or invalid data.
 *       404:
 *         description: Stock item or stock type not found.
 *       500:
 *         description: Internal server error.
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const stockItemId = Number(params.id);
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

    // Check if the stock item exists
    const existingStockItem = await prisma.stockItem.findUnique({
      where: { id: stockItemId },
    });
    if (!existingStockItem) {
      return NextResponse.json({ error: 'Stock item not found' }, { status: 404 });
    }

    // Prepare data for update
    const updateData: any = {};

    if (name) updateData.name = name;
    if (image !== undefined) updateData.image = image;
    if (stockTypeId) {
      // Check if the stock type exists
      const stockType = await prisma.stockType.findUnique({
        where: { id: stockTypeId },
      });
      if (!stockType) {
        return NextResponse.json({ error: 'Stock type not found' }, { status: 404 });
      }
      updateData.stockTypeId = stockTypeId;
    }
    if (quantityType) {
      if (!(quantityType in QuantityType)) {
        return NextResponse.json({ error: 'Invalid quantityType' }, { status: 400 });
      }
      updateData.quantityType = quantityType;
    }
    if (totalQuantity !== undefined) updateData.totalQuantity = totalQuantity;
    if (totalWeight !== undefined) updateData.totalWeight = totalWeight;
    if (finalAmount !== undefined) updateData.finalAmount = finalAmount;
    if (status) {
      if (!(status in StockStatus)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      updateData.status = status;
    }

    const stockItem = await prisma.stockItem.update({
      where: { id: stockItemId },
      data: updateData,
    });

    return NextResponse.json(stockItem, { status: 200 });
  } catch (error) {
    console.error('Update Stock Item Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

  

/**
 * @swagger
 * /api/stock/items/{id}:
 *   delete:
 *     summary: Delete a stock item
 *     description: Delete a specific stock item by its ID.
 *     tags:
 *       - Stock Items
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the stock item to delete.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Stock item deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Stock item deleted successfully"
 *       404:
 *         description: Stock item not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Stock item not found"
 *       500:
 *         description: Internal server error.
 */

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    try {
      const stockItemId = Number(params.id);
  
      await prisma.stockItem.delete({
        where: { id: stockItemId },
      });
  
      return NextResponse.json(
        { message: 'Stock item deleted successfully' },
        { status: 200 }
      );
    } catch (error) {
      console.error('Delete Stock Item Error:', error);
  
      if (error.code === 'P2025') {
        // Prisma error code for record not found
        return NextResponse.json({ error: 'Stock item not found' }, { status: 404 });
      }
  
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }
  }
  