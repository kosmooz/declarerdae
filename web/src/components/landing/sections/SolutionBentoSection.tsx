"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  CheckCircle2, ArrowRight, Wrench, GraduationCap,
  Activity, ShieldCheck, Award, Truck, Zap, Building2, Eye,
  FileCheck, Timer, Heart, PhoneCall
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IMAGES, INCLUDED_FEATURES, PRODUCT_SPECS } from "@/data/landing-content";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap, Building2, Eye, FileCheck, Wrench, Timer, Heart,
  GraduationCap, Award, PhoneCall, Activity, ShieldCheck, Truck,
};

function ScrollReveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay, ease: "easeOut" }} className={className}>
      {children}
    </motion.div>
  );
}

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export default function SolutionBentoSection() {
  return (
    <section id="offre" className="py-16 md:py-24 bg-white">
      <div className="container max-w-5xl">
        <ScrollReveal>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 text-[#d92d20] text-xs font-bold uppercase tracking-wider mb-3 font-sans">
              <Heart className="w-4 h-4" />
              L'offre Premium
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl text-gray-900 mb-3">
              Un abonnement <span className="text-[#d92d20]">tout compris</span> pour votre sécurité
            </h2>
            <p className="text-base text-gray-600 font-sans">
              STAR aid prend tout en charge. Vous n'avez rien à gérer.
            </p>
          </div>
        </ScrollReveal>

        {/* Pricing card - full width, horizontal layout */}
        <ScrollReveal>
          <div className="bg-gray-900 rounded-2xl p-6 md:p-8 text-white mb-5">
            <div className="md:flex md:items-center md:gap-10">
              {/* Left: price + badges */}
              <div className="shrink-0 mb-5 md:mb-0 md:text-center">
                <p className="text-xs font-bold text-[#d92d20] uppercase tracking-wider mb-2 font-sans">Abonnement mensuel</p>
                <div className="flex items-baseline gap-1 md:justify-center">
                  <span className="text-5xl font-bold font-sans">89</span>
                  <div className="text-left">
                    <span className="text-xl text-gray-400 font-sans">€</span>
                    <p className="text-xs text-gray-500 font-sans">TTC / mois</p>
                  </div>
                </div>
                <p className="text-gray-400 font-sans text-sm mt-1">soit moins de 3€/jour</p>
                <div className="flex flex-wrap gap-2 mt-3 md:justify-center">
                  {["Sans engagement", "Sans caution"].map((badge) => (
                    <span key={badge} className="bg-green-500/10 text-green-400 text-xs font-semibold px-3 py-1 rounded-full font-sans">{badge}</span>
                  ))}
                </div>
              </div>
              {/* Right: features in 2 columns */}
              <div className="flex-1 border-t border-white/10 pt-5 md:border-t-0 md:pt-0 md:border-l md:pl-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
                  {INCLUDED_FEATURES.map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#d92d20] shrink-0" />
                      <span className="text-sm text-gray-300 font-sans">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Link href="/souscrire" className="flex-1">
                <Button className="w-full bg-[#d92d20] hover:bg-[#b91c1c] text-white font-bold py-5 text-sm">
                  Souscrire en ligne
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Button variant="ghost" onClick={() => scrollToSection("rdv")} className="flex-1 border border-white/30 text-white hover:bg-white/10 hover:text-white font-semibold py-5 text-sm">
                Prendre rendez-vous
              </Button>
            </div>
          </div>
        </ScrollReveal>

        {/* 3 cards row: product + maintenance + formation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Equipment card */}
          <ScrollReveal delay={0.1}>
            <div id="produit" className="bg-white rounded-2xl border border-gray-200 overflow-hidden h-full flex flex-col">
              <div className="relative p-4 bg-gray-50 flex items-center justify-center">
                <Image src={IMAGES.defibArmoire} alt="Défibrillateur ZOLL AED" width={160} height={144} className="h-36 w-auto object-contain" />
                <div className="absolute top-3 left-3 bg-[#d92d20] text-white rounded-full px-3 py-1 text-xs font-bold font-sans">
                  N°1 mondial
                </div>
              </div>
              <div className="p-5 flex-1">
                <h3 className="text-base font-bold text-gray-900 mb-3 font-sans">ZOLL AED Plus</h3>
                <div className="space-y-2.5">
                  {PRODUCT_SPECS.map((spec, i) => {
                    const Icon = iconMap[spec.iconName];
                    return (
                      <div key={i} className="flex gap-2.5 items-start">
                        <div className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center text-[#d92d20] shrink-0">
                          {Icon && <Icon className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-xs font-sans">{spec.label}</p>
                          <p className="text-gray-500 text-xs font-sans">{spec.value}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Maintenance card */}
          <ScrollReveal delay={0.15}>
            <div className="bg-red-50 rounded-2xl p-5 border border-red-100 h-full flex flex-col">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#d92d20] mb-3 shadow-sm">
                <Wrench className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1.5 font-sans">Maintenance & suivi</h3>
              <p className="text-sm text-gray-600 font-sans mb-3">30% des DAE en France sont hors service. Pas les nôtres.</p>
              <div className="space-y-2 mb-4 flex-1">
                {["Contrôles réguliers documentés", "Intervention sous 48h", "Prêt de matériel si besoin"].map((p) => (
                  <div key={p} className="flex items-center gap-2 text-sm text-gray-700 font-sans">
                    <CheckCircle2 className="w-4 h-4 text-[#d92d20] shrink-0" />
                    {p}
                  </div>
                ))}
              </div>
              <Image src={IMAGES.maintenanceTech} alt="Maintenance" width={400} height={112} className="rounded-xl w-full h-28 object-cover" />
            </div>
          </ScrollReveal>

          {/* Formation card */}
          <ScrollReveal delay={0.2}>
            <div className="bg-white rounded-2xl p-5 border border-gray-200 h-full flex flex-col">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-[#d92d20] mb-3">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1.5 font-sans">Formation certifiée Qualiopi</h3>
              <p className="text-sm text-gray-600 font-sans mb-3">Formations accessibles, concrètes, pour que chacun ose agir.</p>
              <div className="space-y-2 mb-4 flex-1">
                {["Certifié Qualiopi", "Formation digitale incluse", "SST, premiers secours, DAE"].map((p) => (
                  <div key={p} className="flex items-center gap-2 text-sm text-gray-700 font-sans">
                    <CheckCircle2 className="w-4 h-4 text-[#d92d20] shrink-0" />
                    {p}
                  </div>
                ))}
              </div>
              <Image src={IMAGES.teamFormation} alt="Formation" width={400} height={112} className="rounded-xl w-full h-28 object-cover" />
            </div>
          </ScrollReveal>
        </div>

        {/* AED3 banner */}
        <ScrollReveal delay={0.25}>
          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 mt-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 font-sans mb-1">Également disponible : ZOLL AED3</h3>
                <p className="text-sm text-gray-600 font-sans">Écran LCD HD · Électrodes universelles · Mode pédiatrique · Garantie 8 ans</p>
              </div>
              <Link href="/defibrillateur">
                <Button variant="outline" className="border-[#d92d20] text-[#d92d20] hover:bg-red-50 font-semibold text-sm shrink-0">
                  Découvrir le ZOLL AED 3
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
