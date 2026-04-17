-- AlterTable
ALTER TABLE "DaeDevice" ADD COLUMN     "daeLat" DOUBLE PRECISION,
ADD COLUMN     "daeLng" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Declaration" ADD COLUMN     "adrComplement" TEXT,
ADD COLUMN     "codeInsee" TEXT;
