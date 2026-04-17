"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Calendar, Phone } from "lucide-react";
import AppointmentCalendar from "@/components/landing/AppointmentCalendar";
import { CONTACT } from "@/data/landing-content";

function ScrollReveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay, ease: "easeOut" }} className={className}>
      {children}
    </motion.div>
  );
}

export default function AppointmentSection() {
  return (
    <section id="rdv" className="py-14 md:py-20 bg-gradient-to-b from-red-50/50 to-white">
      <div className="container">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 text-[#d92d20] text-xs font-bold uppercase tracking-wider mb-3 font-sans">
              <Calendar className="w-4 h-4" />
              Prenez rendez-vous
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl text-gray-900 mb-3">
              Parlez à un <span className="text-[#d92d20]">conseiller</span>
            </h2>
            <p className="text-base text-gray-600 font-sans">
              Un conseiller STAR aid basé à La Réunion vous rappellera pour répondre à toutes vos questions.
            </p>
          </div>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <AppointmentCalendar />
        </ScrollReveal>
        <ScrollReveal delay={0.2}>
          <div className="text-center mt-8 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 font-sans mb-2">Ou appelez-nous directement</p>
            <a href={CONTACT.phoneHref} className="inline-flex items-center gap-2 text-[#d92d20] font-bold text-lg font-sans hover:underline">
              <Phone className="w-5 h-5" />
              {CONTACT.phone}
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
