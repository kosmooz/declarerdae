"use client";

import { useRef } from "react";
import { AED3_SPECS } from "@/data/defibrillateur-content";
import { useScrollFrame } from "@/hooks/useScrollAnimation";
import type { ScrollData } from "@/hooks/useScrollAnimation";

export default function SpecsOverlay({ scrollRef }: { scrollRef: React.RefObject<ScrollData | null> }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useScrollFrame(scrollRef, (offset, range) => {
    if (!containerRef.current) return;

    const fadeIn = range(0.33, 0.06);
    const fadeOut = 1 - range(0.58, 0.06);
    const opacity = Math.min(fadeIn, fadeOut);
    containerRef.current.style.opacity = String(Math.max(0, opacity));

    // Parallax per card with staggered offsets
    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      const cardProgress = range(0.35 + i * 0.015, 0.05);
      const parallaxY = (1 - cardProgress) * (20 + i * 8);
      card.style.opacity = String(cardProgress);
      card.style.transform = `translateY(${parallaxY}px)`;
    });
  });

  return (
    <div
      ref={containerRef}
      className="absolute top-[200vh] left-0 w-full h-screen flex items-center pointer-events-none"
      style={{ opacity: 0 }}
    >
      <div className="container max-w-7xl px-6 md:px-12">
        <div className="ml-auto max-w-lg">
          <h2 className="text-3xl md:text-4xl lg:text-5xl text-gray-900 mb-8">
            La technologie au service{" "}
            <span className="text-[#d92d20]">de la vie</span>
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {AED3_SPECS.map((spec, i) => (
              <div
                key={i}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-100 text-center"
                style={{ opacity: 0 }}
              >
                <div className="text-xl md:text-2xl font-bold text-[#d92d20] font-sans mb-0.5">
                  {spec.value}
                </div>
                <div className="text-xs font-semibold text-gray-900 font-sans mb-0.5">
                  {spec.label}
                </div>
                <div className="text-[11px] text-gray-500 font-sans">
                  {spec.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
