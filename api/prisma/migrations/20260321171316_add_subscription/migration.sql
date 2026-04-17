-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('DRAFT', 'PENDING_SIGNATURE', 'SIGNED', 'ACTIVE', 'CANCELLED');

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "entityType" TEXT NOT NULL,
    "companyName" TEXT,
    "siret" TEXT,
    "companyAddress" TEXT,
    "companyPostalCode" TEXT,
    "companyCity" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "fonction" TEXT,
    "mobile" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "installAddress" TEXT NOT NULL,
    "installPostalCode" TEXT NOT NULL,
    "installCity" TEXT NOT NULL,
    "monthlyPriceHT" DECIMAL(65,30) NOT NULL,
    "monthlyPriceTTC" DECIMAL(65,30) NOT NULL,
    "signatureRequestId" TEXT,
    "signerId" TEXT,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'DRAFT',
    "signedAt" TIMESTAMP(3),
    "contractPdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);
