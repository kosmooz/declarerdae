"use client";

import { useRef } from "react";
import { ShieldCheck, CreditCard, GraduationCap, ArrowRight } from "lucide-react";
import { AED3_CTA_POINTS } from "@/data/defibrillateur-content";
import { useScrollFrame } from "@/hooks/useScrollAnimation";
import type { ScrollData } from "@/hooks/useScrollAnimation";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ShieldCheck,
  CreditCard,
  GraduationCap,
};

export default function CTAOverlay({ scrollRef }: { scrollRef: React.RefObject<ScrollData | null> }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useScrollFrame(scrollRef, (offset, range) => {
    if (!containerRef.current) return;
    const fadeIn = range(0.75, 0.08);
    containerRef.current.style.opacity = String(Math.max(0, fadeIn));
  });

  return (
    <div
      ref={containerRef}
      className="absolute top-[400vh] left-0 w-full h-screen flex flex-col items-center justify-end pb-[4vh] pointer-events-auto"
      style={{ opacity: 0 }}
    >
      <div className="container max-w-3xl px-6 md:px-12 text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl text-gray-900 mb-4">
          Protégez vos{" "}
          <span className="text-[#d92d20]">collaborateurs</span>
        </h2>
        <p className="text-gray-500 font-sans mb-6 text-lg">
          Un investissement vital pour la sécurité de votre établissement
        </p>

        {/* Selling points */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {AED3_CTA_POINTS.map((point, i) => {
            const Icon = iconMap[point.iconName];
            return (
              <div
                key={i}
                className="bg-white/90 backdrop-blur-sm rounded-xl p-5 shadow-sm border border-gray-100"
              >
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-[#d92d20] mx-auto mb-3">
                  {Icon && <Icon className="w-6 h-6" />}
                </div>
                <h3 className="font-bold text-gray-900 font-sans mb-0.5">
                  {point.title}
                </h3>
                <p className="text-sm text-gray-500 font-sans">
                  {point.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="/souscrire"
            className="inline-flex items-center gap-2 bg-[#d92d20] hover:bg-[#b91c1c] text-white font-bold px-8 py-4 rounded-lg text-base transition-colors font-sans shadow-lg shadow-red-500/20"
          >
            Souscrire maintenant
            <ArrowRight className="w-5 h-5" />
          </a>
          <a
            href="/#rdv"
            className="inline-flex items-center gap-2 border-2 border-gray-300 hover:border-[#d92d20] text-gray-700 hover:text-[#d92d20] font-semibold px-8 py-4 rounded-lg text-base transition-colors font-sans"
          >
            Prendre rendez-vous
          </a>
        </div>
      </div>
    </div>
  );
}
