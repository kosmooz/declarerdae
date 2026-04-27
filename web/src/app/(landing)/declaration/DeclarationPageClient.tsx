"use client";

import DeclarationForm from "@/components/declarerdae/declaration/DeclarationForm";
import Breadcrumb from "@/components/declarerdae/Breadcrumb";
import PageHero from "@/components/declarerdae/PageHero";
import ScrollReveal from "@/components/declarerdae/ScrollReveal";
import Link from "next/link";
import { Lock } from "lucide-react";

export default function DeclarationPageClient() {
  return (
    <>
      <Breadcrumb items={[{ label: "Déclarer un DAE" }]} />
      <PageHero
        tag="Passez à l'action"
        title="Déclarez vos défibrillateurs"
        description="Remplissez le formulaire ci-dessous pour initier la déclaration de vos DAE. Déclarez un ou plusieurs défibrillateurs en une seule demande. Notre équipe prendra en charge votre dossier et vous accompagnera jusqu'à l'obtention de votre attestation de conformité."
      />

      <section className="bg-white py-10 sm:py-16">
        <div className="container">
          <ScrollReveal>
            <div className="max-w-5xl mx-auto">
              <DeclarationForm />
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="max-w-5xl mx-auto mt-6">
              <div className="alert-success rounded text-sm">
                <div className="flex items-start gap-2">
                  <Lock className="w-4 h-4 text-[#18753C] mt-0.5 shrink-0" />
                  <p className="text-[#166534] leading-relaxed">
                    <strong>Vos données sont protégées.</strong> Les informations
                    collectées sont traitées conformément au RGPD et utilisées
                    exclusivement dans le cadre de la déclaration de votre DAE
                    dans la base nationale Géo'DAE. Aucune donnée n'est partagée
                    avec des tiers.{" "}
                    <Link
                      href="/politique-de-confidentialite"
                      className="underline font-semibold"
                    >
                      Lire notre politique de confidentialité
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
