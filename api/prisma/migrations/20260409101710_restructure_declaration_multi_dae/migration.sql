-- ============================================================================
-- Migration: Restructure Declaration for multi-DAE + GEO DAE V15 compliance
-- ============================================================================

-- 1. Create DaeDevice table
CREATE TABLE "DaeDevice" (
    "id" TEXT NOT NULL,
    "declarationId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "nom" TEXT,
    "acc" TEXT,
    "accLib" TEXT,
    "accEtg" TEXT,
    "accComplt" TEXT,
    "accPcsec" TEXT,
    "accAcc" TEXT,
    "daeMobile" TEXT,
    "dispJ" TEXT,
    "dispH" TEXT,
    "dispComplt" TEXT,
    "etatFonct" TEXT,
    "fabRais" TEXT,
    "fabSiren" TEXT,
    "modele" TEXT,
    "numSerie" TEXT,
    "typeDAE" TEXT,
    "idEuro" TEXT,
    "dateInstal" TEXT,
    "dermnt" TEXT,
    "mntRais" TEXT,
    "mntSiren" TEXT,
    "freqMnt" TEXT,
    "dispSurv" TEXT,
    "lcPed" TEXT,
    "dtprLcped" TEXT,
    "dtprLcad" TEXT,
    "dtprBat" TEXT,
    "photo1" TEXT,
    "photo2" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DaeDevice_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DaeDevice_declarationId_idx" ON "DaeDevice"("declarationId");

ALTER TABLE "DaeDevice" ADD CONSTRAINT "DaeDevice_declarationId_fkey"
    FOREIGN KEY ("declarationId") REFERENCES "Declaration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 2. Add new columns to Declaration (exploitant + site + GPS)
ALTER TABLE "Declaration" ADD COLUMN "exptNom" TEXT;
ALTER TABLE "Declaration" ADD COLUMN "exptPrenom" TEXT;
ALTER TABLE "Declaration" ADD COLUMN "exptRais" TEXT;
ALTER TABLE "Declaration" ADD COLUMN "exptSiren" TEXT;
ALTER TABLE "Declaration" ADD COLUMN "exptSiret" TEXT;
ALTER TABLE "Declaration" ADD COLUMN "exptTel1" TEXT;
ALTER TABLE "Declaration" ADD COLUMN "exptEmail" TEXT;
ALTER TABLE "Declaration" ADD COLUMN "exptNum" TEXT;
ALTER TABLE "Declaration" ADD COLUMN "exptVoie" TEXT;
ALTER TABLE "Declaration" ADD COLUMN "exptCp" TEXT;
ALTER TABLE "Declaration" ADD COLUMN "exptCom" TEXT;
ALTER TABLE "Declaration" ADD COLUMN "adrNum" TEXT;
ALTER TABLE "Declaration" ADD COLUMN "adrVoie" TEXT;
ALTER TABLE "Declaration" ADD COLUMN "latCoor1" DOUBLE PRECISION;
ALTER TABLE "Declaration" ADD COLUMN "longCoor1" DOUBLE PRECISION;
ALTER TABLE "Declaration" ADD COLUMN "tel1" TEXT;
ALTER TABLE "Declaration" ADD COLUMN "tel2" TEXT;
ALTER TABLE "Declaration" ADD COLUMN "siteEmail" TEXT;

-- 3. Migrate existing data: map old fields to new fields on Declaration
UPDATE "Declaration" SET
    "exptNom" = "nom",
    "exptPrenom" = "prenom",
    "exptRais" = "organisme",
    "exptSiren" = "siren",
    "exptTel1" = "telephone",
    "exptEmail" = "email",
    "adrVoie" = "adresse";
-- codePostal and ville keep the same column names, no migration needed

-- 4. Migrate device data: create a DaeDevice for each existing Declaration that has device fields
INSERT INTO "DaeDevice" ("id", "declarationId", "position", "nom", "acc", "accEtg", "accComplt",
    "fabRais", "modele", "numSerie", "typeDAE", "dateInstal", "dermnt", "etatFonct",
    "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::text,
    "id",
    0,
    COALESCE("nomEtablissement", 'DAE-' || LEFT("id", 8)),
    "emplacement",
    "etage",
    "complement",
    "marque",
    "modele",
    "numeroSerie",
    "typeDAE",
    "dateInstallation",
    "dateMaintenance",
    'En fonctionnement',
    "createdAt",
    "updatedAt"
FROM "Declaration"
WHERE "marque" IS NOT NULL OR "modele" IS NOT NULL OR "numeroSerie" IS NOT NULL;

-- 5. Drop old columns from Declaration
ALTER TABLE "Declaration" DROP COLUMN "nom";
ALTER TABLE "Declaration" DROP COLUMN "prenom";
ALTER TABLE "Declaration" DROP COLUMN "email";
ALTER TABLE "Declaration" DROP COLUMN "telephone";
ALTER TABLE "Declaration" DROP COLUMN "organisme";
ALTER TABLE "Declaration" DROP COLUMN "siren";
ALTER TABLE "Declaration" DROP COLUMN "adresse";
ALTER TABLE "Declaration" DROP COLUMN "complement";
ALTER TABLE "Declaration" DROP COLUMN "emplacement";
ALTER TABLE "Declaration" DROP COLUMN "etage";
ALTER TABLE "Declaration" DROP COLUMN "marque";
ALTER TABLE "Declaration" DROP COLUMN "modele";
ALTER TABLE "Declaration" DROP COLUMN "numeroSerie";
ALTER TABLE "Declaration" DROP COLUMN "typeDAE";
ALTER TABLE "Declaration" DROP COLUMN "dateInstallation";
ALTER TABLE "Declaration" DROP COLUMN "dateMaintenance";
ALTER TABLE "Declaration" DROP COLUMN "accessibilite";
