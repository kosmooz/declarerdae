"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  ChevronDown,
  ArrowRight,
  Monitor,
  Activity,
  Cpu,
  Users,
  ShieldCheck,
  CreditCard,
  GraduationCap,
} from "lucide-react";
import Image from "next/image";
import {
  AED3_FEATURES,
  AED3_SPECS,
  AED3_USAGE_STEPS,
  AED3_CTA_POINTS,
} from "@/data/defibrillateur-content";
import { IMAGES } from "@/data/landing-content";
import DefibrillatorHeader from "./DefibrillatorHeader";

const featureIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Monitor,
  Activity,
  Cpu,
  Users,
};

const ctaIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  ShieldCheck,
  CreditCard,
  GraduationCap,
};

function ScrollReveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function MobileFallback() {
  return (
    <div className="min-h-screen bg-white">
      <DefibrillatorHeader />

      {/* Hero */}
      <section className="pt-20 pb-12 px-5">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-[#d92d20]/10 text-[#d92d20] text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full mb-4 font-sans">
            Par ZOLL Medical
          </div>
          <h1 className="text-4xl text-gray-900 mb-3 leading-tight">
            ZOLL AED 3
          </h1>
          <p className="text-lg text-gray-600 font-sans font-light mb-6">
            Le défibrillateur qui sauve des vies
          </p>
          <Image
            src={IMAGES.defibArmoire}
            alt="ZOLL AED 3"
            width={192}
            height={192}
            className="w-48 h-auto mx-auto mb-6"
          />
          <a
            href="/souscrire"
            className="inline-flex items-center gap-2 bg-[#d92d20] hover:bg-[#b91c1c] text-white font-bold px-6 py-3 rounded-lg text-sm transition-colors font-sans mb-6"
          >
            Souscrire maintenant
            <ArrowRight className="w-4 h-4" />
          </a>
          <ChevronDown className="w-5 h-5 text-gray-400 mx-auto animate-bounce" />
        </div>
      </section>

      {/* Features */}
      <section className="py-12 px-5 bg-gray-50">
        <ScrollReveal>
          <h2 className="text-3xl text-gray-900 mb-8 text-center">
            Conçu pour <span className="text-[#d92d20]">sauver</span>
          </h2>
        </ScrollReveal>
        <div className="space-y-4 max-w-md mx-auto">
          {AED3_FEATURES.map((feature, i) => {
            const Icon = featureIcons[feature.iconName];
            return (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-[#d92d20] shrink-0">
                      {Icon && <Icon className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm font-sans mb-0.5">
                        {feature.title}
                      </h3>
                      <p className="text-xs text-gray-500 font-sans leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* Specs */}
      <section className="py-12 px-5 bg-gray-900">
        <ScrollReveal>
          <h2 className="text-3xl text-white mb-8 text-center">
            La technologie au service{" "}
            <span className="text-[#d92d20]">de la vie</span>
          </h2>
        </ScrollReveal>
        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
          {AED3_SPECS.map((spec, i) => (
            <ScrollReveal key={i} delay={i * 0.08}>
              <div className="glass-card p-4 text-center">
                <div className="text-xl font-bold text-[#d92d20] font-sans mb-0.5">
                  {spec.value}
                </div>
                <div className="text-xs font-semibold text-white font-sans mb-0.5">
                  {spec.label}
                </div>
                <div className="text-[10px] text-gray-400 font-sans">
                  {spec.description}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Usage */}
      <section className="py-12 px-5 bg-white">
        <ScrollReveal>
          <h2 className="text-3xl text-gray-900 mb-8 text-center">
            Simple <span className="text-[#d92d20]">d'utilisation</span>
          </h2>
        </ScrollReveal>
        <div className="relative pl-8 max-w-md mx-auto">
          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-[#d92d20]" />
          <div className="space-y-5">
            {AED3_USAGE_STEPS.map((step, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="relative">
                  <div className="absolute -left-8 top-1 w-6 h-6 rounded-full bg-[#d92d20] flex items-center justify-center">
                    <span className="text-white text-xs font-bold font-sans">
                      {step.step}
                    </span>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <h3 className="font-bold text-gray-900 text-sm font-sans mb-1">
                      {step.title}
                    </h3>
                    <p className="text-xs text-gray-500 font-sans leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-5 bg-gray-50">
        <ScrollReveal>
          <div className="text-center max-w-md mx-auto">
            <h2 className="text-3xl text-gray-900 mb-3">
              Protégez vos{" "}
              <span className="text-[#d92d20]">collaborateurs</span>
            </h2>
            <p className="text-gray-500 font-sans mb-8">
              Un investissement vital pour la sécurité de votre établissement
            </p>
          </div>
        </ScrollReveal>

        <div className="space-y-3 max-w-md mx-auto mb-8">
          {AED3_CTA_POINTS.map((point, i) => {
            const Icon = ctaIcons[point.iconName];
            return (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-[#d92d20] shrink-0">
                    {Icon && <Icon className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm font-sans">
                      {point.title}
                    </h3>
                    <p className="text-xs text-gray-500 font-sans">
                      {point.description}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        <ScrollReveal delay={0.3}>
          <div className="flex flex-col gap-3 max-w-md mx-auto">
            <a
              href="/souscrire"
              className="flex items-center justify-center gap-2 bg-[#d92d20] hover:bg-[#b91c1c] text-white font-bold px-6 py-4 rounded-lg text-base transition-colors font-sans shadow-lg shadow-red-500/20"
            >
              Souscrire maintenant
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="/#rdv"
              className="flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-700 font-semibold px-6 py-4 rounded-lg text-base transition-colors font-sans"
            >
              Prendre rendez-vous
            </a>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
