import type { Metadata } from "next";
import Breadcrumb from "@/components/declarerdae/Breadcrumb";

export const metadata: Metadata = {
  title: "Tarifs — Déclaration DAE gratuite",
  description: "Déclarez vos défibrillateurs gratuitement sur DéclarerDéfibrillateur.fr. Service conforme à la réglementation française, enregistrement Géo'DAE inclus.",
  alternates: { canonical: "/tarifs" },
};
import PageHero from "@/components/declarerdae/PageHero";
import CTABanner from "@/components/declarerdae/CTABanner";
import ScrollReveal from "@/components/declarerdae/ScrollReveal";
import {
  ArrowRight,
  CheckCircle2,
  Scale,
  HeartHandshake,
  Building2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  "Déclaration illimitée de DAE",
  "Formulaire guidé en 4 étapes",
  "Vérification de conformité",
  "Enregistrement dans Géo'DAE",
  "Attestation de déclaration",
  "Rappels de maintenance",
  "Support par email",
  "Mise à jour des informations",
];

const whyFree = [
  {
    icon: Scale,
    title: "Obligation légale",
    desc: "La déclaration des DAE est une obligation réglementaire. Notre mission est de la rendre simple et accessible à tous.",
  },
  {
    icon: HeartHandshake,
    title: "Service d'intérêt public",
    desc: "Chaque défibrillateur déclaré peut sauver une vie. Nous facilitons l'accès à ce service essentiel pour la santé publique.",
  },
  {
    icon: Building2,
    title: "Partenariats institutionnels",
    desc: "Notre modèle repose sur des partenariats avec les acteurs de la santé publique, pas sur vos frais.",
  },
];

const faq = [
  {
    q: "Est-ce vraiment 100% gratuit ?",
    a: "Oui, toutes nos prestations sont entièrement gratuites : déclaration, vérification de conformité, enregistrement dans Géo'DAE, attestation et support. Aucun frais caché, aucun abonnement.",
  },
  {
    q: "Y a-t-il une limite au nombre de DAE déclarés ?",
    a: "Non, vous pouvez déclarer autant de défibrillateurs que nécessaire, que vous soyez un particulier, un ERP, une entreprise ou une collectivité. Le service reste gratuit quel que soit le volume.",
  },
  {
    q: "Pourquoi ce service est-il gratuit ?",
    a: "La déclaration des DAE est une obligation légale (Loi 2018-527). Notre vocation est de simplifier cette démarche obligatoire et de contribuer à la santé publique en rendant chaque défibrillateur visible et accessible.",
  },
  {
    q: "Le service est-il adapté aux collectivités et grandes structures ?",
    a: "Absolument. Que vous ayez 1 ou 100 défibrillateurs à déclarer, notre plateforme est conçue pour s'adapter à vos besoins. Les collectivités et grandes entreprises bénéficient du même service complet, gratuitement.",
  },
];

export default function TarifsPage() {
  return (
    <>
      <Breadcrumb items={[{ label: "Tarifs" }]} />
      <PageHero
        tag="100% gratuit"
        title="Un service entièrement gratuit"
        description="Toutes nos prestations sont gratuites, sans exception. Déclaration, conformité, attestation, support — tout est inclus, sans frais cachés ni engagement."
        showCTA={false}
      />

      <main>
        {/* Ce qui est inclus */}
        <section className="bg-[#F6F6F6] py-10 sm:py-16">
          <div className="container">
            <ScrollReveal>
              <div className="max-w-3xl mx-auto bg-white rounded border border-[#18753C]/30 ring-2 ring-[#18753C]/10 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center gap-1.5 bg-[#18753C] text-white text-sm font-bold px-4 py-1.5 rounded-full">
                    <ShieldCheck className="w-4 h-4" />
                    GRATUIT
                  </span>
                </div>

                <h2 className="font-heading font-bold text-xl text-[#161616] mb-2">
                  Tout est inclus, sans aucun frais
                </h2>
                <p className="text-sm text-[#666] mb-8 max-w-lg">
                  Particulier, ERP, entreprise ou collectivité — le même service complet pour tous, entièrement gratuit.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                  {features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-[#18753C] mt-0.5 shrink-0" />
                      <span className="text-sm text-[#3A3A3A] font-medium">{f}</span>
                    </div>
                  ))}
                </div>

                <a href="/declaration" className="inline-block">
                  <Button className="bg-[#000091] hover:bg-[#000070] text-white font-semibold px-6">
                    Déclarer mon DAE
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </a>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Pourquoi c'est gratuit */}
        <section className="bg-white py-14">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <ScrollReveal>
                <h2 className="font-heading font-bold text-xl text-[#161616] mb-8 text-center">
                  Pourquoi c'est gratuit ?
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  {whyFree.map((item, i) => (
                    <div key={i} className="text-center p-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[#18753C]/10 mb-4">
                        <item.icon className="w-6 h-6 text-[#18753C]" />
                      </div>
                      <h3 className="font-heading font-semibold text-sm text-[#161616] mb-2">
                        {item.title}
                      </h3>
                      <p className="text-xs text-[#666] leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-[#F6F6F6] py-14">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <ScrollReveal>
                <h2 className="font-heading font-bold text-xl text-[#161616] mb-6 text-center">
                  Questions fréquentes
                </h2>
                <div className="space-y-4">
                  {faq.map((item, i) => (
                    <div
                      key={i}
                      className="bg-white border border-[#E5E5E5] rounded p-3 sm:p-5"
                    >
                      <h3 className="font-heading font-semibold text-sm text-[#161616] mb-2">
                        {item.q}
                      </h3>
                      <p className="text-sm text-[#666] leading-relaxed">
                        {item.a}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        <CTABanner
          title="Prêt à déclarer votre DAE ?"
          subtitle="100% gratuit — Sans engagement, sans frais cachés"
          buttonText="Déclarer mon DAE"
          href="/declaration"
          variant="primary"
        />
      </main>
    </>
  );
}
