-- Add dataUpdatedAt: tracks the last real user-data modification (vs structural updates).
-- Used by the frontend's per-device `needsResync` check.

-- AlterTable
ALTER TABLE "Declaration" ADD COLUMN "dataUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Backfill existing rows: align with updatedAt (best available approximation).
UPDATE "Declaration" SET "dataUpdatedAt" = "updatedAt";
