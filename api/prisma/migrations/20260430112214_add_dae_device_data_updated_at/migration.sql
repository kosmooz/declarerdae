-- Add dataUpdatedAt: tracks the last real user-data modification of a device
-- (vs structural updates like geodaeLastSync writes that bump @updatedAt).

ALTER TABLE "DaeDevice" ADD COLUMN "dataUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Backfill: best approximation is updatedAt, but cap at geodaeLastSync when sync is more recent
-- (to avoid false positives where Prisma @updatedAt was bumped by the sync write itself).
UPDATE "DaeDevice"
SET "dataUpdatedAt" = LEAST("updatedAt", COALESCE("geodaeLastSync", "updatedAt"));
