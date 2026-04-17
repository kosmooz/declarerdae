"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import ScrollReveal from "@/components/declarerdae/ScrollReveal";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Building2, Heart } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface MapPoint {
  lat: number;
  lng: number;
  ville: string;
  cp: string;
  n: number;
}

interface MapData {
  points: MapPoint[];
  stats: { declarations: number; devices: number; villes: number };
}

/* ------------------------------------------------------------------ */
/*  Dynamic import of inner map (SSR disabled)                         */
/* ------------------------------------------------------------------ */

const DaeMapInner = dynamic(
  () => import("@/components/declarerdae/DaeMapFranceInner"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full rounded-lg bg-[#F6F6F6] flex items-center justify-center">
        <div className="text-[#929292] text-sm">Chargement de la carte...</div>
      </div>
    ),
  },
);

/* ------------------------------------------------------------------ */
/*  Animated counter                                                   */
/* ------------------------------------------------------------------ */

function AnimCounter({
  end,
  label,
  icon,
}: {
  end: number;
  label: string;
  icon: React.ReactNode;
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
        {count.toLocaleString("fr-FR")}
      </div>
      <div className="text-white/70 text-sm font-medium">{label}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main section component                                             */
/* ------------------------------------------------------------------ */

export default function DaeMapFrance() {
  const [data, setData] = useState<MapData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/declarations/public-map")
      .then((r) => {
        if (!r.ok) throw new Error("fetch failed");
        return r.json();
      })
      .then(setData)
      .catch(() => setError(true));
  }, []);

  const stats = data?.stats ?? { declarations: 0, devices: 0, villes: 0 };

  return (
    <section className="bg-[#000091] py-10 sm:py-16">
      <div className="container">
        {/* Header */}
        <ScrollReveal>
          <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-10">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-white/60 mb-3">
              Carte des DAE
            </span>
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-white mb-4">
              Ils déclarent avec nous, partout en France
            </h2>
            <p className="text-white/70 text-base leading-relaxed">
              Visualisez les défibrillateurs enregistrés via notre plateforme.
              Chaque point représente un établissement en conformité.
            </p>
          </div>
        </ScrollReveal>

        {/* Map */}
        <ScrollReveal>
          <div
            className="mx-auto rounded-lg overflow-hidden border-2 border-white/20 shadow-lg"
            style={{ maxWidth: 900, height: "clamp(280px, 40vw, 420px)" }}
          >
            {error ? (
              <div className="w-full h-full bg-[#F6F6F6] flex items-center justify-center">
                <p className="text-[#929292] text-sm">
                  Impossible de charger la carte.
                </p>
              </div>
            ) : !data ? (
              <div className="w-full h-full bg-[#F6F6F6] flex items-center justify-center">
                <div className="text-[#929292] text-sm">
                  Chargement de la carte...
                </div>
              </div>
            ) : (
              <DaeMapInner points={data.points} />
            )}
          </div>
        </ScrollReveal>

        {/* Stats counters */}
        <ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-4 max-w-2xl mx-auto mt-10">
            <AnimCounter
              end={stats.devices}
              label="DAE déclarés"
              icon={<Heart className="w-5 h-5 text-[#E1000F]" />}
            />
            <AnimCounter
              end={stats.villes}
              label="Villes couvertes"
              icon={<MapPin className="w-5 h-5 text-white/80" />}
            />
            <AnimCounter
              end={stats.declarations}
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
