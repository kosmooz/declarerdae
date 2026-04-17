-- AlterTable
ALTER TABLE "ShopSettings" ADD COLUMN     "dpoAddress" TEXT,
ADD COLUMN     "dpoEmail" TEXT,
ADD COLUMN     "dpoName" TEXT,
ADD COLUMN     "dpoPhone" TEXT;

-- CreateTable
CREATE TABLE "Consent" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "userId" TEXT,
    "scope" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "granted" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Consent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Consent_email_idx" ON "Consent"("email");

-- CreateIndex
CREATE INDEX "Consent_scope_idx" ON "Consent"("scope");

-- AddForeignKey
ALTER TABLE "Consent" ADD CONSTRAINT "Consent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
