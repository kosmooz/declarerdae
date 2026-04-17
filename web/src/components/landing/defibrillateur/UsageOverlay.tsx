"use client";

import { useRef } from "react";
import { AED3_USAGE_STEPS } from "@/data/defibrillateur-content";
import { useScrollFrame } from "@/hooks/useScrollAnimation";
import type { ScrollData } from "@/hooks/useScrollAnimation";

export default function UsageOverlay({ scrollRef }: { scrollRef: React.RefObject<ScrollData | null> }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useScrollFrame(scrollRef, (offset, range) => {
    if (!containerRef.current) return;

    const fadeIn = range(0.50, 0.06);
    const fadeOut = 1 - range(0.85, 0.06);
    const opacity = Math.min(fadeIn, fadeOut);
    containerRef.current.style.opacity = String(Math.max(0, opacity));

    // Growing timeline line
    if (lineRef.current) {
      const lineProgress = range(0.55, 0.18);
      lineRef.current.style.transform = `scaleY(${lineProgress})`;
    }

    // Stagger step reveals
    stepRefs.current.forEach((step, i) => {
      if (!step) return;
      const stepProgress = range(0.56 + i * 0.04, 0.05);
      step.style.opacity = String(stepProgress);
      step.style.transform = `translateX(${(1 - stepProgress) * 30}px)`;
    });
  });

  return (
    <div
      ref={containerRef}
      className="absolute top-[300vh] left-0 w-full h-screen flex items-center pointer-events-none"
      style={{ opacity: 0 }}
    >
      <div className="container max-w-7xl px-6 md:px-12">
        <div className="ml-auto max-w-md">
          <h2 className="text-3xl md:text-4xl lg:text-5xl text-gray-900 mb-10">
            Simple <span className="text-[#d92d20]">d'utilisation</span>
          </h2>

          {/* Timeline */}
          <div className="relative pl-8">
            {/* Vertical line */}
            <div
              ref={lineRef}
              className="absolute left-3 top-0 bottom-0 w-0.5 bg-[#d92d20] origin-top"
              style={{ transform: "scaleY(0)" }}
            />

            <div className="space-y-6">
              {AED3_USAGE_STEPS.map((step, i) => (
                <div
                  key={i}
                  ref={(el) => {
                    stepRefs.current[i] = el;
                  }}
                  className="relative"
                  style={{ opacity: 0 }}
                >
                  {/* Dot */}
                  <div className="absolute -left-8 top-1 w-6 h-6 rounded-full bg-[#d92d20] flex items-center justify-center">
                    <span className="text-white text-xs font-bold font-sans">
                      {step.step}
                    </span>
                  </div>

                  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 text-sm font-sans mb-1">
                      {step.title}
                    </h3>
                    <p className="text-xs text-gray-500 font-sans leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
