import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
/**
 * @swagger
 * /api/jobs/{id}:
 *   get:
 *     summary: Get a job by ID
 *     tags:
 *       - Jobs
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The job ID.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Job retrieved successfully.
 *       404:
 *         description: Job not found.
 *       500:
 *         description: Internal server error.
 */
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    try {
      const jobId = Number(params.id);
      const job = await prisma.job.findUnique({
        where: { id: jobId },
        include: {
          party: true,
        },
      });
  
      if (!job) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
      }
  
      return NextResponse.json(job, { status: 200 });
    } catch (error) {
      console.error('Get Job Error:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

  
/**
 * @swagger
 * /api/jobs/{id}:
 *   put:
 *     summary: Update a job by ID
 *     tags:
 *       - Jobs
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The job ID.
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
 *               jobName:
 *                 type: string
 *                 example: "Updated Job A"
 *               jobType:
 *                 type: string
 *                 example: "Updated Type A"
 *               boardSize:
 *                 type: string
 *                 example: "15x25"
 *               plateSize:
 *                 type: string
 *                 example: "10x15"
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: "new-image1.jpg"
 *               color:
 *                 type: string
 *                 enum: [1C1SP, 2C, 3C1SP, 4C, 5C, 3SP, 4SP, 2SP]
 *                 example: "2C"
 *               dripOff:
 *                 type: string
 *                 example: "Updated DripOff description"
 *               varnish:
 *                 type: string
 *                 example: "Updated Varnish description"
 *               lamination:
 *                 type: string
 *                 example: "Updated Lamination description"
 *               jobStatus:
 *                 type: string
 *                 enum: [INCOMPLETE, PENDING, ONGOING, COMPLETED]
 *                 example: "PENDING"
 *     responses:
 *       200:
 *         description: Job updated successfully.
 *       404:
 *         description: Job not found.
 *       500:
 *         description: Internal server error.
 */
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    try {
      const jobId = Number(params.id);
      const {
        jobName,
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
  
      // Check if the job exists
      const existingJob = await prisma.job.findUnique({
        where: { id: jobId },
      });
  
      if (!existingJob) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
      }
  
      // Update the job
      const updatedJob = await prisma.job.update({
        where: { id: jobId },
        data: {
          jobName,
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
          jobStatus,
        },
      });
  
      return NextResponse.json(updatedJob, { status: 200 });
    } catch (error) {
      console.error('Update Job Error:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

  

  /**
 * @swagger
 * /api/jobs/{id}:
 *   delete:
 *     summary: Delete a job by ID
 *     tags:
 *       - Jobs
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The job ID.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Job deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Job deleted successfully"
 *       404:
 *         description: Job not found.
 *       500:
 *         description: Internal server error.
 */
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    try {
      const jobId = Number(params.id);
  
      // Check if the job exists
      const existingJob = await prisma.job.findUnique({
        where: { id: jobId },
      });
  
      if (!existingJob) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
      }
  
      // Delete the job
      await prisma.job.delete({
        where: { id: jobId },
      });
  
      return NextResponse.json({ message: 'Job deleted successfully' }, { status: 200 });
    } catch (error) {
      console.error('Delete Job Error:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
  