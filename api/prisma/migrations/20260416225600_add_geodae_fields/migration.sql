-- AlterTable
ALTER TABLE "DaeDevice" ADD COLUMN     "geodaeGid" INTEGER,
ADD COLUMN     "geodaeStatus" TEXT,
ADD COLUMN     "geodaeLastSync" TIMESTAMP(3),
ADD COLUMN     "geodaeLastError" TEXT;

-- AlterTable
ALTER TABLE "ShopSettings" ADD COLUMN     "geodaeUsername" TEXT,
ADD COLUMN     "geodaePassword" TEXT,
ADD COLUMN     "geodaeEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "geodaeTestMode" BOOLEAN NOT NULL DEFAULT true;
