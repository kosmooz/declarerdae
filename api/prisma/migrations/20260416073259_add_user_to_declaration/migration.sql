-- AlterTable
ALTER TABLE "Declaration" ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE INDEX "Declaration_userId_idx" ON "Declaration"("userId");

-- AddForeignKey
ALTER TABLE "Declaration" ADD CONSTRAINT "Declaration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
