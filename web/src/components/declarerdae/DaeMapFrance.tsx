"use client";

import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import ScrollReveal from "@/components/declarerdae/ScrollReveal";
import MapConsentGate from "@/components/declarerdae/MapConsentGate";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { searchDae, type DaeResult } from "@/lib/geodae-search";

const DaeMapFranceMapInner = dynamic(
  () => import("@/components/declarerdae/DaeMapFranceMapInner"),
  { ssr: false, loading: () => <div className="w-full rounded-lg bg-white/10 animate-pulse" style={{ height: 420 }} /> },
);

/* ------------------------------------------------------------------ */
/*  Main section component                                             */
/* ------------------------------------------------------------------ */

export default function DaeMapFrance() {
  const [results, setResults] = useState<DaeResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleMapMove = useCallback(async (lat: number, lng: number, radiusKm: number) => {
    setLoading(true);
    try {
      const data = await searchDae({ lat, lng, radiusKm, pageSize: 50 });
      setResults(data);
    } catch {
      // silent — map still usable
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <section className="bg-[#000091] py-10 sm:py-16">
      <div className="container">
        {/* Header */}
        <ScrollReveal>
          <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-10">
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-white mb-4">
              Ils déclarent, partout en France
            </h2>
            <p className="text-white/70 text-base leading-relaxed">
              Avec plus de 170 000 DAE déclarés, des milliers d'établissements utilisent notre plateforme pour déclarer leurs DAE sur la base nationale Géo'DAE et se mettre en conformité avec la réglementation.
            </p>
          </div>
        </ScrollReveal>

        {/* Map */}
        <ScrollReveal>
          <div className="mt-8 sm:mt-10 relative max-w-4xl mx-auto">
            <MapConsentGate height={420}>
              <DaeMapFranceMapInner results={results} onMapMove={handleMapMove} />
            </MapConsentGate>
            {loading && (
              <div className="absolute top-3 right-3 z-[500] flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-md">
                <Loader2 className="w-3.5 h-3.5 text-[#000091] animate-spin" />
                <span className="text-xs font-medium text-[#3A3A3A]">Chargement...</span>
              </div>
            )}
            <p className="text-right text-white/40 text-xs mt-2 italic">Données issues de la base nationale Géo'DAE</p>
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
