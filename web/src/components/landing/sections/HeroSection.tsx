"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Shield, Check, ArrowRight, ChevronDown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCounter } from "@/hooks/useCounter";
import { IMAGES, STATS, HERO_FEATURES, HERO_BADGES } from "@/data/landing-content";
import Link from "next/link";

function StatCounter({ end, suffix, label }: { end: number; suffix: string; label: string }) {
  const { count, ref } = useCounter(end, 2500);
  return (
    <div ref={ref} className="text-center px-2">
      <div className="text-2xl md:text-3xl font-bold font-sans text-white">
        {end >= 1000 ? count.toLocaleString("fr-FR") : count}{suffix}
      </div>
      <p className="text-xs text-white/70 font-sans mt-1">{label}</p>
    </div>
  );
}

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export default function HeroSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <section id="hero" className="relative pt-14 md:pt-16 overflow-hidden">
      <div className="relative min-h-[85vh] flex flex-col justify-center">
        <div className="absolute inset-0">
          <img src={IMAGES.heroBg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/20" />
        </div>

        <div className="relative container !max-w-[1100px] grid lg:grid-cols-2 gap-6 items-center py-12 md:py-16">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-white max-w-xl"
          >
            <div className="inline-flex items-center gap-2 bg-[#d92d20] text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
              <Shield className="w-3.5 h-3.5" />
              N°1 à La Réunion depuis 2012
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl leading-tight mb-4">
              Protégez vos équipes.
              <br />
              <span className="text-[#d92d20]">Sauvez des vies.</span>
            </h1>
            <p className="text-base md:text-lg text-gray-200 mb-2 font-sans leading-relaxed">
              La solution tout-en-un pour équiper votre entreprise d'un défibrillateur à <strong className="text-white">La Réunion</strong>.
            </p>
            <p className="text-base md:text-lg text-gray-200 mb-4 font-sans leading-relaxed">
              Matériel, installation, formation, maintenance.
              <strong className="text-white"> Tout compris à partir de 89&nbsp;€&nbsp;TTC/mois.</strong>
            </p>
            <div className="flex flex-wrap gap-3 text-sm text-gray-300 mb-6">
              {HERO_BADGES.map((badge) => (
                <span key={badge} className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-green-400" /> {badge}
                </span>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/souscrire">
                <Button size="lg" className="bg-[#d92d20] hover:bg-[#b91c1c] text-white font-bold text-sm px-6 py-5 shadow-lg shadow-red-900/30">
                  Souscrire en ligne
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Button size="lg" variant="ghost" onClick={() => scrollToSection("offre")} className="border border-white/30 text-white hover:bg-white/10 hover:text-white font-semibold text-sm px-6 py-5">
                Découvrir l&apos;offre
              </Button>
            </div>
          </motion.div>

          {/* Price card - desktop only */}
          <div className="hidden lg:block">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              className="bg-white rounded-2xl overflow-hidden shadow-2xl shadow-black/20 max-w-[340px] ml-auto"
            >
              {/* Header band */}
              <div className="bg-gradient-to-r from-[#d92d20] to-[#b91c1c] px-6 py-4 text-center">
                <p className="text-[11px] font-semibold text-white/80 uppercase tracking-[0.15em] mb-1">Abonnement tout compris</p>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-5xl font-extrabold text-white font-sans leading-none">89€</span>
                  <div className="flex flex-col items-start leading-none gap-1.5">
                    <span className="text-[11px] font-semibold text-white/70 font-sans">TTC</span>
                    <span className="text-[11px] text-white/50 font-sans">/mois</span>
                  </div>
                </div>
                <p className="text-white/60 text-[11px] mt-1 font-sans">soit moins de 3€/jour</p>
              </div>

              {/* Features */}
              <div className="px-6 py-5">
                <div className="grid grid-cols-1 gap-2.5">
                  {HERO_FEATURES.map((item) => (
                    <div key={item} className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-[#d92d20]" />
                      </div>
                      <span className="text-[13px] text-gray-700 font-sans">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="px-6 pb-5">
                <Link href="/souscrire" className="block">
                  <Button className="w-full bg-[#d92d20] hover:bg-[#b91c1c] text-white font-bold py-5 text-sm shadow-lg shadow-red-900/20">
                    Souscrire maintenant
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <div className="flex items-center justify-center gap-3 mt-3">
                  <span className="flex items-center gap-1 text-[11px] text-gray-400 font-sans">
                    <Zap className="w-3 h-3" /> Sans engagement
                  </span>
                  <span className="text-gray-300">·</span>
                  <span className="flex items-center gap-1 text-[11px] text-gray-400 font-sans">
                    <Zap className="w-3 h-3" /> Sans caution
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Stats bar - integrated in hero */}
        <div className="relative container pb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-5 md:p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {STATS.map((stat, i) => (
                <StatCounter key={i} end={stat.end} suffix={stat.suffix} label={stat.label} />
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-white/50" />
        </div>
      </div>
    </section>
  );
}
