import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Déclarer Défibrillateur | Service Simplifié de Déclaration DAE en Ligne",
  description: "Déclarez votre défibrillateur automatisé externe (DAE) en ligne en moins de 5 minutes. Service conforme au décret n°2018-1259. Attestation de déclaration sous 24h.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
