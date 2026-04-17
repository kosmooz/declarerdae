"use client";

import { useRef } from "react";
import { Monitor, Activity, Cpu, Users } from "lucide-react";
import { AED3_FEATURES } from "@/data/defibrillateur-content";
import { useScrollFrame } from "@/hooks/useScrollAnimation";
import type { ScrollData } from "@/hooks/useScrollAnimation";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Monitor,
  Activity,
  Cpu,
  Users,
};

export default function FeaturesOverlay({ scrollRef }: { scrollRef: React.RefObject<ScrollData | null> }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useScrollFrame(scrollRef, (offset, range) => {
    if (!containerRef.current) return;

    // Fade in when entering section 2, fade out when leaving
    const fadeIn = range(0.15, 0.05);
    const fadeOut = 1 - range(0.35, 0.05);
    const opacity = Math.min(fadeIn, fadeOut);
    containerRef.current.style.opacity = String(Math.max(0, opacity));

    // Stagger card reveals
    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      const cardProgress = range(0.18 + i * 0.03, 0.04);
      card.style.opacity = String(cardProgress);
      card.style.transform = `translateX(${(1 - cardProgress) * -30}px)`;
    });
  });

  return (
    <div
      ref={containerRef}
      className="absolute top-[100vh] left-0 w-full h-screen flex items-center pointer-events-none"
      style={{ opacity: 0 }}
    >
      <div className="container max-w-7xl px-6 md:px-12">
        <div className="max-w-md">
          <h2 className="text-3xl md:text-4xl lg:text-5xl text-gray-900 mb-8">
            Conçu pour <span className="text-[#d92d20]">sauver</span>
          </h2>
          <div className="space-y-4">
            {AED3_FEATURES.map((feature, i) => {
              const Icon = iconMap[feature.iconName];
              return (
                <div
                  key={i}
                  ref={(el) => {
                    cardRefs.current[i] = el;
                  }}
                  className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-100"
                  style={{ opacity: 0 }}
                >
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
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
