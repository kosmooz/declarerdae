import { notFound } from "next/navigation";

// Page désactivée — code conservé mais inaccessible (404)
export default function TrouverUnDaePage() {
  notFound();
}

/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Metadata } from "next";
import Breadcrumb from "@/components/declarerdae/Breadcrumb";
import PageHero from "@/components/declarerdae/PageHero";
import CTABanner from "@/components/declarerdae/CTABanner";
import FindDaeClient from "@/components/declarerdae/FindDaeClient";

const _metadata: Metadata = {
  title: "Trouver un défibrillateur (DAE) près de chez vous | DéclarerDéfibrillateur.fr",
  description:
    "Localisez les défibrillateurs automatisés externes (DAE) les plus proches grâce à la base nationale Géo'DAE. Recherche par géolocalisation ou adresse.",
};

function _TrouverUnDaePage() {
  return (
    <>
      <Breadcrumb items={[{ label: "Trouver un DAE" }]} />
      <PageHero
        tag="Localisation"
        title="Trouver un défibrillateur près de vous"
        description="Recherchez les défibrillateurs enregistrés dans la base nationale Géo'DAE. Utilisez la géolocalisation ou entrez une adresse pour afficher les DAE à proximité."
      />

      <FindDaeClient />

      <CTABanner
        title="Vous possédez un défibrillateur ?"
        buttonText="Déclarez-le en 5 minutes"
        href="/declaration"
        variant="primary"
      />
    </>
  );
}
