// src/app/api/jobs/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

// Disable Next.js's default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

const prisma = new PrismaClient();

// Helper function to parse form data
const parseForm = (req: Request) => {
  return new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
    const form = new formidable.IncomingForm({
      multiples: true,
      uploadDir: path.join(process.cwd(), 'public', 'asset', 'job'),
      keepExtensions: true,
      filename: (name, ext, part, form) => {
        const timestamp = Date.now();
        return `${timestamp}_${part.originalFilename}`;
      },
    });

    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });
};

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
 *         multipart/form-data:
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
 *                   format: binary
 *               color:
 *                 type: string
 *                 enum: [1C1SP, 2C, 3C1SP, 4C, 5C, 3SP, 4SP, 2SP]
 *                 example: "1C1SP"
 *               dripOff:
 *                 type: string
 *                 enum: [yes, no]
 *                 example: "yes"
 *               varnish:
 *                 type: string
 *                 enum: [yes, no]
 *                 example: "no"
 *               lamination:
 *                 type: string
 *                 enum: [yes, no]
 *                 example: "yes"
 *               micro:
 *                 type: string
 *                 enum: [yes, no]
 *                 example: "no"
 *               punching:
 *                 type: string
 *                 enum: [yes, no]
 *                 example: "yes"
 *               uv:
 *                 type: string
 *                 enum: [yes, no]
 *                 example: "no"
 *               window:
 *                 type: string
 *                 enum: [yes, no]
 *                 example: "yes"
 *               foil:
 *                 type: string
 *                 enum: [yes, no]
 *                 example: "no"
 *               scodix:
 *                 type: string
 *                 enum: [yes, no]
 *                 example: "yes"
 *               pasting:
 *                 type: string
 *                 enum: [yes, no]
 *                 example: "no"
 *               totalQuantity:
 *                 type: integer
 *                 example: 1000
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
    const { fields, files } = await parseForm(request);

    const {
      jobName,
      partyId,
      jobType,
      boardSize,
      plateSize,
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
      totalQuantity,
      jobStatus,
    } = fields;

    // Validate required fields
    if (!jobName || !partyId || !jobType || !color) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Process images
    let images: string[] = [];
    if (files.images) {
      if (Array.isArray(files.images)) {
        images = files.images.map((file: any) => `/asset/job/${file.newFilename}`);
      } else {
        images = [`/asset/job/${files.images.newFilename}`];
      }
    }

    // Convert Yes/No to boolean
    const convertYesNo = (value: string | undefined) => {
      return value === 'yes';
    };

    const job = await prisma.job.create({
      data: {
        jobName: jobName as string,
        partyId: parseInt(partyId as string, 10),
        jobType: jobType as string,
        boardSize: boardSize as string,
        plateSize: plateSize as string,
        images,
        color: color as string,
        dripOff: convertYesNo(dripOff as string),
        varnish: convertYesNo(varnish as string),
        lamination: convertYesNo(lamination as string),
        micro: convertYesNo(micro as string),
        punching: convertYesNo(punching as string),
        uv: convertYesNo(uv as string),
        window: convertYesNo(window as string),
        foil: convertYesNo(foil as string),
        scodix: convertYesNo(scodix as string),
        pasting: convertYesNo(pasting as string),
        totalQuantity: totalQuantity ? parseInt(totalQuantity as string, 10) : null,
        jobStatus: jobStatus as string || 'INCOMPLETE',
      },
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error: any) {
    console.error('Create Job Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
