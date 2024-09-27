// src/app/api/parties/[id]/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();



/**
 * @swagger
 * /api/parties/{id}:
 *   get:
 *     summary: Get a party by ID
 *     tags:
 *       - Parties
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The party ID.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Party retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: Party ID
 *                   example: 1
 *                 name:
 *                   type: string
 *                   description: Name of the party
 *                   example: "Party A"
 *                 shortCode:
 *                   type: string
 *                   description: Unique short code for the party
 *                   example: "PA"
 *                 partyCompanyName:
 *                   type: string
 *                   description: Company name of the party
 *                   example: "Party Company Inc."
 *                 phoneNumber:
 *                   type: string
 *                   description: Contact phone number
 *                   example: "+1234567890"
 *                 address:
 *                   type: string
 *                   description: Address of the party
 *                   example: "123 Street, City"
 *                 reference:
 *                   type: string
 *                   description: Reference information
 *                   example: "Reference Info"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: Creation timestamp
 *                   example: "2023-09-28T12:34:56Z"
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   description: Last update timestamp
 *                   example: "2023-09-29T12:34:56Z"
 *                 jobWorkRateDetails:
 *                   type: object
 *                   description: Job work rate details
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: JobWorkRateDetails ID
 *                       example: 1
 *                     printCharge1C1SP:
 *                       type: number
 *                       format: float
 *                       description: Print Charge for 1C/1SP
 *                       example: 10.5
 *                     printCharge2C:
 *                       type: number
 *                       format: float
 *                       description: Print Charge for 2C
 *                       example: 12.0
 *                     printCharge3C1SP:
 *                       type: number
 *                       format: float
 *                       description: Print Charge for 3C+1SP
 *                       example: 14.0
 *                     printCharge4C:
 *                       type: number
 *                       format: float
 *                       description: Print Charge for 4C
 *                       example: 16.0
 *                     printCharge5C:
 *                       type: number
 *                       format: float
 *                       description: Print Charge for 5C
 *                       example: 18.0
 *                     dropOffRate:
 *                       type: number
 *                       format: float
 *                       description: Drop Off Rate
 *                       example: 5.0
 *                     varnishRate:
 *                       type: number
 *                       format: float
 *                       description: Varnish Rate
 *                       example: 2.5
 *                     laminationRateSqInch:
 *                       type: number
 *                       format: float
 *                       description: Lamination Rate per square inch
 *                       example: 0.05
 *                     pateAdd:
 *                       type: number
 *                       format: float
 *                       description: Pate addition rate
 *                       example: 1.0
 *                     pateLess:
 *                       type: number
 *                       format: float
 *                       description: Pate subtraction rate
 *                       example: -1.0
 *                     minSheetsPerColorChange:
 *                       type: integer
 *                       description: Minimum sheets per color change
 *                       example: 500
 *                     microRate:
 *                       type: number
 *                       format: float
 *                       description: Micro Rate
 *                       example: 3.0
 *                     punchingRate:
 *                       type: number
 *                       format: float
 *                       description: Punching Rate
 *                       example: 4.0
 *                     uvRate:
 *                       type: number
 *                       format: float
 *                       description: UV Rate
 *                       example: 2.0
 *                     windowRate:
 *                       type: number
 *                       format: float
 *                       description: Window Rate
 *                       example: 6.0
 *                     foilRate:
 *                       type: number
 *                       format: float
 *                       description: Foil Rate
 *                       example: 7.0
 *                     scodixRate:
 *                       type: number
 *                       format: float
 *                       description: Scodix Rate
 *                       example: 8.0
 *                     pastingRate:
 *                       type: number
 *                       format: float
 *                       description: Pasting Rate
 *                       example: 2.5
 *       404:
 *         description: Party not found.
 *       500:
 *         description: Internal server error.
 */

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    try {
      const partyId = Number(params.id);
      const party = await prisma.party.findUnique({
        where: { id: partyId },
        include: {
          jobWorkRateDetails: true,
        },
      });
  
      if (!party) {
        return NextResponse.json({ error: 'Party not found' }, { status: 404 });
      }
  
      return NextResponse.json(party, { status: 200 });
    } catch (error) {
      console.error('Get Party Error:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

  
/**
 * @swagger
 * /api/parties/{id}:
 *   put:
 *     summary: Update a party
 *     tags:
 *       - Parties
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The party ID.
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
 *                 example: "Party B"
 *               shortCode:
 *                 type: string
 *                 example: "PB"
 *               partyCompanyName:
 *                 type: string
 *                 example: "Party Company B Ltd."
 *               phoneNumber:
 *                 type: string
 *                 example: "+0987654321"
 *               address:
 *                 type: string
 *                 example: "456 Avenue, City"
 *               reference:
 *                 type: string
 *                 example: "Updated Reference"
 *               jobWorkRateDetails:
 *                 type: object
 *                 description: Job work rate details
 *                 properties:
 *                   printCharge1C1SP:
 *                     type: number
 *                     format: float
 *                     description: Print Charge for 1C/1SP
 *                     example: 10.5
 *                   printCharge2C:
 *                     type: number
 *                     format: float
 *                     description: Print Charge for 2C
 *                     example: 12.0
 *                   printCharge3C1SP:
 *                     type: number
 *                     format: float
 *                     description: Print Charge for 3C+1SP
 *                     example: 14.0
 *                   printCharge4C:
 *                     type: number
 *                     format: float
 *                     description: Print Charge for 4C
 *                     example: 16.0
 *                   printCharge5C:
 *                     type: number
 *                     format: float
 *                     description: Print Charge for 5C
 *                     example: 18.0
 *                   dropOffRate:
 *                     type: number
 *                     format: float
 *                     description: Drop Off Rate
 *                     example: 5.0
 *                   varnishRate:
 *                     type: number
 *                     format: float
 *                     description: Varnish Rate
 *                     example: 2.5
 *                   laminationRateSqInch:
 *                     type: number
 *                     format: float
 *                     description: Lamination Rate per square inch
 *                     example: 0.05
 *                   pateAdd:
 *                     type: number
 *                     format: float
 *                     description: Pate addition rate
 *                     example: 1.0
 *                   pateLess:
 *                     type: number
 *                     format: float
 *                     description: Pate subtraction rate
 *                     example: -1.0
 *                   minSheetsPerColorChange:
 *                     type: integer
 *                     description: Minimum sheets per color change
 *                     example: 500
 *                   microRate:
 *                     type: number
 *                     format: float
 *                     description: Micro Rate
 *                     example: 3.0
 *                   punchingRate:
 *                     type: number
 *                     format: float
 *                     description: Punching Rate
 *                     example: 4.0
 *                   uvRate:
 *                     type: number
 *                     format: float
 *                     description: UV Rate
 *                     example: 2.0
 *                   windowRate:
 *                     type: number
 *                     format: float
 *                     description: Window Rate
 *                     example: 6.0
 *                   foilRate:
 *                     type: number
 *                     format: float
 *                     description: Foil Rate
 *                     example: 7.0
 *                   scodixRate:
 *                     type: number
 *                     format: float
 *                     description: Scodix Rate
 *                     example: 8.0
 *                   pastingRate:
 *                     type: number
 *                     format: float
 *                     description: Pasting Rate
 *                     example: 2.5
 *     responses:
 *       200:
 *         description: Party updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: Party ID
 *                   example: 1
 *                 name:
 *                   type: string
 *                   description: Updated party name
 *                   example: "Party B"
 *                 shortCode:
 *                   type: string
 *                   description: Updated short code for the party
 *                   example: "PB"
 *                 partyCompanyName:
 *                   type: string
 *                   description: Updated company name
 *                   example: "Party Company B Ltd."
 *                 phoneNumber:
 *                   type: string
 *                   description: Updated phone number
 *                   example: "+0987654321"
 *                 address:
 *                   type: string
 *                   description: Updated address
 *                   example: "456 Avenue, City"
 *                 reference:
 *                   type: string
 *                   description: Updated reference
 *                   example: "Updated Reference"
 *                 jobWorkRateDetails:
 *                   type: object
 *                   description: Updated job work rate details
 *                   properties:
 *                     printCharge1C1SP:
 *                       type: number
 *                       format: float
 *                       description: Updated print charge for 1C/1SP
 *                       example: 10.5
 *                     printCharge2C:
 *                       type: number
 *                       format: float
 *                       description: Updated print charge for 2C
 *                       example: 12.0
 *                     printCharge3C1SP:
 *                       type: number
 *                       format: float
 *                       description: Updated print charge for 3C+1SP
 *                       example: 14.0
 *       400:
 *         description: Invalid data or shortCode already exists.
 *       404:
 *         description: Party not found.
 *       500:
 *         description: Internal server error.
 */

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    try {
      const partyId = Number(params.id);
      const {
        name,
        shortCode,
        partyCompanyName,
        phoneNumber,
        address,
        reference,
        jobWorkRateDetails,
      } = await request.json();
  
      // Check if the party exists
      const existingParty = await prisma.party.findUnique({
        where: { id: partyId },
      });
  
      if (!existingParty) {
        return NextResponse.json({ error: 'Party not found' }, { status: 404 });
      }
  
      // Check if shortCode is being updated and already exists
      if (shortCode && shortCode !== existingParty.shortCode) {
        const partyWithSameShortCode = await prisma.party.findUnique({
          where: { shortCode },
        });
        if (partyWithSameShortCode) {
          return NextResponse.json(
            { error: 'Party with this shortCode already exists' },
            { status: 400 }
          );
        }
      }
  
      // Update the party and job work rate details
      const party = await prisma.party.update({
        where: { id: partyId },
        data: {
          name,
          shortCode,
          partyCompanyName,
          phoneNumber,
          address,
          reference,
          jobWorkRateDetails: jobWorkRateDetails
            ? {
                upsert: {
                  create: jobWorkRateDetails,
                  update: jobWorkRateDetails,
                },
              }
            : undefined,
        },
        include: {
          jobWorkRateDetails: true,
        },
      });
  
      return NextResponse.json(party, { status: 200 });
    } catch (error) {
      console.error('Update Party Error:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

  

/**
 * @swagger
 * /api/parties/{id}:
 *   delete:
 *     summary: Delete a party
 *     tags:
 *       - Parties
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The party ID.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Party deleted successfully.
 *       404:
 *         description: Party not found.
 *       500:
 *         description: Internal server error.
 */
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    try {
      const partyId = Number(params.id);
  
      // Check if the party exists
      const existingParty = await prisma.party.findUnique({
        where: { id: partyId },
      });
  
      if (!existingParty) {
        return NextResponse.json({ error: 'Party not found' }, { status: 404 });
      }
  
      // Delete the party; associated jobWorkRateDetails will be deleted automatically due to cascade
      await prisma.party.delete({
        where: { id: partyId },
      });
  
      return NextResponse.json(
        { message: 'Party deleted successfully' },
        { status: 200 }
      );
    } catch (error) {
      console.error('Delete Party Error:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
  