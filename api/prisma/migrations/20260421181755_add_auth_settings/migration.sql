-- AlterTable
ALTER TABLE "ShopSettings" ADD COLUMN     "skip2FA" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "skipEmailVerification" BOOLEAN NOT NULL DEFAULT false;
