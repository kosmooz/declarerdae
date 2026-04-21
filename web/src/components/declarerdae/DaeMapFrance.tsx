"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ScrollReveal from "@/components/declarerdae/ScrollReveal";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Building2, Heart } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Animated counter                                                   */
/* ------------------------------------------------------------------ */

function AnimCounter({
  end,
  label,
  icon,
  prefix,
}: {
  end: number;
  label: string;
  icon: React.ReactNode;
  prefix?: string;
}) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const startTime = performance.now();
          const animate = (now: number) => {
            const progress = Math.min((now - startTime) / 1200, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [end, hasAnimated]);

  return (
    <div ref={ref} className="flex flex-col items-center gap-2">
      <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center">
        {icon}
      </div>
      <div className="font-heading font-black text-3xl sm:text-4xl text-white leading-none">
        {prefix}{count.toLocaleString("fr-FR")}
      </div>
      <div className="text-white/70 text-sm font-medium">{label}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main section component                                             */
/* ------------------------------------------------------------------ */

export default function DaeMapFrance() {
  return (
    <section className="bg-[#000091] py-10 sm:py-16">
      <div className="container">
        {/* Header */}
        <ScrollReveal>
          <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-10">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-white/60 mb-3">
              En chiffres
            </span>
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-white mb-4">
              Ils déclarent avec nous, partout en France
            </h2>
            <p className="text-white/70 text-base leading-relaxed">
              Des milliers d'établissements utilisent notre plateforme pour se
              mettre en conformité avec la réglementation.
            </p>
          </div>
        </ScrollReveal>

        {/* Stats counters */}
        <ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-4 max-w-2xl mx-auto">
            <AnimCounter
              end={2500}
              prefix="+"
              label="DAE déclarés"
              icon={<Heart className="w-5 h-5 text-[#E1000F]" />}
            />
            <AnimCounter
              end={120}
              label="Villes couvertes"
              icon={<MapPin className="w-5 h-5 text-white/80" />}
            />
            <AnimCounter
              end={1800}
              label="Établissements"
              icon={<Building2 className="w-5 h-5 text-white/80" />}
            />
          </div>
        </ScrollReveal>

        {/* CTA */}
        <ScrollReveal>
          <div className="max-w-md mx-auto mt-10 text-center">
            <p className="text-white/60 text-sm mb-4">
              Rejoignez les établissements en conformité.
            </p>
            <Link href="/declaration">
              <Button
                size="lg"
                className="bg-[#E1000F] hover:bg-[#C00000] text-white font-semibold text-base px-8"
              >
                Déclarer mon DAE
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
