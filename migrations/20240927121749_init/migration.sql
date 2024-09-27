-- CreateEnum
CREATE TYPE "PrintChargeCategory" AS ENUM ('printCharge1C1SP', 'printCharge2C', 'printCharge3C1SP', 'printCharge4C', 'printCharge5C', 'printCharge3SP', 'printCharge4SP', 'printCharge2SP');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('INCOMPLETE', 'PENDING', 'ONGOING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'STAFF');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LEAVE');

-- CreateEnum
CREATE TYPE "QuantityType" AS ENUM ('GROSS', 'PACKET', 'WEIGHT');

-- CreateEnum
CREATE TYPE "StockStatus" AS ENUM ('ACTIVE', 'CONSUMED');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STAFF',
    "permissions" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STAFF',
    "startDate" TIMESTAMP(3) NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "salary" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "checkIn" TIMESTAMP(3),
    "checkOut" TIMESTAMP(3),
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "StockType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockItem" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "stockTypeId" INTEGER NOT NULL,
    "quantityType" "QuantityType" NOT NULL,
    "totalQuantity" INTEGER NOT NULL,
    "totalWeight" DOUBLE PRECISION,
    "finalAmount" DOUBLE PRECISION NOT NULL,
    "status" "StockStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockEntry" (
    "id" SERIAL NOT NULL,
    "partyName" TEXT NOT NULL,
    "dateReceived" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockEntryItem" (
    "id" SERIAL NOT NULL,
    "stockEntryId" INTEGER NOT NULL,
    "stockItemId" INTEGER NOT NULL,

    CONSTRAINT "StockEntryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobWorkRateDetails" (
    "id" SERIAL NOT NULL,
    "partyId" INTEGER NOT NULL,
    "printCharge1C1SP" DOUBLE PRECISION,
    "printCharge2C" DOUBLE PRECISION,
    "printCharge3C1SP" DOUBLE PRECISION,
    "printCharge4C" DOUBLE PRECISION,
    "printCharge5C" DOUBLE PRECISION,
    "printCharge3SP" DOUBLE PRECISION,
    "printCharge4SP" DOUBLE PRECISION,
    "printCharge2SP" DOUBLE PRECISION,
    "dropOffRate" DOUBLE PRECISION,
    "varnishRate" DOUBLE PRECISION,
    "laminationRateSqInch" DOUBLE PRECISION,
    "pateAdd" DOUBLE PRECISION,
    "pateLess" DOUBLE PRECISION,
    "minSheetsPerColorChange" INTEGER,
    "microRate" DOUBLE PRECISION,
    "punchingRate" DOUBLE PRECISION,
    "uvRate" DOUBLE PRECISION,
    "windowRate" DOUBLE PRECISION,
    "foilRate" DOUBLE PRECISION,
    "scodixRate" DOUBLE PRECISION,
    "pastingRate" DOUBLE PRECISION,

    CONSTRAINT "JobWorkRateDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Party" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "shortCode" TEXT NOT NULL,
    "partyCompanyName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "address" TEXT,
    "reference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Party_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" SERIAL NOT NULL,
    "jobName" TEXT NOT NULL,
    "partyId" INTEGER NOT NULL,
    "jobType" TEXT NOT NULL,
    "boardSize" TEXT NOT NULL,
    "plateSize" TEXT NOT NULL,
    "images" TEXT[],
    "color" "PrintChargeCategory" NOT NULL,
    "dripOff" TEXT,
    "varnish" TEXT,
    "lamination" TEXT,
    "micro" TEXT,
    "punching" TEXT,
    "uv" TEXT,
    "window" TEXT,
    "foil" TEXT,
    "scodix" TEXT,
    "pasting" TEXT,
    "jobStatus" "JobStatus" NOT NULL DEFAULT 'INCOMPLETE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_userId_key" ON "Employee"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StockType_name_key" ON "StockType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "JobWorkRateDetails_partyId_key" ON "JobWorkRateDetails"("partyId");

-- CreateIndex
CREATE UNIQUE INDEX "Party_shortCode_key" ON "Party"("shortCode");

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockItem" ADD CONSTRAINT "StockItem_stockTypeId_fkey" FOREIGN KEY ("stockTypeId") REFERENCES "StockType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockEntryItem" ADD CONSTRAINT "StockEntryItem_stockEntryId_fkey" FOREIGN KEY ("stockEntryId") REFERENCES "StockEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockEntryItem" ADD CONSTRAINT "StockEntryItem_stockItemId_fkey" FOREIGN KEY ("stockItemId") REFERENCES "StockItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobWorkRateDetails" ADD CONSTRAINT "JobWorkRateDetails_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE CASCADE ON UPDATE CASCADE;
