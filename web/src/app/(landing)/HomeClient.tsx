"use client";
/*
  DESIGN: Service Public Numérique
  Landing page de vente ultra complète pour declarerdefibrillateur.fr
  Style épuré .gouv, SEO optimisé, contenu persuasif, CTA stratégiques multiples
*/
import FAQ from "@/components/declarerdae/FAQ";
import ScrollReveal from "@/components/declarerdae/ScrollReveal";
import CTABanner from "@/components/declarerdae/CTABanner";
import StickyFooterCTA from "@/components/declarerdae/StickyFooterCTA";
import TrustBadges from "@/components/declarerdae/TrustBadges";
import DaeMapFrance from "@/components/declarerdae/DaeMapFrance";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Building2,
  CheckCircle2,
  Clock,
  FileCheck,
  Gavel,
  Heart,
  HeartPulse,
  Landmark,
  LifeBuoy,
  MapPin,
  Scale,
  Shield,
  ShieldCheck,
  Store,
  Timer,
  UserPlus,
  Users,
  Zap,
  ArrowDown,
  ExternalLink,
} from "lucide-react";

const CDN = {
  hero: "https://d2xsxph8kpxj0f.cloudfront.net/89927487/HhS2ac9a5pDpWwn8oRN4Bv/hero-defibrillateur_79d8ac24.jpg",
  formulaire: "https://d2xsxph8kpxj0f.cloudfront.net/89927487/HhS2ac9a5pDpWwn8oRN4Bv/formulaire-simple_6a66d6cf.jpg",
  conformite: "https://d2xsxph8kpxj0f.cloudfront.net/89927487/HhS2ac9a5pDpWwn8oRN4Bv/conformite-legale_e6b7eb3f.jpg",
  urgence: "https://d2xsxph8kpxj0f.cloudfront.net/89927487/HhS2ac9a5pDpWwn8oRN4Bv/urgence-cardiaque_75488058.jpg",
  etapes: "https://d2xsxph8kpxj0f.cloudfront.net/89927487/HhS2ac9a5pDpWwn8oRN4Bv/etapes-processus_2c3ac9ee.jpg",
};

export default function HomeClient() {

  return (
    <>
      <StickyFooterCTA />

      <main>
        {/* ===== HERO SECTION ===== */}
        <section className="relative bg-[#000091] overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src={CDN.hero}
              alt="Défibrillateur automatisé externe installé dans un lieu public"
              className="object-cover"
              fill
              priority
              sizes="100vw"
            />
          </div>
          <div className="absolute inset-0 bg-[#000091]/80" />
          <div className="relative container-narrow py-16 sm:py-20 lg:py-24">
            <div className="flex flex-col lg:flex-row lg:items-center lg:gap-10">
              {/* Left side — text content */}
              <div className="lg:flex-1">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-sm px-3 py-1.5 mb-6">
                  <AlertTriangle className="w-4 h-4 text-[#E1000F]" />
                  <span className="text-white text-sm font-medium">
                    Obligation légale — Décret n°2018-1259
                  </span>
                </div>

                <h1 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-white leading-tight mb-5 tracking-tight">
                  Déclarez votre défibrillateur en ligne,{" "}
                  <span className="text-[#99C1F1]">gratuitement et en quelques minutes</span>
                </h1>

                <p className="text-base sm:text-lg lg:text-xl text-white/85 leading-relaxed mb-6 sm:mb-8 max-w-xl">
                  Chaque année, <strong className="text-white">50 000 personnes</strong> sont victimes d'un arrêt cardiaque en France. Votre DAE peut sauver des vies — encore faut-il qu'il soit déclaré et localisable. Notre service automatisé vous met en conformité en moins de 5 minutes.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/declaration">
                    <Button size="lg" className="bg-[#E1000F] hover:bg-[#C00000] text-white font-semibold text-base px-6 w-full sm:w-auto">
                      Déclarer mon DAE maintenant
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <a href="#pourquoi">
                    <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 bg-transparent font-medium text-base px-6 w-full sm:w-auto">
                      En savoir plus
                      <ArrowDown className="w-4 h-4 ml-2" />
                    </Button>
                  </a>
                </div>

                <div className="flex items-center gap-3 sm:gap-6 mt-6 sm:mt-8 text-white/70 text-sm">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> 5 min
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> 100% conforme
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4" /> Attestation incluse
                  </span>
                </div>
              </div>

              {/* Right side — "Comment ça marche" card */}
              <div className="hidden lg:block lg:flex-shrink-0 lg:w-[460px]">
                <div className="bg-white rounded-lg px-7 py-6 shadow-xl">
                  <h2 className="font-heading font-bold text-xl text-[#000091] mb-10 text-center">
                    Comment ça marche ?
                  </h2>

                  {/* Row 1 */}
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center text-center flex-1">
                      <Image src="/images/hero/iconhero1.png" alt="Recherche d'Entité" width={120} height={90} className="object-contain" />
                      <p className="text-xs font-bold text-[#000091] mt-2 leading-tight">Recherche d&apos;Entité&nbsp;:</p>
                      <p className="text-[11px] text-[#3A3A3A] leading-tight mt-0.5">Trouvez votre structure avec son nom ou SIREN.</p>
                    </div>

                    <div className="flex items-center pt-6 shrink-0">
                      <svg width="32" height="20" viewBox="0 0 32 20" fill="none"><path d="M0 10h26m0 0l-6-6m6 6l-6 6" stroke="#000091" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>

                    <div className="flex flex-col items-center text-center flex-1">
                      <Image src="/images/hero/iconhero2.png" alt="Détails de Contact" width={120} height={90} className="object-contain" />
                      <p className="text-xs font-bold text-[#000091] mt-2 leading-tight">Détails de Contact&nbsp;:</p>
                      <p className="text-[11px] text-[#3A3A3A] leading-tight mt-0.5">Renseignez les informations de la personne référente.</p>
                    </div>
                  </div>

                  {/* Row 2 */}
                  <div className="flex items-start gap-3 mt-10">
                    <div className="flex flex-col items-center text-center flex-1">
                      <Image src="/images/hero/iconhero3.png" alt="Informations DAE" width={120} height={90} className="object-contain" />
                      <p className="text-xs font-bold text-[#000091] mt-2 leading-tight">Informations DAE&nbsp;:</p>
                      <p className="text-[11px] text-[#3A3A3A] leading-tight mt-0.5">Détails de localisation et d&apos;appareil.</p>
                    </div>

                    <div className="flex items-center pt-6 shrink-0">
                      <svg width="32" height="20" viewBox="0 0 32 20" fill="none"><path d="M0 10h26m0 0l-6-6m6 6l-6 6" stroke="#000091" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>

                    <div className="flex flex-col items-center text-center flex-1">
                      <Image src="/images/hero/iconhero4.png" alt="Soumission" width={120} height={90} className="object-contain" />
                      <p className="text-xs font-bold text-[#000091] mt-2 leading-tight">Soumission&nbsp;:</p>
                      <p className="text-[11px] text-[#3A3A3A] leading-tight mt-0.5">Validation et réception de l&apos;attestation.</p>
                    </div>
                  </div>

                  <div className="mt-8 text-center">
                    <Link href="/declaration">
                      <Button variant="outline" className="border-[#000091] text-[#000091] hover:bg-[#EFF6FF] bg-transparent font-medium text-sm px-6">
                        Déclarer mon DAE
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== BANDEAU URGENCE ===== */}
        <section className="bg-[#FEF3F2] border-b border-[#FECACA]">
          <div className="container-narrow py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="flex items-start gap-3 flex-1">
                <AlertTriangle className="w-5 h-5 text-[#E1000F] mt-0.5 shrink-0" />
                <p className="text-sm text-[#7F1D1D] leading-relaxed">
                  <strong>Attention :</strong> Au 13 janvier 2026, seulement 165 500 DAE sur les 500 000 installés en France étaient recensés dans la base nationale Géo'DAE — près de 7 DAE sur 10 restent invisibles pour les services de secours. Le non-respect des obligations de déclaration, de maintenance et de signalétique engage la responsabilité de l'exploitant, qui peut être poursuivi pénalement en cas d'arrêt cardiaque mortel dans son établissement.
                </p>
              </div>
              <Link href="/declaration" className="shrink-0">
                <Button size="sm" className="bg-[#E1000F] hover:bg-[#C00000] text-white font-semibold text-xs px-4">
                  Vérifier ma conformité
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ===== BANDEAU DE CONFIANCE ===== */}
        <section className="bg-white py-5 border-b border-[#E5E5E5]">
          <div className="container">
            <TrustBadges />
          </div>
        </section>

        {/* ===== STATISTIQUES ===== */}
        <section className="bg-white py-8 sm:py-12 border-b border-[#E5E5E5]">
          <div className="container">
            <ScrollReveal>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {[
                  { value: "50 000", label: "Arrêts cardiaques", sublabel: "chaque année en France", color: "text-[#E1000F]" },
                  { value: "< 10 %", label: "Taux de survie", sublabel: "sans intervention rapide", color: "text-[#000091]" },
                  { value: "5 min", label: "Durée de déclaration", sublabel: "sur notre plateforme", color: "text-[#18753C]" },
                  { value: "50 %", label: "Survie avec DAE", sublabel: "dans les premières minutes", color: "text-[#000091]" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-[#F6F6F6] rounded-lg p-4 sm:p-5 text-center">
                    <div className={`font-heading font-black text-2xl sm:text-3xl leading-none ${stat.color}`}>
                      {stat.value}
                    </div>
                    <div className="font-heading font-semibold text-xs sm:text-sm text-[#3A3A3A] mt-2">{stat.label}</div>
                    <div className="text-[11px] text-[#929292] mt-0.5">{stat.sublabel}</div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ===== POURQUOI DÉCLARER ===== */}
        <section id="pourquoi" className="bg-[#F6F6F6] py-10 sm:py-16 scroll-mt-20">
          <div className="container">
            <ScrollReveal>
              <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-12">
                <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#000091] mb-3">
                  Enjeu de santé publique
                </span>
                <h2 className="font-heading font-bold text-2xl sm:text-3xl text-[#161616] mb-4">
                  Pourquoi la déclaration de votre DAE est indispensable
                </h2>
                <p className="text-[#666] text-base leading-relaxed">
                  Chaque minute compte lors d'un arrêt cardiaque. Un défibrillateur déclaré et géolocalisé dans la base nationale permet aux services de secours et aux citoyens de le localiser instantanément. C'est un maillon essentiel de la chaîne de survie.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
              <ScrollReveal delay={100}>
                <div className="bg-white rounded border border-[#E5E5E5] p-4 sm:p-6 h-full">
                  <div className="flex items-center justify-center w-11 h-11 rounded bg-[#FEF3F2] mb-4">
                    <HeartPulse className="w-5 h-5 text-[#E1000F]" />
                  </div>
                  <h3 className="font-heading font-bold text-base text-[#161616] mb-2">
                    50 000 vies en jeu chaque année
                  </h3>
                  <p className="text-sm text-[#666] leading-relaxed">
                    En France, près de 50 000 personnes décèdent d'un arrêt cardiaque chaque année. Le taux de survie est aujourd'hui inférieur à 10 %, l'un des plus bas d'Europe occidentale. Chaque minute sans défibrillation réduit les chances de survie de 7 à 10 %. Lorsqu'un DAE est utilisé dans les premières minutes suivant l'arrêt, le taux de survie est majoré à 50 % (source : PPL n° 274 du Sénat, 13 janvier 2026).
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={200}>
                <div className="bg-white rounded border border-[#E5E5E5] p-4 sm:p-6 h-full">
                  <div className="flex items-center justify-center w-11 h-11 rounded bg-[#EFF6FF] mb-4">
                    <MapPin className="w-5 h-5 text-[#000091]" />
                  </div>
                  <h3 className="font-heading font-bold text-base text-[#161616] mb-2">
                    67 % des DAE restent invisibles
                  </h3>
                  <p className="text-sm text-[#666] leading-relaxed">
                    Au 13 janvier 2026, seuls 165 500 DAE sur les 500 000 installés en France étaient recensés dans la base nationale Géo'DAE (source : exposé des motifs de la proposition de loi n° 274 du Sénat). Près de 2 DAE sur 3 sont aujourd'hui introuvables par les services de secours et les citoyens en situation d'urgence. Un DAE non déclaré est un DAE qui ne sauvera personne.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={300}>
                <div className="bg-white rounded border border-[#E5E5E5] p-4 sm:p-6 h-full">
                  <div className="flex items-center justify-center w-11 h-11 rounded bg-[#F0FDF4] mb-4">
                    <Timer className="w-5 h-5 text-[#18753C]" />
                  </div>
                  <h3 className="font-heading font-bold text-base text-[#161616] mb-2">
                    La chaîne de survie commence par vous
                  </h3>
                  <p className="text-sm text-[#666] leading-relaxed">
                    La chaîne de survie repose sur 4 maillons : appeler les secours, pratiquer le massage cardiaque, utiliser un DAE, et l'intervention des équipes médicales. En déclarant votre DAE, vous permettez aux applications mobiles et aux régulateurs du SAMU de guider les témoins vers le défibrillateur le plus proche en temps réel.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={400}>
                <div className="bg-white rounded border border-[#E5E5E5] p-4 sm:p-6 h-full">
                  <div className="flex items-center justify-center w-11 h-11 rounded bg-[#FEF9C3] mb-4">
                    <Gavel className="w-5 h-5 text-[#92400E]" />
                  </div>
                  <h3 className="font-heading font-bold text-base text-[#161616] mb-2">
                    Une obligation légale depuis 2018
                  </h3>
                  <p className="text-sm text-[#666] leading-relaxed">
                    La loi n°2018-527 du 28 juin 2018 et le décret n°2018-1259 du 27 décembre 2018 imposent à tous les exploitants de DAE de déclarer leurs appareils dans la base de données nationale. Cette obligation s'applique à tous les ERP, entreprises, associations et collectivités possédant un défibrillateur.
                  </p>
                </div>
              </ScrollReveal>
            </div>

            {/* CTA après Pourquoi déclarer */}
            <ScrollReveal>
              <div className="max-w-2xl mx-auto mt-10 text-center">
                <p className="text-sm text-[#666] mb-3">Vous possédez un DAE ? Vérifiez votre conformité en quelques clics.</p>
                <Link href="/declaration">
                  <Button className="bg-[#000091] hover:bg-[#000070] text-white font-semibold px-6">
                    Déclarer mon DAE maintenant
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ===== IMAGE URGENCE + CITATION ===== */}
        <section className="relative h-64 sm:h-80 overflow-hidden">
          <Image
            src="/images/urgence-samu.png"
            alt="Intervention d'urgence avec un défibrillateur automatisé externe"
            className="object-cover"
            fill
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#000091]/80 to-transparent flex items-center">
            <div className="container-narrow">
              <blockquote className="max-w-lg">
                <p className="text-white font-heading font-bold text-xl sm:text-2xl leading-snug mb-3">
                  "Pour chaque minute qui s'écoule après un arrêt cardiaque, les probabilités de survie chutent de 7 à 10 %."
                </p>
                <cite className="text-white/70 text-sm not-italic">
                  — Fédération Française de Cardiologie
                </cite>
              </blockquote>
            </div>
          </div>
        </section>

        {/* ===== CTA INTERMÉDIAIRE ROUGE ===== */}
        <CTABanner
          title="Ne laissez pas votre DAE dans l'ombre. Déclarez-le maintenant."
          subtitle="67% des défibrillateurs en France ne sont pas déclarés. Et le vôtre ?"
          buttonText="Déclarer gratuitement"
          href="/declaration"
          variant="danger"
        />

        {/* ===== OBLIGATIONS LÉGALES ===== */}
        <section id="obligations" className="bg-white py-10 sm:py-16 scroll-mt-20">
          <div className="container">
            <ScrollReveal>
              <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-12">
                <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#E1000F] mb-3">
                  Cadre réglementaire
                </span>
                <h2 className="font-heading font-bold text-2xl sm:text-3xl text-[#161616] mb-4">
                  Vos 3 obligations en tant qu'exploitant de DAE
                </h2>
                <p className="text-[#666] text-base leading-relaxed">
                  En tant que propriétaire ou exploitant d'un défibrillateur automatisé externe, la réglementation française vous impose trois obligations distinctes. Le non-respect de ces obligations engage votre responsabilité civile et pénale.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5 max-w-4xl mx-auto">
              <ScrollReveal delay={100}>
                <div className="border-l-4 border-[#E1000F] bg-[#FEF3F2] p-3 sm:p-5 rounded-r">
                  <div className="flex items-center gap-2 mb-2">
                    <FileCheck className="w-5 h-5 text-[#E1000F]" />
                    <h3 className="font-heading font-bold text-base text-[#161616]">
                      1. Obligation de déclaration
                    </h3>
                  </div>
                  <p className="text-sm text-[#666] leading-relaxed">
                    Tous les exploitants doivent déclarer les données d'implantation et d'accessibilité de leurs DAE dans la base de données nationale Géo'DAE, conformément au décret n°2018-1259 et à l'arrêté du 29 octobre 2019.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={200}>
                <div className="border-l-4 border-[#000091] bg-[#EFF6FF] p-3 sm:p-5 rounded-r">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-[#000091]" />
                    <h3 className="font-heading font-bold text-base text-[#161616]">
                      2. Obligation de maintenance
                    </h3>
                  </div>
                  <p className="text-sm text-[#666] leading-relaxed">
                    Le DAE est un dispositif médical soumis à une obligation de maintenance régulière : vérification des électrodes, de la batterie, du logiciel, conformément aux préconisations du fabricant. La date de dernière maintenance doit être déclarée.
                  </p>
                </div>
              </ScrollReveal>



              <ScrollReveal delay={300}>
                <div className="border-l-4 border-[#92400E] bg-[#FEF9C3] p-3 sm:p-5 rounded-r">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-5 h-5 text-[#92400E]" />
                    <h3 className="font-heading font-bold text-base text-[#161616]">
                      3. Obligation de signalétique
                    </h3>
                  </div>
                  <p className="text-sm text-[#666] leading-relaxed">
                    Une signalétique normalisée doit être apposée sur le boîtier ou à proximité immédiate du DAE. Pour les ERP, une étiquette conforme au modèle réglementaire est obligatoire depuis le 1er janvier 2020.
                  </p>
                </div>
              </ScrollReveal>
            </div>

            {/* Calendrier ERP */}
            <ScrollReveal>
              <div className="max-w-3xl mx-auto mt-12">
                <div className="alert-info rounded">
                  <h3 className="font-heading font-bold text-base text-[#000091] mb-3 flex items-center gap-2">
                    <Landmark className="w-5 h-5" />
                    Calendrier d'obligation d'équipement des ERP
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#000091]/20">
                          <th className="text-left py-2 pr-2 sm:pr-4 font-semibold text-[#000091] text-xs sm:text-sm">Date d'effet</th>
                          <th className="text-left py-2 pr-2 sm:pr-4 font-semibold text-[#000091] text-xs sm:text-sm">Catégories ERP</th>
                          <th className="text-left py-2 font-semibold text-[#000091] text-xs sm:text-sm">Capacité d'accueil</th>
                        </tr>
                      </thead>
                      <tbody className="text-[#3A3A3A]">
                        <tr className="border-b border-[#000091]/10">
                          <td className="py-2 pr-2 sm:pr-4 font-medium text-xs sm:text-sm">1er janvier 2020</td>
                          <td className="py-2 pr-2 sm:pr-4 text-xs sm:text-sm">Catégories 1, 2 et 3</td>
                          <td className="py-2 text-xs sm:text-sm">Plus de 300 personnes (1 500+ ; 701-1 500 ; 301-700)</td>
                        </tr>
                        <tr className="border-b border-[#000091]/10">
                          <td className="py-2 pr-2 sm:pr-4 font-medium text-xs sm:text-sm">1er janvier 2021</td>
                          <td className="py-2 pr-2 sm:pr-4 text-xs sm:text-sm">Catégorie 4</td>
                          <td className="py-2 text-xs sm:text-sm">Jusqu'à 300 personnes (hors catégorie 5)</td>
                        </tr>
                        <tr className="border-b border-[#000091]/10">
                          <td className="py-2 pr-2 sm:pr-4 font-medium text-xs sm:text-sm">1er janvier 2022</td>
                          <td className="py-2 pr-2 sm:pr-4 text-xs sm:text-sm">Certains ERP de catégorie 5</td>
                          <td className="py-2 text-xs sm:text-sm">Selon types définis par arrêté (refuges de montagne, établissements de soins, structures d'accueil pour personnes âgées ou handicapées, gares, établissements sportifs...)</td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-2 sm:pr-4 font-medium text-xs sm:text-sm">7 décembre 2025</td>
                          <td className="py-2 pr-2 sm:pr-4 text-xs sm:text-sm">Nouvelle extension catégorie 5</td>
                          <td className="py-2 text-xs sm:text-sm">Salles de danse (type P), salles de jeux, aéroports — sous conditions (décret n°2025-1167)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Sanctions */}
            <ScrollReveal>
              <div className="max-w-3xl mx-auto mt-6">
                <div className="alert-danger rounded">
                  <h3 className="font-heading font-bold text-base text-[#E1000F] mb-2 flex items-center gap-2">
                    <Scale className="w-5 h-5" />
                    Sanctions en cas de non-conformité
                  </h3>
                  <div className="text-sm text-[#7F1D1D] leading-relaxed space-y-2">
                    <p>Le non-respect des obligations relatives aux DAE expose l'exploitant à trois niveaux de sanctions selon la nature du manquement :</p>
                    <ul className="list-disc pl-5 space-y-1.5">
                      <li><strong>Sanctions administratives :</strong> mise en demeure, fermeture administrative temporaire ou définitive de l'établissement prononcée par le maire ou le préfet.</li>
                      <li><strong>Défaut de maintenance :</strong> jusqu'à <strong>2 ans d'emprisonnement et 150 000 € d'amende</strong> (article L.5461-5 du Code de la santé publique, rappelé par la note d'information DGS/PP3/2025/121 du 3 octobre 2025).</li>
                      <li><strong>Sanctions pénales en cas d'arrêt cardiaque mortel :</strong> responsabilité pénale du chef d'établissement pour homicide involontaire — jusqu'à <strong>3 ans et 45 000 €</strong> en cas de simple imprudence, portée à <strong>5 ans et 75 000 €</strong> en cas de violation manifestement délibérée d'une obligation de sécurité.</li>
                    </ul>
                    <p className="mt-2 text-xs italic">Deux propositions de loi actuellement en cours d'examen au Parlement (PPL n°1090 à l'Assemblée nationale, PPL n°274 au Sénat) visent à durcir et clarifier ces sanctions.</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* CTA + Lien vers page obligations */}
            <ScrollReveal>
              <div className="max-w-3xl mx-auto mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/declaration">
                  <Button className="bg-[#E1000F] hover:bg-[#C00000] text-white font-semibold px-6">
                    Mettre mon DAE en conformité
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/obligations">
                  <Button variant="outline" className="border-[#000091] text-[#000091] hover:bg-[#EFF6FF] bg-transparent font-medium px-6">
                    En savoir plus sur les obligations
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ===== CADRE RÉGLEMENTAIRE EN ÉVOLUTION ===== */}
        <section className="bg-[#F6F6F6] py-10 sm:py-16">
          <div className="container">
            <ScrollReveal>
              <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-12">
                <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#92400E] mb-3">
                  Actualité réglementaire
                </span>
                <h2 className="font-heading font-bold text-2xl sm:text-3xl text-[#161616] mb-4">
                  Un cadre réglementaire en cours de durcissement
                </h2>
                <p className="text-[#666] text-base leading-relaxed">
                  Deux propositions de loi sont actuellement en discussion au Parlement français. Elles visent à renforcer les obligations pesant sur les exploitants de DAE, à simplifier la déclaration dans Géo'DAE et à introduire des sanctions en cas de manquement.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
              <ScrollReveal delay={100}>
                <div className="border-l-4 border-[#000091] bg-white p-4 sm:p-6 rounded-r h-full">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-[#FEF9C3] text-[#92400E]">En discussion</span>
                  </div>
                  <h3 className="font-heading font-bold text-base text-[#000091] mb-2">
                    Proposition de loi n°1090 — Assemblée nationale
                  </h3>
                  <p className="text-xs text-[#929292] mb-2">Déposée le 11 mars 2025 par M. Laurent MAZAURY</p>
                  <p className="text-sm text-[#666] leading-relaxed">
                    Vise à garantir la maintenance des DAE. Prévoit l'obligation de recensement dans un délai d'un an après installation, le renforcement des obligations de maintenance et des sanctions à définir par arrêté.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={200}>
                <div className="border-l-4 border-[#E1000F] bg-white p-4 sm:p-6 rounded-r h-full">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-[#FEF9C3] text-[#92400E]">En discussion</span>
                  </div>
                  <h3 className="font-heading font-bold text-base text-[#E1000F] mb-2">
                    Proposition de loi n°274 — Sénat
                  </h3>
                  <p className="text-xs text-[#929292] mb-2">Déposée le 13 janvier 2026 par M. Ludovic HAYE</p>
                  <p className="text-sm text-[#666] leading-relaxed">
                    Vise à renforcer l'accessibilité, l'efficacité et la gouvernance locale des DAE. Instaure un recensement simplifié, une meilleure coordination territoriale et des sanctions en cas de non-respect de la maintenance. Le texte constate explicitement que, au 13 janvier 2026, seuls 165 500 DAE sur les 500 000 installés en France étaient recensés.
                  </p>
                </div>
              </ScrollReveal>
            </div>

            <ScrollReveal>
              <div className="max-w-3xl mx-auto mt-8 text-center">
                <div className="bg-white border border-[#E5E5E5] rounded p-4 sm:p-6">
                  <p className="font-heading font-bold text-base text-[#18753C] mb-2">
                    Notre engagement
                  </p>
                  <p className="text-sm text-[#666] leading-relaxed">
                    Vous accompagner dès maintenant pour être en totale conformité, que ces textes soient adoptés ou non.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

                {/* ===== QUI EST CONCERNÉ ===== */}
        <section className="bg-[#F6F6F6] py-10 sm:py-16">
          <div className="container">
            <ScrollReveal>
              <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-10">
                <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#000091] mb-3">
                  Êtes-vous concerné ?
                </span>
                <h2 className="font-heading font-bold text-2xl sm:text-3xl text-[#161616] mb-4">
                  Qui doit déclarer son défibrillateur ?
                </h2>
                <p className="text-[#666] text-base leading-relaxed">
                  L'obligation de déclaration concerne tous les exploitants de DAE, qu'ils soient soumis ou non à l'obligation d'équipement. Si vous possédez un défibrillateur et le mettez à disposition de tiers, vous êtes concerné.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {[
                { icon: Building2, label: "ERP catégories 1 à 4", desc: "Commerces, restaurants, hôtels, salles de sport, cinémas accueillant plus de 300 personnes" },
                { icon: Store, label: "Certains ERP de catégorie 5", desc: "Refuges de montagne, structures d'accueil personnes âgées/handicapées, gares, établissements sportifs ; depuis le décret 2025-1167 : salles de danse, salles de jeux, aéroports" },
                { icon: Landmark, label: "Collectivités territoriales", desc: "Mairies, communautés de communes, départements, régions disposant d'ERP soumis à l'obligation" },
                { icon: Users, label: "Entreprises exploitant un ERP", desc: "Sièges sociaux, bureaux accueillant du public" },
                { icon: Heart, label: "Associations", desc: "Clubs sportifs, associations culturelles, MJC exploitant un ERP" },
                { icon: LifeBuoy, label: "Établissements de santé", desc: "Centres de santé, cliniques (les cabinets médicaux ne sont pas des ERP)" },
                { icon: UserPlus, label: "Exploitants volontaires", desc: "Copropriétés, résidences, entreprises équipant un DAE au-delà de l'obligation légale" },
              ].map((item, i) => (
                <ScrollReveal key={i} delay={i * 80}>
                  <div className="bg-white border border-[#E5E5E5] rounded p-4 flex items-start gap-3 h-full">
                    <div className="flex items-center justify-center w-9 h-9 rounded bg-[#EFF6FF] shrink-0">
                      <item.icon className="w-4 h-4 text-[#000091]" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-sm text-[#161616] mb-1">{item.label}</h3>
                      <p className="text-xs text-[#929292] leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            {/* CTA après Qui est concerné */}
            <ScrollReveal>
              <div className="max-w-2xl mx-auto mt-10 text-center">
                <div className="bg-white border border-[#E5E5E5] rounded p-4 sm:p-6">
                  <p className="font-heading font-bold text-base text-[#161616] mb-2">
                    Vous êtes dans l'une de ces catégories ?
                  </p>
                  <p className="text-sm text-[#666] mb-4">
                    Vérifiez en 2 minutes si votre DAE est correctement déclaré et mettez-vous en conformité.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link href="/declaration">
                      <Button className="bg-[#000091] hover:bg-[#000070] text-white font-semibold px-6">
                        Déclarer mon DAE
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                    <Link href="/guide-erp">
                      <Button variant="outline" className="border-[#CECECE] text-[#3A3A3A] hover:bg-[#F6F6F6] bg-transparent font-medium px-6">
                        Consulter le guide ERP
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ===== CTA INTERMÉDIAIRE VERT ===== */}
        <CTABanner
          title="Attestation d'enregistrement Géo'DAE délivrée gratuitement sous 24 heures"
          subtitle="via declarerdefibrillateur.fr"
          buttonText="Obtenir mon attestation"
          href="/declaration"
          variant="success"
        />

        {/* ===== NOTRE SERVICE ===== */}
        <section id="service" className="bg-white py-10 sm:py-16 scroll-mt-20">
          <div className="container">
            <ScrollReveal>
              <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-12">
                <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#18753C] mb-3">
                  Notre solution
                </span>
                <h2 className="font-heading font-bold text-2xl sm:text-3xl text-[#161616] mb-4">
                  Un service automatisé pour une déclaration simplifiée
                </h2>
                <p className="text-[#666] text-base leading-relaxed">
                  La procédure officielle de déclaration peut s'avérer complexe et chronophage. Notre plateforme simplifie chaque étape pour vous permettre de vous mettre en conformité rapidement, sans erreur, et avec une attestation d'enregistrement.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto items-center">
              <ScrollReveal>
                <Image
                  src={CDN.formulaire}
                  alt="Interface simplifiée de déclaration de défibrillateur en ligne"
                  className="w-full rounded shadow-lg border border-[#E5E5E5]"
                  width={600}
                  height={400}
                />
              </ScrollReveal>

              <ScrollReveal delay={200}>
                <div className="space-y-3 sm:space-y-5">
                  {[
                    {
                      icon: Zap,
                      title: "Déclaration en 5 minutes",
                      desc: "Notre formulaire guidé en 4 étapes collecte uniquement les informations nécessaires. Pas de jargon administratif, pas de pièces jointes complexes.",
                    },
                    {
                      icon: BadgeCheck,
                      title: "Conformité garantie",
                      desc: "Votre déclaration est vérifiée par notre équipe et conforme au standard défini par l'arrêté du 29 octobre 2019 relatif au fonctionnement de la base de données des DAE.",
                    },
                    {
                      icon: FileCheck,
                      title: "Attestation d'enregistrement",
                      desc: "Vous recevez par email une attestation d'enregistrement dans la base nationale Géo'DAE via declarerdefibrillateur.fr, confirmant la prise en charge et la transmission effective de votre déclaration.",
                    },
                    {
                      icon: ShieldCheck,
                      title: "Accompagnement complet",
                      desc: "Notre équipe vous accompagne de A à Z : vérification de votre dossier, enregistrement dans Géo'DAE, et rappels de maintenance programmés.",
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-9 h-9 rounded bg-[#F0FDF4] shrink-0 mt-0.5">
                        <item.icon className="w-4 h-4 text-[#18753C]" />
                      </div>
                      <div>
                        <h3 className="font-heading font-semibold text-sm text-[#161616] mb-1">
                          {item.title}
                        </h3>
                        <p className="text-sm text-[#666] leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}

                  <div className="pt-3">
                    <Link href="/declaration">
                      <Button className="bg-[#18753C] hover:bg-[#145F30] text-white font-semibold px-6">
                        Commencer ma déclaration
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ===== COMMENT ÇA MARCHE ===== */}
        <section id="etapes" className="bg-[#F6F6F6] py-10 sm:py-16 scroll-mt-20">
          <div className="container">
            <ScrollReveal>
              <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-12">
                <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#000091] mb-3">
                  Processus simplifié
                </span>
                <h2 className="font-heading font-bold text-2xl sm:text-3xl text-[#161616] mb-4">
                  Comment déclarer votre DAE en 3 étapes
                </h2>
                <p className="text-[#666] text-base leading-relaxed">
                  Notre processus a été conçu pour être le plus simple et le plus rapide possible. Aucune connaissance technique n'est requise.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal>
              <div className="max-w-4xl mx-auto">
                <Image
                  src="/images/etapes-declarer.jpg"
                  alt="Les 3 étapes simples pour déclarer votre défibrillateur en ligne"
                  className="w-full rounded shadow-md border border-[#E5E5E5]"
                  width={900}
                  height={500}
                />
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto mt-8 sm:mt-10">
              {[
                {
                  step: "01",
                  title: "Remplissez le formulaire",
                  desc: "Complétez notre formulaire en ligne en renseignant les informations sur l'exploitant, l'établissement, la localisation et les caractéristiques techniques de votre DAE. Cela prend moins de 5 minutes.",
                },
                {
                  step: "02",
                  title: "Vérification et traitement",
                  desc: "Notre équipe vérifie la conformité de votre dossier au regard du standard réglementaire. Si des informations manquent, nous vous contactons directement pour compléter votre déclaration.",
                },
                {
                  step: "03",
                  title: "Attestation et enregistrement",
                  desc: "Votre DAE est enregistré dans la base nationale Géo'DAE. Vous recevez votre attestation de déclaration par email sous 24 heures. Votre défibrillateur est désormais localisable et vous êtes en conformité.",
                },
              ].map((item, i) => (
                <ScrollReveal key={i} delay={i * 150}>
                  <div className="bg-white border border-[#E5E5E5] rounded p-4 sm:p-6 text-center h-full">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#000091] text-white font-heading font-bold text-lg mb-4">
                      {item.step}
                    </div>
                    <h3 className="font-heading font-bold text-base text-[#161616] mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[#666] leading-relaxed">{item.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            {/* CTA après étapes */}
            <ScrollReveal>
              <div className="max-w-md mx-auto mt-8 text-center">
                <Link href="/declaration">
                  <Button size="lg" className="bg-[#E1000F] hover:bg-[#C00000] text-white font-semibold text-base px-8">
                    C'est parti, je déclare mon DAE
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ===== CONFORMITÉ IMAGE ===== */}
        <section className="relative h-48 sm:h-64 overflow-hidden">
          <Image
            src={CDN.conformite}
            alt="Certificat de conformité et défibrillateur automatisé externe"
            className="object-cover"
            fill
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-[#000091]/80 to-transparent flex items-center justify-end">
            <div className="container-narrow text-right">
              <div className="max-w-lg ml-auto">
                <p className="text-white font-heading font-bold text-lg sm:text-xl lg:text-2xl leading-snug mb-2">
                  Votre attestation d'enregistrement Géo'DAE en 24h
                </p>
                <p className="text-white/70 text-sm mb-4">
                  via declarerdefibrillateur.fr
                </p>
                <Link href="/declaration">
                  <Button size="sm" className="bg-[#E1000F] hover:bg-[#C00000] text-white font-semibold text-sm px-5">
                    Obtenir mon attestation
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ===== AVANTAGES COMPARATIFS ===== */}
        <section className="bg-white py-10 sm:py-16">
          <div className="container">
            <ScrollReveal>
              <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-10">
                <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#000091] mb-3">
                  Pourquoi nous choisir
                </span>
                <h2 className="font-heading font-bold text-2xl sm:text-3xl text-[#161616] mb-4">
                  La déclaration simplifiée vs. la procédure classique
                </h2>
              </div>
            </ScrollReveal>

            <ScrollReveal>
              <div className="max-w-3xl mx-auto overflow-x-auto">
                <table className="w-full text-sm border border-[#E5E5E5] rounded overflow-hidden">
                  <thead>
                    <tr className="bg-[#000091] text-white">
                      <th className="text-left py-2.5 px-2 sm:px-4 font-heading font-semibold text-xs sm:text-sm">Critère</th>
                      <th className="text-center py-2.5 px-2 sm:px-4 font-heading font-semibold text-xs sm:text-sm">Procédure classique</th>
                      <th className="text-center py-2.5 px-2 sm:px-4 font-heading font-semibold text-xs sm:text-sm bg-[#18753C]">Notre service</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { critere: "Temps de déclaration", classique: "30 min à 1h", notre: "5 minutes" },
                      { critere: "Vérification de conformité", classique: "À votre charge", notre: "Incluse" },
                      { critere: "Attestation d'enregistrement", classique: "Non fournie", notre: "Sous 24h" },
                      { critere: "Accompagnement", classique: "Aucun", notre: "Personnalisé" },
                      { critere: "Rappels de maintenance", classique: "Non", notre: "Automatiques" },
                      { critere: "Support en cas de difficulté", classique: "Email générique", notre: "Dédié" },
                      { critere: "Déclaration multiple", classique: "Une saisie par DAE", notre: "Parc illimité en un seul flux" },
                      { critere: "Suivi de dossier", classique: "Aucun", notre: "Temps réel" },
                    ].map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-[#F6F6F6]"}>
                        <td className="py-2.5 px-2 sm:px-4 font-medium text-[#161616] text-xs sm:text-sm">{row.critere}</td>
                        <td className="py-2.5 px-2 sm:px-4 text-center text-[#929292] text-xs sm:text-sm">{row.classique}</td>
                        <td className="py-2.5 px-2 sm:px-4 text-center font-semibold text-[#18753C] bg-[#F0FDF4]/50 text-xs sm:text-sm">
                          <span className="flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-4 h-4" />
                            {row.notre}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ScrollReveal>

            {/* CTA + lien tarifs */}
            <ScrollReveal>
              <div className="max-w-3xl mx-auto mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/declaration">
                  <Button className="bg-[#18753C] hover:bg-[#145F30] text-white font-semibold px-6">
                    Profiter du service simplifié
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/tarifs">
                  <Button variant="outline" className="border-[#CECECE] text-[#3A3A3A] hover:bg-[#F6F6F6] bg-transparent font-medium px-6">
                    Voir nos tarifs
                  </Button>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ===== CARTE DES DAE ===== */}
        <DaeMapFrance />


        {/* ===== TEXTES DE RÉFÉRENCE ===== */}
        <section className="bg-white py-10 sm:py-16">
          <div className="container">
            <ScrollReveal>
              <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-10">
                <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#000091] mb-3">
                  Base juridique
                </span>
                <h2 className="font-heading font-bold text-2xl sm:text-3xl text-[#161616] mb-4">
                  Textes de référence
                </h2>
                <p className="text-[#666] text-base leading-relaxed">
                  Notre service s'appuie sur un cadre législatif et réglementaire solide. Voici les textes fondateurs de l'obligation de déclaration des DAE en France.
                </p>
              </div>
            </ScrollReveal>

            <div className="max-w-3xl mx-auto space-y-3">
              {[
                { ref: "Proposition de loi n°274 (Sénat, 13 janvier 2026)", desc: "M. Ludovic HAYE — Vise à renforcer l'accessibilité, l'efficacité et la gouvernance locale des DAE ; instaure un recensement simplifié et des sanctions en cas de non-respect de la maintenance.", status: "En discussion" },
                { ref: "Proposition de loi n°1090 (Assemblée nationale, 11 mars 2025)", desc: "M. Laurent MAZAURY — Vise à garantir la maintenance des DAE ; impose un recensement dans un délai d'un an après installation et renforce les obligations de maintenance.", status: "En discussion" },
                { ref: "Décret n°2025-1167 du 5 décembre 2025", desc: "Relatif à l'obligation d'équipement des ERP d'un DAE — Élargit le périmètre des ERP de catégorie 5 concernés : salles de danse, salles de jeux, aéroports.", status: "En vigueur" },
                { ref: "Note d'information DGS/PP3/2025/121 du 3 octobre 2025", desc: "Relative aux bonnes pratiques en matière de gestion des DAE et à leur maintenance — Rappelle les responsabilités de l'exploitant et les sanctions applicables (article L.5461-5 CSP).", status: "Bulletin officiel" },
                { ref: "Arrêté du 29 octobre 2019", desc: "Relatif au fonctionnement de la base de données des DAE — Définit le standard de données, les informations obligatoires et les modalités de déclaration.", status: "En vigueur" },
                { ref: "Décret n°2018-1259 du 27 décembre 2018", desc: "Relatif à la base de données nationale des DAE — Définit l'obligation de déclaration et les modalités de fonctionnement de Géo'DAE.", status: "En vigueur" },
                { ref: "Décret n°2018-1186 du 19 décembre 2018", desc: "Relatif aux défibrillateurs automatisés externes — Précise les catégories d'ERP soumis à l'obligation et le calendrier de mise en œuvre.", status: "En vigueur" },
                { ref: "Loi n°2018-527 du 28 juin 2018", desc: "Relative au défibrillateur cardiaque — Instaure l'obligation d'équipement des ERP et la création de la base de données nationale.", status: "En vigueur" },
                { ref: "Décret n°2007-705 du 4 mai 2007", desc: "Relatif à l'utilisation des DAE par des personnes non-médecins — Autorise toute personne à utiliser un DAE, quel que soit son âge.", status: "En vigueur" },
              ].map((item, i) => (
                <ScrollReveal key={i} delay={i * 80}>
                  <div className="bg-[#F6F6F6] border border-[#E5E5E5] rounded p-4 flex items-start gap-3">
                    <Gavel className="w-5 h-5 text-[#000091] shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <h3 className="font-heading font-semibold text-sm text-[#000091]">{item.ref}</h3>
                        <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                          item.status === "En discussion" ? "bg-[#FEF9C3] text-[#92400E]" :
                          item.status === "Bulletin officiel" ? "bg-[#EFF6FF] text-[#000091]" :
                          "bg-[#F0FDF4] text-[#18753C]"
                        }`}>{item.status}</span>
                      </div>
                      <p className="text-sm text-[#666] leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ===== FAQ ===== */}
        <section id="faq" className="bg-[#F6F6F6] py-10 sm:py-16 scroll-mt-20">
          <div className="container">
            <ScrollReveal>
              <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-10">
                <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#000091] mb-3">
                  Questions fréquentes
                </span>
                <h2 className="font-heading font-bold text-2xl sm:text-3xl text-[#161616] mb-4">
                  Tout savoir sur la déclaration de votre DAE
                </h2>
                <p className="text-[#666] text-base leading-relaxed">
                  Retrouvez les réponses aux questions les plus fréquemment posées par les exploitants de défibrillateurs.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal>
              <div className="max-w-3xl mx-auto">
                <FAQ />
              </div>
            </ScrollReveal>

            {/* CTA dans la FAQ */}
            <ScrollReveal>
              <div className="max-w-3xl mx-auto mt-8 bg-white border border-[#E5E5E5] rounded p-4 sm:p-6 text-center">
                <p className="font-heading font-bold text-base text-[#161616] mb-2">
                  Vous avez d'autres questions ?
                </p>
                <p className="text-sm text-[#666] mb-4">
                  Notre équipe est disponible pour répondre à toutes vos interrogations sur la déclaration de votre DAE.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link href="/contact">
                    <Button variant="outline" className="border-[#000091] text-[#000091] hover:bg-[#EFF6FF] bg-transparent font-medium px-6">
                      Nous contacter
                    </Button>
                  </Link>
                  <Link href="/declaration">
                    <Button className="bg-[#E1000F] hover:bg-[#C00000] text-white font-semibold px-6">
                      Déclarer mon DAE
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Section formulaire déplacée sur /declaration */}

        {/* ===== CTA FINAL ===== */}
        <section className="bg-[#000091] py-10 sm:py-14">
          <div className="container-narrow text-center">
            <ScrollReveal>
              <h2 className="font-heading font-bold text-2xl sm:text-3xl text-white mb-4">
                Ne prenez plus de risque. Déclarez votre DAE aujourd'hui.
              </h2>
              <p className="text-white/75 text-base max-w-xl mx-auto mb-6 leading-relaxed">
                Rejoignez les milliers d'exploitants qui ont déjà mis leur défibrillateur en conformité gratuitement grâce à notre service simplifié. Protégez vos usagers, protégez-vous.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/declaration">
                  <Button size="lg" className="bg-[#E1000F] hover:bg-[#C00000] text-white font-semibold text-base px-8">
                    Déclarer mon DAE maintenant
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 bg-transparent font-medium text-base px-6">
                    Nous contacter
                  </Button>
                </Link>
              </div>
              <div className="flex items-center justify-center gap-3 sm:gap-6 mt-6 text-white/60 text-sm">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> 5 minutes
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Conforme
                </span>
                <span className="flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4" /> Gratuit
                </span>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>
    </>
  );
}
