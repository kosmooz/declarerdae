"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { AlertTriangle, Building2, Heart, Activity } from "lucide-react";
import { SCENARIOS } from "@/data/landing-content";

const iconMap = { Building2, Heart, Activity };

function ScrollReveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay, ease: "easeOut" }} className={className}>
      {children}
    </motion.div>
  );
}

export default function ProblemSection() {
  return (
    <section className="py-14 md:py-20 bg-gray-50">
      <div className="container">
        <ScrollReveal>
          <div className="max-w-3xl mx-auto text-center mb-10">
            <div className="inline-flex items-center gap-2 text-[#d92d20] text-xs font-bold uppercase tracking-wider mb-3 font-sans">
              <AlertTriangle className="w-4 h-4" />
              Le constat alarmant
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl text-gray-900 mb-4 leading-tight">
              Chaque année, <span className="text-[#d92d20]">50 000 personnes</span> meurent d'un arrêt cardiaque en France
            </h2>
            <p className="text-base text-gray-600 font-sans leading-relaxed mb-6">
              Un arrêt cardiaque peut survenir n'importe où. Le taux de survie sans défibrillateur est inférieur à 5%. Avec un DAE utilisé dans les 3 premières minutes, ce taux monte à plus de 70%.
            </p>
          </div>
        </ScrollReveal>

        {/* Mini stat cards */}
        <ScrollReveal delay={0.1}>
          <div className="grid grid-cols-3 gap-3 md:gap-4 max-w-2xl mx-auto mb-10">
            {[
              { value: "93%", label: "des arrêts surviennent hors hôpital" },
              { value: "<5%", label: "taux de survie sans DAE" },
              { value: "70%+", label: "de survie avec DAE dans les 3 min" },
            ].map((stat, i) => (
              <div key={i} className="bg-red-50 rounded-xl p-3 md:p-4 text-center border border-red-100">
                <div className="text-xl md:text-2xl font-bold text-[#d92d20] font-sans">{stat.value}</div>
                <p className="text-xs text-gray-600 font-sans mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Quote callout */}
        <ScrollReveal delay={0.15}>
          <div className="bg-white rounded-xl p-5 border-l-4 border-[#d92d20] max-w-2xl mx-auto mb-10">
            <p className="text-gray-800 font-semibold font-sans text-sm md:text-base italic">
              "La question n'est pas 'est-ce que ça va arriver ?' mais 'serez-vous prêt quand ça arrivera ?'"
            </p>
          </div>
        </ScrollReveal>

        {/* Scenario cards - horizontal scroll on mobile */}
        <ScrollReveal delay={0.2}>
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 scrollbar-hide md:grid md:grid-cols-3 md:overflow-visible md:mx-0 md:px-0">
            {SCENARIOS.map((item, i) => {
              const Icon = iconMap[item.iconName];
              return (
                <div key={i} className="min-w-[280px] snap-center md:min-w-0 bg-white rounded-2xl p-5 border border-gray-200 hover:border-[#d92d20]/30 transition-colors flex flex-col">
                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-[#d92d20] mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-gray-700 font-sans text-sm mb-3 leading-relaxed flex-1">{item.scenario}</p>
                  <p className="text-[#d92d20] font-bold font-sans text-xs">{item.question}</p>
                </div>
              );
            })}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <p className="text-center text-sm text-gray-600 font-sans mt-6">
            <strong>Bonne nouvelle :</strong> le défibrillateur ZOLL guide vocalement chaque étape. <strong>Tout le monde peut sauver une vie.</strong>
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
