"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Users, Star, Award, ShieldCheck, BookOpen } from "lucide-react";
import { TESTIMONIALS, TRUST_LOGOS, CERTIFICATIONS } from "@/data/landing-content";

const certIconMap: Record<string, React.ComponentType<{ className?: string }>> = { Award, ShieldCheck, BookOpen };

function ScrollReveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay, ease: "easeOut" }} className={className}>
      {children}
    </motion.div>
  );
}

export default function SocialProofSection() {
  return (
    <section id="temoignages" className="py-14 md:py-20 bg-gray-50">
      <div className="container">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 text-[#d92d20] text-xs font-bold uppercase tracking-wider mb-3 font-sans">
              <Users className="w-4 h-4" />
              Témoignages réunionnais
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl text-gray-900 mb-3">
              Ce que disent <span className="text-[#d92d20]">nos clients</span>
            </h2>
          </div>
        </ScrollReveal>

        {/* Testimonial cards - horizontal scroll on mobile */}
        <ScrollReveal delay={0.1}>
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 scrollbar-hide md:grid md:grid-cols-3 md:overflow-visible md:mx-0 md:px-0">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="min-w-[300px] snap-center md:min-w-0 bg-white rounded-2xl p-5 border border-gray-200 flex flex-col">
                <div className="flex mb-2">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <blockquote className="text-gray-700 font-sans text-sm leading-relaxed mb-4 flex-1 italic">
                  "{t.quote}"
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#d92d20] rounded-full flex items-center justify-center text-white font-bold font-sans text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 font-sans text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500 font-sans">{t.role} · {t.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Trust logos marquee */}
        <ScrollReveal delay={0.2}>
          <div className="mt-10 mb-8">
            <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider mb-5 font-sans">
              Plus de 1 000 structures nous font confiance
            </p>
            <div className="overflow-hidden">
              <div className="flex animate-marquee hover:[animation-play-state:paused]">
                {[...TRUST_LOGOS, ...TRUST_LOGOS].map((name, i) => (
                  <div key={i} className="shrink-0 px-6 md:px-8">
                    <span className="text-base md:text-lg font-bold text-gray-300 font-sans whitespace-nowrap">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Certifications */}
        <ScrollReveal delay={0.3}>
          <div className="flex flex-wrap justify-center gap-3">
            {CERTIFICATIONS.map((cert, i) => {
              const Icon = certIconMap[cert.iconName];
              return (
                <div key={i} className="bg-white rounded-full px-4 py-2 border border-gray-200 flex items-center gap-2">
                  {Icon && <Icon className="w-4 h-4 text-[#d92d20]" />}
                  <span className="text-xs font-semibold text-gray-700 font-sans">{cert.title}</span>
                </div>
              );
            })}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
