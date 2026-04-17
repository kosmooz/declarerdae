-- CreateEnum
CREATE TYPE "DeclarationStatus" AS ENUM ('DRAFT', 'COMPLETE', 'VALIDATED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Declaration" (
    "id" TEXT NOT NULL,
    "nom" TEXT,
    "prenom" TEXT,
    "email" TEXT,
    "telephone" TEXT,
    "organisme" TEXT,
    "siren" TEXT,
    "nomEtablissement" TEXT,
    "typeERP" TEXT,
    "categorieERP" TEXT,
    "adresse" TEXT,
    "codePostal" TEXT,
    "ville" TEXT,
    "complement" TEXT,
    "emplacement" TEXT,
    "etage" TEXT,
    "marque" TEXT,
    "modele" TEXT,
    "numeroSerie" TEXT,
    "typeDAE" TEXT,
    "dateInstallation" TEXT,
    "dateMaintenance" TEXT,
    "accessibilite" TEXT,
    "ip" TEXT,
    "status" "DeclarationStatus" NOT NULL DEFAULT 'DRAFT',
    "step" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Declaration_pkey" PRIMARY KEY ("id")
);
