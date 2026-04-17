"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Scale, Building2, Users, MapPin, Heart, AlertTriangle, Ban, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ERP_CATEGORIES } from "@/data/landing-content";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = { Building2, Users, MapPin, Heart };

function ScrollReveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay, ease: "easeOut" }} className={className}>
      {children}
    </motion.div>
  );
}

export default function RegulationSection() {
  return (
    <section id="reglementation" className="py-14 md:py-20 bg-gray-100">
      <div className="container">
        <ScrollReveal>
          <div className="max-w-3xl mx-auto text-center mb-10">
            <div className="inline-flex items-center gap-2 text-[#d92d20] text-xs font-bold uppercase tracking-wider mb-3 font-sans">
              <Scale className="w-4 h-4" />
              Réglementation
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl text-gray-900 mb-4">
              La loi vous <span className="text-[#d92d20]">oblige</span> à vous équiper
            </h2>
            <p className="text-base text-gray-600 font-sans leading-relaxed">
              Depuis le décret n°2018-1186, de nombreux ERP sont tenus de s'équiper d'un défibrillateur. Cette obligation s'applique à La Réunion.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
            {ERP_CATEGORIES.map((item, i) => {
              const Icon = iconMap[item.iconName];
              return (
                <div key={i} className="bg-white rounded-xl p-4 md:p-5 text-center border border-gray-200">
                  <div className="w-10 h-10 bg-[#d92d20] rounded-xl flex items-center justify-center mx-auto mb-3 text-white">
                    {Icon && <Icon className="w-5 h-5" />}
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm mb-1 font-sans">{item.title}</h4>
                  <p className="text-xs text-gray-500 font-sans">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 md:p-8 max-w-3xl mx-auto mb-6">
            <h3 className="text-base font-bold text-gray-900 mb-4 font-sans text-center flex items-center justify-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#d92d20]" />
              Sanctions en cas de non-conformité
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl md:text-3xl font-bold text-[#d92d20] font-sans">75 000€</div>
                <p className="text-xs text-gray-600 font-sans mt-1">d'amende maximale</p>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-[#d92d20] font-sans">5 ans</div>
                <p className="text-xs text-gray-600 font-sans mt-1">d'emprisonnement</p>
              </div>
              <div>
                <Ban className="w-7 h-7 md:w-8 md:h-8 text-[#d92d20] mx-auto" />
                <p className="text-xs text-gray-600 font-sans mt-1">Fermeture établissement</p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.25}>
          <details className="max-w-3xl mx-auto mb-6">
            <summary className="text-xs text-gray-500 font-sans cursor-pointer hover:text-gray-700 text-center">
              Textes de référence
            </summary>
            <p className="text-xs text-gray-400 font-sans text-center mt-2 leading-relaxed">
              Décret 2007-705 du 4 mai 2007 · Loi n°2018-527 du 28 juin 2018 · Arrêté du 29 octobre 2019 · Art. R4224-15 et R4224-16 du Code du travail
            </p>
          </details>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <div className="text-center">
            <Button onClick={() => document.getElementById("rdv")?.scrollIntoView({ behavior: "smooth" })} className="bg-[#d92d20] hover:bg-[#b91c1c] text-white font-bold text-sm px-6 py-5">
              Mettez-vous en conformité
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
