-- AlterTable: add auto-increment number and phone prefix columns
CREATE SEQUENCE "Declaration_number_seq";
ALTER TABLE "Declaration" ADD COLUMN "number" INTEGER NOT NULL DEFAULT nextval('"Declaration_number_seq"');
ALTER SEQUENCE "Declaration_number_seq" OWNED BY "Declaration"."number";

-- CreateIndex
CREATE UNIQUE INDEX "Declaration_number_key" ON "Declaration"("number");

-- Phone prefix columns
ALTER TABLE "Declaration" ADD COLUMN "exptTel1Prefix" TEXT;
ALTER TABLE "Declaration" ADD COLUMN "tel1Prefix" TEXT;
ALTER TABLE "Declaration" ADD COLUMN "tel2Prefix" TEXT;
