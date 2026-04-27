import type { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez l'équipe DéclarerDéfibrillateur.fr pour toute question sur la déclaration de vos DAE, la réglementation ou nos services.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return <ContactClient />;
}
