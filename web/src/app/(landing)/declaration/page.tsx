import type { Metadata } from "next";
import DeclarationPageClient from "./DeclarationPageClient";

export const metadata: Metadata = {
  title: "Déclarer un défibrillateur (DAE) en ligne",
  description:
    "Remplissez le formulaire de déclaration de votre défibrillateur automatisé externe. Déclaration conforme, enregistrement Géo'DAE et attestation de conformité.",
  alternates: { canonical: "/declaration" },
};

export default function DeclarationPage() {
  return <DeclarationPageClient />;
}
