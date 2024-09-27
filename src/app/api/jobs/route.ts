import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
/**
 * @swagger
 * /api/jobs:
 *   post:
 *     summary: Create a new job
 *     tags:
 *       - Jobs
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - jobName
 *               - partyId
 *               - jobType
 *               - color
 *             properties:
 *               jobName:
 *                 type: string
 *                 example: "Job A"
 *               partyId:
 *                 type: integer
 *                 example: 1
 *               jobType:
 *                 type: string
 *                 example: "Type A"
 *               boardSize:
 *                 type: string
 *                 example: "10x20"
 *               plateSize:
 *                 type: string
 *                 example: "5x10"
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: "image1.jpg"
 *               color:
 *                 type: string
 *                 enum: [1C1SP, 2C, 3C1SP, 4C, 5C, 3SP, 4SP, 2SP]
 *                 example: "1C1SP"
 *               dripOff:
 *                 type: string
 *                 example: "DripOff description"
 *               varnish:
 *                 type: string
 *                 example: "Varnish description"
 *               lamination:
 *                 type: string
 *                 example: "Lamination description"
 *               micro:
 *                 type: string
 *                 example: "Micro description"
 *               punching:
 *                 type: string
 *                 example: "Punching description"
 *               uv:
 *                 type: string
 *                 example: "UV description"
 *               window:
 *                 type: string
 *                 example: "Window description"
 *               foil:
 *                 type: string
 *                 example: "Foil description"
 *               scodix:
 *                 type: string
 *                 example: "Scodix description"
 *               pasting:
 *                 type: string
 *                 example: "Pasting description"
 *               jobStatus:
 *                 type: string
 *                 enum: [INCOMPLETE, PENDING, ONGOING, COMPLETED]
 *                 example: "INCOMPLETE"
 *     responses:
 *       201:
 *         description: Job created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 jobName:
 *                   type: string
 *                   example: "Job A"
 *                 jobType:
 *                   type: string
 *                   example: "Type A"
 *                 color:
 *                   type: string
 *                   example: "1C1SP"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2023-09-24T12:34:56Z"
 *       400:
 *         description: Missing required fields.
 *       500:
 *         description: Internal server error.
 */
export async function POST(request: Request) {
    try {
      const {
        jobName,
        partyId,
        jobType,
        boardSize,
        plateSize,
        images,
        color,
        dripOff,
        varnish,
        lamination,
        micro,
        punching,
        uv,
        window,
        foil,
        scodix,
        pasting,
        jobStatus
      } = await request.json();
  
      // Validate required fields
      if (!jobName || !partyId || !jobType || !color) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }
  
      const job = await prisma.job.create({
        data: {
          jobName,
          partyId,
          jobType,
          boardSize,
          plateSize,
          images,
          color,
          dripOff,
          varnish,
          lamination,
          micro,
          punching,
          uv,
          window,
          foil,
          scodix,
          pasting,
          jobStatus: jobStatus || 'INCOMPLETE',
        },
      });
  
      return NextResponse.json(job, { status: 201 });
    } catch (error) {
      console.error('Create Job Error:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
  

/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: Get all jobs
 *     tags:
 *       - Jobs
 *     responses:
 *       200:
 *         description: A list of jobs.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   jobName:
 *                     type: string
 *                     example: "Job A"
 *                   partyId:
 *                     type: integer
 *                     example: 1
 *                   jobType:
 *                     type: string
 *                     example: "Type A"
 *                   color:
 *                     type: string
 *                     enum: [1C1SP, 2C, 3C1SP, 4C, 5C, 3SP, 4SP, 2SP]
 *                     example: "1C1SP"
 *                   jobStatus:
 *                     type: string
 *                     enum: [INCOMPLETE, PENDING, ONGOING, COMPLETED]
 *                     example: "ONGOING"
 *       500:
 *         description: Internal server error.
 */
export async function GET() {
    try {
      const jobs = await prisma.job.findMany({
        include: {
          party: true, // Including the party details
        },
      });
      return NextResponse.json(jobs, { status: 200 });
    } catch (error) {
      console.error('Get Jobs Error:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
  