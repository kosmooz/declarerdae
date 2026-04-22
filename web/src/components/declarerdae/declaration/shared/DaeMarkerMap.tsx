"use client";

import { useMemo, useCallback } from "react";
import { MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import MapConsentGate from "@/components/declarerdae/MapConsentGate";

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div
      className="rounded-sm border border-[#CECECE] bg-[#F6F6F6] flex items-center justify-center"
      style={{ height: 300 }}
    >
      <span className="text-sm text-[#929292]">Chargement de la carte...</span>
    </div>
  ),
});

interface DaeMarkerMapProps {
  lat: number | null;
  lng: number | null;
  siteLat: number | null;
  siteLng: number | null;
  onPositionChange: (lat: number, lng: number) => void;
}

export default function DaeMarkerMap({
  lat,
  lng,
  siteLat,
  siteLng,
  onPositionChange,
}: DaeMarkerMapProps) {
  // Use device coords if set, otherwise fall back to site coords
  const displayLat = lat ?? siteLat;
  const displayLng = lng ?? siteLng;
  const hasPosition = displayLat != null && displayLng != null;

  const handlePositionChange = useCallback(
    (newLat: number, newLng: number) => {
      onPositionChange(newLat, newLng);
    },
    [onPositionChange],
  );

  if (!hasPosition) {
    return (
      <div className="mt-4 rounded-sm border border-[#000091]/20 bg-[#F5F5FE] p-4">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-4 h-4 text-[#000091]" />
          <span className="text-sm font-semibold text-[#000091]">
            Localisation exacte du défibrillateur
          </span>
        </div>
        <p className="text-sm text-[#929292]">
          Renseignez d'abord l'adresse du site à l'étape 2 pour afficher la
          carte.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-sm border border-[#000091]/20 bg-[#F5F5FE] p-4 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <MapPin className="w-4 h-4 text-[#000091]" />
        <span className="text-sm font-semibold text-[#000091]">
          Localisation exacte du défibrillateur
        </span>
      </div>

      {/* Map */}
      <MapConsentGate height={300}>
        <div className="relative rounded-sm overflow-hidden border border-[#CECECE] shadow-sm">
          <LeafletMap
            lat={displayLat}
            lng={displayLng}
            onPositionChange={handlePositionChange}
          />
          <div className="absolute bottom-2 right-2 z-10 bg-white/90 backdrop-blur-sm rounded px-2.5 py-1 shadow text-xs font-medium text-[#000091] pointer-events-none">
            Glissez le marqueur pour ajuster
          </div>
        </div>
      </MapConsentGate>

      {/* Coordinates */}
      <div className="flex items-center gap-4 text-xs text-[#929292]">
        <span>Lat. {displayLat.toFixed(6)}</span>
        <span>Lng. {displayLng.toFixed(6)}</span>
        {lat == null && (
          <span className="text-[#000091]/60 italic">
            — position du site par défaut
          </span>
        )}
      </div>
    </div>
  );
}
