"use client";
/*
  DESIGN: Service Public Numérique
  Landing page de vente ultra complète pour declarerdefibrillateur.fr
  Style épuré .gouv, SEO optimisé, contenu persuasif, CTA stratégiques multiples
*/
import { useState } from "react";
import StatCounter from "@/components/declarerdae/StatCounter";
import FAQ from "@/components/declarerdae/FAQ";
import ScrollReveal from "@/components/declarerdae/ScrollReveal";
import CTABanner from "@/components/declarerdae/CTABanner";
import StickyFooterCTA from "@/components/declarerdae/StickyFooterCTA";
import Testimonials from "@/components/declarerdae/Testimonials";
import TrustBadges from "@/components/declarerdae/TrustBadges";
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
  Lock,
  MapPin,
  Phone,
  Scale,
  Shield,
  ShieldCheck,
  Timer,
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

export default function Home() {
  const [heroVariant, setHeroVariant] = useState<0 | 1 | 2>(0);

  return (
    <>
      <StickyFooterCTA />

      <main>
        {/* ===== HERO SECTION ===== */}
        <section className="relative bg-[#000091] overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={CDN.hero}
              alt="Défibrillateur automatisé externe installé dans un lieu public"
              className="w-full h-full object-cover"
            />
          </div>
          <div className={`absolute inset-0 ${heroVariant === 0 ? "bg-gradient-to-r from-[#000091]/90 via-[#000091]/75 to-[#000091]/40" : heroVariant === 2 ? "bg-[#000091]/80" : "bg-[#000091]/80"}`} />
          <div className="relative container-narrow py-16 sm:py-20 lg:py-24">
            <div className={`flex flex-col ${heroVariant >= 1 ? "lg:flex-row lg:items-center lg:gap-10" : ""}`}>
              {/* Left side — text content */}
              <div className={heroVariant >= 1 ? "lg:flex-1" : "max-w-2xl"}>
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-sm px-3 py-1.5 mb-6">
                  <AlertTriangle className="w-4 h-4 text-[#E1000F]" />
                  <span className="text-white text-sm font-medium">
                    Obligation légale — Décret n°2018-1259
                  </span>
                </div>

                <h1 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-white leading-tight mb-5 tracking-tight">
                  Déclarez votre défibrillateur en ligne,{" "}
                  <span className="text-[#99C1F1]">simplement et rapidement</span>
                </h1>

                <p className="text-base sm:text-lg lg:text-xl text-white/85 leading-relaxed mb-6 sm:mb-8 max-w-xl">
                  Chaque année, <strong className="text-white">46 000 personnes</strong> sont victimes d'un arrêt cardiaque en France. Votre DAE peut sauver des vies — encore faut-il qu'il soit déclaré et localisable. Notre service automatisé vous met en conformité en moins de 5 minutes.
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

              {/* Right side — "Comment ça marche" card (variant 1 only) */}
              {heroVariant === 1 && (
                <div className="hidden lg:block lg:flex-shrink-0 lg:w-[460px]">
                  <div className="bg-white rounded-lg px-7 py-6 shadow-xl">
                    <h2 className="font-heading font-bold text-xl text-[#000091] mb-10 text-center">
                      Comment ça marche ?
                    </h2>

                    {/* Row 1 */}
                    <div className="flex items-start gap-3">
                      {/* Step 1 */}
                      <div className="flex flex-col items-center text-center flex-1">
                        <Image src="/images/hero/iconhero1.png" alt="Recherche d'Entité" width={120} height={90} className="object-contain" />
                        <p className="text-xs font-bold text-[#000091] mt-2 leading-tight">Recherche d&apos;Entité&nbsp;:</p>
                        <p className="text-[11px] text-[#3A3A3A] leading-tight mt-0.5">Trouvez votre structure avec son nom ou SIREN.</p>
                      </div>

                      {/* Arrow right */}
                      <div className="flex items-center pt-6 shrink-0">
                        <svg width="32" height="20" viewBox="0 0 32 20" fill="none"><path d="M0 10h26m0 0l-6-6m6 6l-6 6" stroke="#000091" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>

                      {/* Step 2 */}
                      <div className="flex flex-col items-center text-center flex-1">
                        <Image src="/images/hero/iconhero2.png" alt="Détails de Contact" width={120} height={90} className="object-contain" />
                        <p className="text-xs font-bold text-[#000091] mt-2 leading-tight">Détails de Contact&nbsp;:</p>
                        <p className="text-[11px] text-[#3A3A3A] leading-tight mt-0.5">Renseignez les informations de la personne référente.</p>
                      </div>
                    </div>

                    {/* Row 2 */}
                    <div className="flex items-start gap-3 mt-10">
                      {/* Step 3 */}
                      <div className="flex flex-col items-center text-center flex-1">
                        <Image src="/images/hero/iconhero3.png" alt="Informations DAE" width={120} height={90} className="object-contain" />
                        <p className="text-xs font-bold text-[#000091] mt-2 leading-tight">Informations DAE&nbsp;:</p>
                        <p className="text-[11px] text-[#3A3A3A] leading-tight mt-0.5">Détails de localisation et d&apos;appareil.</p>
                      </div>

                      {/* Arrow right */}
                      <div className="flex items-center pt-6 shrink-0">
                        <svg width="32" height="20" viewBox="0 0 32 20" fill="none"><path d="M0 10h26m0 0l-6-6m6 6l-6 6" stroke="#000091" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>

                      {/* Step 4 */}
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
              )}

              {/* Right side — glassmorphism "Comment ça marche" card (variant 2 only) */}
              {heroVariant === 2 && (
                <div className="hidden lg:block lg:flex-shrink-0 lg:w-[460px]">
                  <div className="bg-white/10 backdrop-blur-xl rounded-2xl px-7 py-6 shadow-2xl border border-white/20">
                    <h2 className="font-heading font-bold text-xl text-white mb-10 text-center">
                      Comment ça marche ?
                    </h2>

                    {/* Row 1 */}
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center text-center flex-1">
                        <Image src="/images/hero/iconhero1.png" alt="Recherche d'Entité" width={120} height={90} className="object-contain" />
                        <p className="text-xs font-bold text-white mt-2 leading-tight">Recherche d&apos;Entité&nbsp;:</p>
                        <p className="text-[11px] text-white/70 leading-tight mt-0.5">Trouvez votre structure avec son nom ou SIREN.</p>
                      </div>

                      <div className="flex items-center pt-6 shrink-0">
                        <svg width="32" height="20" viewBox="0 0 32 20" fill="none"><path d="M0 10h26m0 0l-6-6m6 6l-6 6" stroke="white" strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>

                      <div className="flex flex-col items-center text-center flex-1">
                        <Image src="/images/hero/iconhero2.png" alt="Détails de Contact" width={120} height={90} className="object-contain" />
                        <p className="text-xs font-bold text-white mt-2 leading-tight">Détails de Contact&nbsp;:</p>
                        <p className="text-[11px] text-white/70 leading-tight mt-0.5">Renseignez les informations de la personne référente.</p>
                      </div>
                    </div>

                    {/* Row 2 */}
                    <div className="flex items-start gap-3 mt-10">
                      <div className="flex flex-col items-center text-center flex-1">
                        <Image src="/images/hero/iconhero3.png" alt="Informations DAE" width={120} height={90} className="object-contain" />
                        <p className="text-xs font-bold text-white mt-2 leading-tight">Informations DAE&nbsp;:</p>
                        <p className="text-[11px] text-white/70 leading-tight mt-0.5">Détails de localisation et d&apos;appareil.</p>
                      </div>

                      <div className="flex items-center pt-6 shrink-0">
                        <svg width="32" height="20" viewBox="0 0 32 20" fill="none"><path d="M0 10h26m0 0l-6-6m6 6l-6 6" stroke="white" strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>

                      <div className="flex flex-col items-center text-center flex-1">
                        <Image src="/images/hero/iconhero4.png" alt="Soumission" width={120} height={90} className="object-contain" />
                        <p className="text-xs font-bold text-white mt-2 leading-tight">Soumission&nbsp;:</p>
                        <p className="text-[11px] text-white/70 leading-tight mt-0.5">Validation et réception de l&apos;attestation.</p>
                      </div>
                    </div>

                    <div className="mt-8 text-center">
                      <Link href="/declaration">
                        <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 bg-transparent font-medium text-sm px-6">
                          Déclarer mon DAE
                          <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Hero switch dots */}
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setHeroVariant(0)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${heroVariant === 0 ? "bg-white scale-125" : "bg-white/40 hover:bg-white/60"}`}
                aria-label="Hero classique"
              />
              <button
                onClick={() => setHeroVariant(1)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${heroVariant === 1 ? "bg-white scale-125" : "bg-white/40 hover:bg-white/60"}`}
                aria-label="Hero avec étapes"
              />
              <button
                onClick={() => setHeroVariant(2)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${heroVariant === 2 ? "bg-white scale-125" : "bg-white/40 hover:bg-white/60"}`}
                aria-label="Hero glassmorphism"
              />
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
                  <strong>Attention :</strong> Fin 2024, seulement 28 % des DAE installés en France étaient déclarés dans la base nationale Géo'DAE. Le non-respect de cette obligation légale expose à des amendes pouvant atteindre <strong>45 000 €</strong> et à la responsabilité pénale du chef d'établissement.
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
        <section className="bg-white py-10 sm:py-14 border-b border-[#E5E5E5]">
          <div className="container">
            <ScrollReveal>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
                <StatCounter end={46000} label="Arrêts cardiaques par an" sublabel="en France" />
                <StatCounter end={92} suffix="%" label="Taux de mortalité" sublabel="sans intervention rapide" />
                <StatCounter end={5} suffix=" min" label="Temps moyen de déclaration" sublabel="sur notre plateforme" />
                <StatCounter end={45000} prefix="" suffix=" €" label="Amende maximale" sublabel="en cas de non-conformité" />
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
                    46 000 vies en jeu chaque année
                  </h3>
                  <p className="text-sm text-[#666] leading-relaxed">
                    En France, entre 40 000 et 50 000 personnes sont victimes d'une mort subite par arrêt cardiaque chaque année. Le taux de survie n'est que de 5 à 8 %, l'un des plus bas d'Europe. Chaque minute sans défibrillation réduit les chances de survie de 7 à 10 %. Un DAE accessible et localisable peut multiplier les chances de survie par 4.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={200}>
                <div className="bg-white rounded border border-[#E5E5E5] p-4 sm:p-6 h-full">
                  <div className="flex items-center justify-center w-11 h-11 rounded bg-[#EFF6FF] mb-4">
                    <MapPin className="w-5 h-5 text-[#000091]" />
                  </div>
                  <h3 className="font-heading font-bold text-base text-[#161616] mb-2">
                    72 % des DAE restent invisibles
                  </h3>
                  <p className="text-sm text-[#666] leading-relaxed">
                    Fin 2024, seulement 28 % des défibrillateurs installés en France étaient déclarés dans la base nationale Géo'DAE. Cela signifie que plus de 7 DAE sur 10 sont introuvables par les services de secours et les citoyens en situation d'urgence. Un DAE non déclaré est un DAE qui ne sauvera personne.
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
          <img
            src={CDN.urgence}
            alt="Intervention d'urgence avec un défibrillateur automatisé externe"
            className="w-full h-full object-cover"
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
          subtitle="72% des défibrillateurs en France ne sont pas déclarés. Et le vôtre ?"
          buttonText="Déclarer en 5 minutes"
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
                  Vos 4 obligations en tant qu'exploitant de DAE
                </h2>
                <p className="text-[#666] text-base leading-relaxed">
                  En tant que propriétaire ou exploitant d'un défibrillateur automatisé externe, la réglementation française vous impose quatre obligations distinctes. Le non-respect de ces obligations engage votre responsabilité civile et pénale.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 max-w-4xl mx-auto">
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
                <div className="border-l-4 border-[#18753C] bg-[#F0FDF4] p-3 sm:p-5 rounded-r">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="w-5 h-5 text-[#18753C]" />
                    <h3 className="font-heading font-bold text-base text-[#161616]">
                      3. Obligation d'assurance
                    </h3>
                  </div>
                  <p className="text-sm text-[#666] leading-relaxed">
                    Les exploitants, producteurs et fournisseurs de DAE doivent souscrire une assurance destinée à garantir leur responsabilité civile ou administrative, conformément au code de la santé publique.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={400}>
                <div className="border-l-4 border-[#92400E] bg-[#FEF9C3] p-3 sm:p-5 rounded-r">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-5 h-5 text-[#92400E]" />
                    <h3 className="font-heading font-bold text-base text-[#161616]">
                      4. Obligation de signalétique
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
                          <td className="py-2">Plus de 300 personnes</td>
                        </tr>
                        <tr className="border-b border-[#000091]/10">
                          <td className="py-2 pr-2 sm:pr-4 font-medium text-xs sm:text-sm">1er janvier 2021</td>
                          <td className="py-2 pr-2 sm:pr-4 text-xs sm:text-sm">Catégorie 4</td>
                          <td className="py-2">300 personnes et moins</td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-2 sm:pr-4 font-medium text-xs sm:text-sm">1er janvier 2022</td>
                          <td className="py-2 pr-2 sm:pr-4 text-xs sm:text-sm">Certains ERP de catégorie 5</td>
                          <td className="py-2 text-xs sm:text-sm">Selon seuils réglementaires</td>
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
                  <p className="text-sm text-[#7F1D1D] leading-relaxed">
                    Le non-respect des obligations relatives aux DAE peut entraîner des <strong>amendes pouvant atteindre 45 000 €</strong>, la <strong>fermeture temporaire ou définitive</strong> de l'établissement, et l'engagement de la <strong>responsabilité pénale</strong> du chef d'établissement en cas d'arrêt cardiaque mortel. Ne prenez pas ce risque : déclarez votre DAE dès maintenant.
                  </p>
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
                { icon: Building2, label: "ERP catégories 1 à 5", desc: "Commerces, restaurants, hôtels, salles de sport, cinémas..." },
                { icon: Landmark, label: "Collectivités territoriales", desc: "Mairies, communautés de communes, départements, régions..." },
                { icon: Users, label: "Entreprises", desc: "Bureaux, usines, entrepôts, sièges sociaux..." },
                { icon: Heart, label: "Associations", desc: "Clubs sportifs, associations culturelles, MJC..." },
                { icon: LifeBuoy, label: "Établissements de santé", desc: "Cabinets médicaux, pharmacies, cliniques..." },
                { icon: Phone, label: "Particuliers", desc: "Copropriétés, résidences, lieux privés accessibles..." },
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
          title="Attestation de conformité délivrée sous 24 heures"
          subtitle="Conforme au décret n°2018-1259 et à l'arrêté du 29 octobre 2019"
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
                  Un service automatisé pour une déclaration sans effort
                </h2>
                <p className="text-[#666] text-base leading-relaxed">
                  La procédure officielle de déclaration peut s'avérer complexe et chronophage. Notre plateforme simplifie chaque étape pour vous permettre de vous mettre en conformité rapidement, sans erreur, et avec une attestation officielle.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto items-center">
              <ScrollReveal>
                <img
                  src={CDN.formulaire}
                  alt="Interface simplifiée de déclaration de défibrillateur en ligne"
                  className="w-full rounded shadow-lg border border-[#E5E5E5]"
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
                      title: "Attestation de déclaration",
                      desc: "Vous recevez par email une attestation officielle de déclaration sous 24 heures, prouvant votre mise en conformité auprès des autorités compétentes.",
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
                <img
                  src={CDN.etapes}
                  alt="Les 3 étapes simples pour déclarer votre défibrillateur en ligne"
                  className="w-full rounded shadow-md border border-[#E5E5E5]"
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
          <img
            src={CDN.conformite}
            alt="Certificat de conformité et défibrillateur automatisé externe"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-[#000091]/80 to-transparent flex items-center justify-end">
            <div className="container-narrow text-right">
              <div className="max-w-lg ml-auto">
                <p className="text-white font-heading font-bold text-lg sm:text-xl lg:text-2xl leading-snug mb-2">
                  Votre attestation de conformité en 24h
                </p>
                <p className="text-white/70 text-sm mb-4">
                  Conforme au décret n°2018-1259 et à l'arrêté du 29 octobre 2019
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
                      { critere: "Attestation officielle", classique: "Non fournie", notre: "Sous 24h" },
                      { critere: "Accompagnement", classique: "Aucun", notre: "Personnalisé" },
                      { critere: "Rappels de maintenance", classique: "Non", notre: "Automatiques" },
                      { critere: "Support en cas de difficulté", classique: "Email générique", notre: "Dédié" },
                      { critere: "Déclaration multiple", classique: "Un par un", notre: "En lot" },
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

        {/* ===== TÉMOIGNAGES ===== */}
        <section className="bg-[#F6F6F6] py-10 sm:py-16">
          <div className="container">
            <ScrollReveal>
              <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-10">
                <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#000091] mb-3">
                  Ils nous font confiance
                </span>
                <h2 className="font-heading font-bold text-2xl sm:text-3xl text-[#161616] mb-4">
                  Ce que disent les exploitants qui ont déclaré leur DAE
                </h2>
                <p className="text-[#666] text-base leading-relaxed">
                  Plus de 2 500 défibrillateurs ont été déclarés grâce à notre plateforme. Voici les retours de nos utilisateurs.
                </p>
              </div>
            </ScrollReveal>

            <Testimonials />

            {/* CTA après témoignages */}
            <ScrollReveal>
              <div className="max-w-md mx-auto mt-10 text-center">
                <p className="text-sm text-[#666] mb-3">Rejoignez les milliers d'exploitants en conformité.</p>
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
                { ref: "Loi n°2018-527 du 28 juin 2018", desc: "Relative au défibrillateur cardiaque — Instaure l'obligation d'équipement des ERP et la création de la base de données nationale." },
                { ref: "Décret n°2018-1186 du 19 décembre 2018", desc: "Relatif aux défibrillateurs automatisés externes — Précise les catégories d'ERP soumis à l'obligation et le calendrier de mise en œuvre." },
                { ref: "Décret n°2018-1259 du 27 décembre 2018", desc: "Relatif à la base de données nationale des DAE — Définit l'obligation de déclaration et les modalités de fonctionnement de Géo'DAE." },
                { ref: "Arrêté du 29 octobre 2019", desc: "Relatif au fonctionnement de la base de données des DAE — Définit le standard de données, les informations obligatoires et les modalités de déclaration." },
                { ref: "Décret n°2007-705 du 4 mai 2007", desc: "Relatif à l'utilisation des DAE par des personnes non-médecins — Autorise toute personne à utiliser un DAE, quel que soit son âge." },
              ].map((item, i) => (
                <ScrollReveal key={i} delay={i * 80}>
                  <div className="bg-[#F6F6F6] border border-[#E5E5E5] rounded p-4 flex items-start gap-3">
                    <Gavel className="w-5 h-5 text-[#000091] shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-heading font-semibold text-sm text-[#000091] mb-0.5">{item.ref}</h3>
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
                Rejoignez les milliers d'exploitants qui ont déjà mis leur défibrillateur en conformité grâce à notre service simplifié. Protégez vos usagers, protégez-vous.
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
