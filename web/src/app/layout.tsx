import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  metadataBase: new URL("https://declarerdefibrillateur.fr"),
  title: {
    default: "Déclarer Défibrillateur | Service Simplifié de Déclaration DAE en Ligne",
    template: "%s | DéclarerDéfibrillateur.fr",
  },
  description: "Déclarez votre défibrillateur automatisé externe (DAE) en ligne gratuitement. Déclaration DAE conforme au décret n°2018-1259, enregistrement Géo'DAE et attestation sous 24h.",
  openGraph: {
    title: "DéclarerDéfibrillateur.fr — Déclarez vos DAE en ligne",
    description: "Service simplifié de déclaration de défibrillateurs automatisés externes (DAE). Conforme à la réglementation française, enregistrement Géo'DAE.",
    type: "website",
    locale: "fr_FR",
    siteName: "DéclarerDéfibrillateur.fr",
  },
  twitter: {
    card: "summary_large_image",
    title: "DéclarerDéfibrillateur.fr — Déclarez vos DAE en ligne",
    description: "Service simplifié de déclaration de défibrillateurs automatisés externes (DAE).",
  },
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
