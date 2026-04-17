"use client";

import { useRef } from "react";
import { ChevronDown, ArrowRight } from "lucide-react";
import { useScrollFrame } from "@/hooks/useScrollAnimation";
import type { ScrollData } from "@/hooks/useScrollAnimation";

export default function HeroOverlay({ scrollRef }: { scrollRef: React.RefObject<ScrollData | null> }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useScrollFrame(scrollRef, (offset, range) => {
    if (!containerRef.current) return;
    const opacity = 1 - range(0, 1 / 5) * 1.5;
    containerRef.current.style.opacity = String(Math.max(0, opacity));
  });

  return (
    <div
      ref={containerRef}
      className="absolute top-0 left-0 w-full h-screen flex items-center pointer-events-none -mt-12"
    >
      <div className="container max-w-7xl px-6 md:px-12">
        <div className="max-w-lg">
          <div className="inline-flex items-center gap-2 bg-[#d92d20]/10 text-[#d92d20] text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full mb-6 font-sans">
            Par ZOLL Medical
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl text-gray-900 mb-4 leading-tight">
            ZOLL AED 3
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 font-sans font-light mb-8">
            Le défibrillateur qui sauve des vies
          </p>
          <p className="text-sm text-gray-500 font-sans max-w-sm mb-8">
            Technologie de pointe, simplicité d'utilisation. Conçu pour que
            chacun puisse agir en cas d'urgence cardiaque.
          </p>
          <div className="flex flex-wrap gap-3 pointer-events-auto">
            <a
              href="/souscrire"
              className="inline-flex items-center gap-2 bg-[#d92d20] hover:bg-[#b91c1c] text-white font-bold px-6 py-3 rounded-lg text-sm transition-colors font-sans"
            >
              Souscrire maintenant
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="/#offre"
              className="inline-flex items-center gap-2 border-2 border-gray-300 hover:border-[#d92d20] text-gray-700 hover:text-[#d92d20] font-semibold px-6 py-3 rounded-lg text-sm transition-colors font-sans"
            >
              Découvrir l{"'"}offre
            </a>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce">
        <span className="text-xs text-gray-400 font-sans uppercase tracking-widest">
          Scroll
        </span>
        <ChevronDown className="w-5 h-5 text-gray-400" />
      </div>
    </div>
  );
}
