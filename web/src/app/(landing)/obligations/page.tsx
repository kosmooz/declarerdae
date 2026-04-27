import type { Metadata } from "next";
import Breadcrumb from "@/components/declarerdae/Breadcrumb";

export const metadata: Metadata = {
  title: "Obligations légales — Déclaration DAE obligatoire",
  description: "Cadre réglementaire complet de la déclaration des défibrillateurs automatisés externes (DAE). Loi 2018-527, décrets, arrêtés et sanctions applicables.",
  alternates: { canonical: "/obligations" },
};
import PageHero from "@/components/declarerdae/PageHero";
import CTABanner from "@/components/declarerdae/CTABanner";
import ScrollReveal from "@/components/declarerdae/ScrollReveal";
import { AlertTriangle, ArrowRight, BookOpen, CheckCircle2, FileCheck, Gavel, Landmark, Scale, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ObligationsPage() {
  return (
    <>
      <Breadcrumb items={[{ label: "Obligations légales" }]} />
      <PageHero
        tag="Cadre réglementaire"
        title="Obligations légales relatives aux défibrillateurs automatisés externes"
        description="Tout ce que vous devez savoir sur vos obligations en tant qu'exploitant de DAE : déclaration, maintenance et signalétique."
      />

      <main>
        {/* Introduction */}
        <section className="bg-white py-12">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <ScrollReveal>
                <div className="prose prose-sm max-w-none">
                  <p className="text-base text-[#3A3A3A] leading-relaxed mb-4">
                    La législation française a considérablement évolué ces dernières années pour encadrer l'installation, la maintenance et la déclaration des défibrillateurs automatisés externes (DAE). L'objectif est clair : améliorer la prise en charge des arrêts cardiaques soudains en rendant les DAE accessibles, localisables et fonctionnels sur l'ensemble du territoire.
                  </p>
                  <p className="text-base text-[#3A3A3A] leading-relaxed mb-4">
                    Depuis la loi n°2018-527 du 28 juin 2018, complétée par les décrets d'application de décembre 2018 et l'arrêté du 29 octobre 2019, les exploitants de DAE sont soumis à trois obligations principales. Le non-respect de ces obligations engage la responsabilité civile et pénale de l'exploitant.
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Obligation 1 : Déclaration */}
        <section className="bg-[#F6F6F6] py-12">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <ScrollReveal>
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex items-center justify-center w-12 h-12 rounded bg-[#FEF3F2] shrink-0">
                    <FileCheck className="w-6 h-6 text-[#E1000F]" />
                  </div>
                  <div>
                    <h2 className="font-heading font-bold text-xl text-[#161616] mb-1">
                      1. Obligation de déclaration
                    </h2>
                    <p className="text-sm text-[#929292]">Décret n°2018-1259 du 27 décembre 2018 — Arrêté du 29 octobre 2019</p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div className="space-y-4 text-sm text-[#3A3A3A] leading-relaxed">
                  <p>
                    Tout exploitant d'un défibrillateur automatisé externe (DAE) a l'obligation de déclarer les données d'implantation et d'accessibilité de son appareil dans la <strong>base de données nationale Géo'DAE</strong>, gérée par la Direction générale de la santé (DGS) du Ministère de la Santé.
                  </p>
                  <p>
                    Cette déclaration doit contenir les informations suivantes :
                  </p>
                  <div className="bg-white border border-[#E5E5E5] rounded p-3 sm:p-5">
                    <h3 className="font-heading font-semibold text-base text-[#161616] mb-3">Informations obligatoires à déclarer</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        "Identité et coordonnées de l'exploitant",
                        "Adresse d'implantation du DAE",
                        "Coordonnées géographiques (latitude/longitude)",
                        "Marque et modèle du DAE",
                        "Numéro de série de l'appareil",
                        "Date d'installation",
                        "Conditions d'accessibilité (24h/24, horaires...)",
                        "Localisation précise (intérieur/extérieur)",
                        "Date de dernière maintenance",
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#18753C] mt-0.5 shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p>
                    La déclaration doit être effectuée dans un <strong>délai raisonnable</strong> après l'installation du DAE. Toute modification des informations déclarées (changement d'adresse, remplacement de l'appareil, mise hors service) doit également être signalée.
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Obligation 2 : Maintenance */}
        <section className="bg-white py-12">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <ScrollReveal>
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex items-center justify-center w-12 h-12 rounded bg-[#EFF6FF] shrink-0">
                    <Shield className="w-6 h-6 text-[#000091]" />
                  </div>
                  <div>
                    <h2 className="font-heading font-bold text-xl text-[#161616] mb-1">
                      2. Obligation de maintenance
                    </h2>
                    <p className="text-sm text-[#929292]">Article R.5212-25 du Code de la santé publique</p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div className="space-y-4 text-sm text-[#3A3A3A] leading-relaxed">
                  <p>
                    Le défibrillateur automatisé externe est un <strong>dispositif médical de classe IIb</strong> soumis à une obligation de maintenance régulière. L'exploitant est responsable de la maintenance de son appareil et doit s'assurer de son bon fonctionnement en permanence.
                  </p>
                  <p>
                    La maintenance comprend notamment :
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { title: "Vérification visuelle régulière", desc: "Contrôle de l'état général de l'appareil, du boîtier, des voyants lumineux et de l'absence de dommages." },
                      { title: "Contrôle des électrodes", desc: "Vérification de la date de péremption des électrodes et remplacement si nécessaire." },
                      { title: "Contrôle de la batterie", desc: "Vérification du niveau de charge de la batterie et remplacement selon les préconisations du fabricant." },
                      { title: "Maintenance préventive", desc: "Opérations de maintenance conformes aux recommandations du fabricant, incluant les mises à jour logicielles." },
                    ].map((item, i) => (
                      <div key={i} className="bg-[#EFF6FF] border border-[#BFDBFE] rounded p-4">
                        <h4 className="font-heading font-semibold text-sm text-[#000091] mb-1">{item.title}</h4>
                        <p className="text-xs text-[#3A3A3A]">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                  <p>
                    L'exploitant doit tenir un <strong>registre de maintenance</strong> à jour et conserver les preuves des opérations effectuées. La date de dernière maintenance doit être déclarée dans la base Géo'DAE.
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>


        {/* Obligation 3 : Signalétique */}
        <section className="bg-[#F6F6F6] py-12">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <ScrollReveal>
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex items-center justify-center w-12 h-12 rounded bg-[#FEF9C3] shrink-0">
                    <BookOpen className="w-6 h-6 text-[#92400E]" />
                  </div>
                  <div>
                    <h2 className="font-heading font-bold text-xl text-[#161616] mb-1">
                      3. Obligation de signalétique
                    </h2>
                    <p className="text-sm text-[#929292]">Arrêté du 16 août 2010 — Norme NF EN ISO 7010</p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div className="space-y-4 text-sm text-[#3A3A3A] leading-relaxed">
                  <p>
                    Une signalétique normalisée doit être apposée sur le boîtier ou à proximité immédiate du DAE. Cette signalétique a pour objectif de rendre le défibrillateur <strong>facilement identifiable et accessible</strong> par toute personne en situation d'urgence.
                  </p>
                  <p>
                    La signalétique doit respecter les normes suivantes :
                  </p>
                  <div className="bg-[#FEF9C3] border border-[#FDE68A] rounded p-3 sm:p-5">
                    <ul className="space-y-2">
                      {[
                        "Pictogramme conforme à la norme NF EN ISO 7010 (cœur vert avec éclair blanc)",
                        "Indication claire de l'emplacement du DAE (flèches directionnelles si nécessaire)",
                        "Mention \"Défibrillateur automatisé externe\" lisible",
                        "Instructions d'utilisation simplifiées à proximité",
                        "Numéro d'urgence (15 ou 112) visible",
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#92400E] mt-0.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Sanctions */}
        <section className="bg-[#FEF3F2] py-12">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <ScrollReveal>
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex items-center justify-center w-12 h-12 rounded bg-white shrink-0">
                    <Scale className="w-6 h-6 text-[#E1000F]" />
                  </div>
                  <h2 className="font-heading font-bold text-xl text-[#161616]">
                    Sanctions en cas de non-conformité
                  </h2>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div className="space-y-4 text-sm text-[#3A3A3A] leading-relaxed">
                  <p>
                    Le non-respect des obligations relatives aux DAE expose l'exploitant à des sanctions significatives :
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white border border-[#FECACA] rounded p-4 text-center">
                      <p className="font-heading font-bold text-lg text-[#E1000F] mb-1">Administratif</p>
                      <p className="text-xs text-[#666]">Mise en demeure, fermeture administrative temporaire ou définitive</p>
                    </div>
                    <div className="bg-white border border-[#FECACA] rounded p-4 text-center">
                      <p className="font-heading font-bold text-lg text-[#E1000F] mb-1">150 000 €</p>
                      <p className="text-xs text-[#666]">Défaut de maintenance (2 ans + 150 000 €, art. L.5461-5 CSP)</p>
                    </div>
                    <div className="bg-white border border-[#FECACA] rounded p-4 text-center">
                      <p className="font-heading font-bold text-lg text-[#E1000F] mb-1">Pénal</p>
                      <p className="text-xs text-[#666]">Homicide involontaire : 3 ans + 45 000 € (5 ans + 75 000 € si violation délibérée)</p>
                    </div>
                  </div>
                  <div className="alert-danger rounded mt-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-[#E1000F] mt-0.5 shrink-0" />
                      <p className="text-sm text-[#7F1D1D]">
                        En cas d'arrêt cardiaque mortel dans un établissement non équipé ou dont le DAE n'est pas déclaré et localisable, la responsabilité pénale du chef d'établissement peut être engagée pour <strong>mise en danger de la vie d'autrui</strong> (article 223-1 du Code pénal).
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* CTA */}
        <CTABanner
          title="Mettez-vous en conformité dès maintenant"
          subtitle="Déclaration simplifiée en 5 minutes — Attestation sous 24h"
          buttonText="Déclarer mon DAE"
          href="/declaration"
          variant="primary"
        />
      </main>
    </>
  );
}