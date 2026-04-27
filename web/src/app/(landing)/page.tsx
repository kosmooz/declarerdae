import type { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "Déclarer Défibrillateur | Service Simplifié de Déclaration DAE en Ligne",
  description:
    "Déclarez votre défibrillateur automatisé externe (DAE) en ligne gratuitement. Service conforme au décret n°2018-1259, enregistrement Géo'DAE et attestation sous 24h.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return <HomeClient />;
}
