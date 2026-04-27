import type { Metadata } from "next";
import DefibrillatorClient from "./DefibrillatorClient";

export const metadata: Metadata = {
  title: "Défibrillateur automatisé externe (DAE)",
  description:
    "Découvrez notre solution complète de défibrillateur automatisé externe. Installation, maintenance et déclaration conforme à la réglementation.",
  alternates: { canonical: "/defibrillateur" },
};

export default function DefibrillateurPage() {
  return <DefibrillatorClient />;
}
