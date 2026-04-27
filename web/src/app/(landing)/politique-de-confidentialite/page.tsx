import type { Metadata } from "next";
import PolitiqueClient from "./PolitiqueClient";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Politique de confidentialité et protection des données personnelles de DéclarerDéfibrillateur.fr. Traitement RGPD et droits des utilisateurs.",
  alternates: { canonical: "/politique-de-confidentialite" },
};

export default function PolitiqueConfidentialitePage() {
  return <PolitiqueClient />;
}
