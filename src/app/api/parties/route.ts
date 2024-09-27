// src/app/api/parties/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();



/**
 * @swagger
 * /api/parties:
 *   post:
 *     summary: Create a new party
 *     tags:
 *       - Parties
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - shortCode
 *               - phoneNumber
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the party
 *                 example: "Party A"
 *               shortCode:
 *                 type: string
 *                 description: Unique short code for the party
 *                 example: "PA"
 *               partyCompanyName:
 *                 type: string
 *                 description: Company name of the party
 *                 example: "Party Company Inc."
 *               phoneNumber:
 *                 type: string
 *                 description: Contact phone number
 *                 example: "+1234567890"
 *               address:
 *                 type: string
 *                 description: Address of the party
 *                 example: "123 Street, City"
 *               reference:
 *                 type: string
 *                 description: Reference information
 *                 example: "Reference Info"
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
 *                   printCharge3SP:
 *                     type: number
 *                     format: float
 *                     description: Print Charge for 3SP
 *                     example: 20.0
 *                   printCharge4SP:
 *                     type: number
 *                     format: float
 *                     description: Print Charge for 4SP
 *                     example: 22.0
 *                   printCharge2SP:
 *                     type: number
 *                     format: float
 *                     description: Print Charge for 2SP
 *                     example: 24.0
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
 *       201:
 *         description: Party created successfully.
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
 *                     partyId:
 *                       type: integer
 *                       description: Associated Party ID
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
 *                     printCharge3SP:
 *                       type: number
 *                       format: float
 *                       description: Print Charge for 3SP
 *                       example: 20.0
 *                     printCharge4SP:
 *                       type: number
 *                       format: float
 *                       description: Print Charge for 4SP
 *                       example: 22.0
 *                     printCharge2SP:
 *                       type: number
 *                       format: float
 *                       description: Print Charge for 2SP
 *                       example: 24.0
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
 *       400:
 *         description: Missing required fields or invalid data.
 *       500:
 *         description: Internal server error.
 */

export async function POST(request: Request) {
    try {
      const {
        name,
        shortCode,
        partyCompanyName,
        phoneNumber,
        address,
        reference,
        jobWorkRateDetails,
      } = await request.json();
  
      // Validate required fields
      if (!name || !shortCode || !phoneNumber) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }
  
      // Check if shortCode already exists
      const existingParty = await prisma.party.findUnique({
        where: { shortCode },
      });
      if (existingParty) {
        return NextResponse.json(
          { error: 'Party with this shortCode already exists' },
          { status: 400 }
        );
      }
  
      // Create the party
      const party = await prisma.party.create({
        data: {
          name,
          shortCode,
          partyCompanyName,
          phoneNumber,
          address,
          reference,
          jobWorkRateDetails: jobWorkRateDetails
            ? {
                create: jobWorkRateDetails,
              }
            : undefined,
        },
        include: {
          jobWorkRateDetails: true,
        },
      });
  
      return NextResponse.json(party, { status: 201 });
    } catch (error) {
      console.error('Create Party Error:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

  
 /**
 * @swagger
 * /api/parties:
 *   get:
 *     summary: Get all parties
 *     tags:
 *       - Parties
 *     responses:
 *       200:
 *         description: A list of parties.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: Party ID
 *                     example: 1
 *                   name:
 *                     type: string
 *                     description: Name of the party
 *                     example: "Party A"
 *                   shortCode:
 *                     type: string
 *                     description: Unique short code for the party
 *                     example: "PA"
 *                   partyCompanyName:
 *                     type: string
 *                     description: Company name of the party
 *                     example: "Party Company Inc."
 *                   phoneNumber:
 *                     type: string
 *                     description: Contact phone number
 *                     example: "+1234567890"
 *                   address:
 *                     type: string
 *                     description: Address of the party
 *                     example: "123 Street, City"
 *                   reference:
 *                     type: string
 *                     description: Reference information
 *                     example: "Reference Info"
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     description: Creation timestamp
 *                     example: "2023-09-28T12:34:56Z"
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     description: Last update timestamp
 *                     example: "2023-09-29T12:34:56Z"
 *                   jobWorkRateDetails:
 *                     type: object
 *                     description: Job work rate details
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: JobWorkRateDetails ID
 *                         example: 1
 *                       partyId:
 *                         type: integer
 *                         description: Associated Party ID
 *                         example: 1
 *                       printCharge1C1SP:
 *                         type: number
 *                         format: float
 *                         description: Print Charge for 1C/1SP
 *                         example: 10.5
 *                       printCharge2C:
 *                         type: number
 *                         format: float
 *                         description: Print Charge for 2C
 *                         example: 12.0
 *                       printCharge3C1SP:
 *                         type: number
 *                         format: float
 *                         description: Print Charge for 3C+1SP
 *                         example: 14.0
 *                       printCharge4C:
 *                         type: number
 *                         format: float
 *                         description: Print Charge for 4C
 *                         example: 16.0
 *                       printCharge5C:
 *                         type: number
 *                         format: float
 *                         description: Print Charge for 5C
 *                         example: 18.0
 *                       printCharge3SP:
 *                         type: number
 *                         format: float
 *                         description: Print Charge for 3SP
 *                         example: 20.0
 *                       printCharge4SP:
 *                         type: number
 *                         format: float
 *                         description: Print Charge for 4SP
 *                         example: 22.0
 *                       printCharge2SP:
 *                         type: number
 *                         format: float
 *                         description: Print Charge for 2SP
 *                         example: 24.0
 *                       dropOffRate:
 *                         type: number
 *                         format: float
 *                         description: Drop Off Rate
 *                         example: 5.0
 *                       varnishRate:
 *                         type: number
 *                         format: float
 *                         description: Varnish Rate
 *                         example: 2.5
 *                       laminationRateSqInch:
 *                         type: number
 *                         format: float
 *                         description: Lamination Rate per square inch
 *                         example: 0.05
 *                       pateAdd:
 *                         type: number
 *                         format: float
 *                         description: Pate addition rate
 *                         example: 1.0
 *                       pateLess:
 *                         type: number
 *                         format: float
 *                         description: Pate subtraction rate
 *                         example: -1.0
 *                       minSheetsPerColorChange:
 *                         type: integer
 *                         description: Minimum sheets per color change
 *                         example: 500
 *                       microRate:
 *                         type: number
 *                         format: float
 *                         description: Micro Rate
 *                         example: 3.0
 *                       punchingRate:
 *                         type: number
 *                         format: float
 *                         description: Punching Rate
 *                         example: 4.0
 *                       uvRate:
 *                         type: number
 *                         format: float
 *                         description: UV Rate
 *                         example: 2.0
 *                       windowRate:
 *                         type: number
 *                         format: float
 *                         description: Window Rate
 *                         example: 6.0
 *                       foilRate:
 *                         type: number
 *                         format: float
 *                         description: Foil Rate
 *                         example: 7.0
 *                       scodixRate:
 *                         type: number
 *                         format: float
 *                         description: Scodix Rate
 *                         example: 8.0
 *                       pastingRate:
 *                         type: number
 *                         format: float
 *                         description: Pasting Rate
 *                         example: 2.5
 *       500:
 *         description: Internal server error.
 */
export async function GET() {
    try {
      const parties = await prisma.party.findMany({
        include: {
          jobWorkRateDetails: true,
        },
      });
      return NextResponse.json(parties, { status: 200 });
    } catch (error) {
      console.error('Get Parties Error:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
  