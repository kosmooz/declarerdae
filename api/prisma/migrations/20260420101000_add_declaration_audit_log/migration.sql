-- CreateTable
CREATE TABLE "DeclarationAuditLog" (
    "id" TEXT NOT NULL,
    "declarationId" TEXT NOT NULL,
    "adminId" TEXT,
    "action" TEXT NOT NULL,
    "fieldName" TEXT,
    "oldValue" TEXT,
    "newValue" TEXT,
    "deviceId" TEXT,
    "deviceName" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeclarationAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DeclarationAuditLog_declarationId_idx" ON "DeclarationAuditLog"("declarationId");

-- CreateIndex
CREATE INDEX "DeclarationAuditLog_createdAt_idx" ON "DeclarationAuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "DeclarationAuditLog" ADD CONSTRAINT "DeclarationAuditLog_declarationId_fkey" FOREIGN KEY ("declarationId") REFERENCES "Declaration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeclarationAuditLog" ADD CONSTRAINT "DeclarationAuditLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
