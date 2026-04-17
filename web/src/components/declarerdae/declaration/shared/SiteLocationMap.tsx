"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { geocodeAddress, GeocodingResult } from "@/lib/geocoding";
import { MapPin, Search, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

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

interface SiteLocationMapProps {
  lat: number | null;
  lng: number | null;
  adrNum: string;
  adrVoie: string;
  adrComplement: string;
  codePostal: string;
  codeInsee: string;
  ville: string;
  onBatchChange: (fields: Record<string, any>) => void;
}

export default function SiteLocationMap({
  lat,
  lng,
  adrNum,
  adrVoie,
  adrComplement,
  codePostal,
  codeInsee,
  ville,
  onBatchChange,
}: SiteLocationMapProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const hasPosition = lat != null && lng != null;

  const search = useCallback((q: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setLoading(true);
    timerRef.current = setTimeout(async () => {
      const res = await geocodeAddress(q);
      setResults(res);
      setOpen(res.length > 0);
      setLoading(false);
    }, 300);
  }, []);

  const handleInputChange = (val: string) => {
    setQuery(val);
    if (val.length >= 3) {
      search(val);
    } else {
      setResults([]);
      setOpen(false);
      setLoading(false);
    }
  };

  const handleSelect = (r: GeocodingResult) => {
    setQuery(r.label);
    setOpen(false);
    setResults([]);
    onBatchChange({
      latCoor1: r.latitude,
      longCoor1: r.longitude,
      xyPrecis: r.score,
      adrNum: r.housenumber,
      adrVoie: r.street,
      codePostal: r.postcode,
      codeInsee: r.citycode,
      ville: r.city,
    });
  };

  const handlePositionChange = useCallback(
    (newLat: number, newLng: number) => {
      onBatchChange({ latCoor1: newLat, longCoor1: newLng });
    },
    [onBatchChange],
  );

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="rounded-sm border border-[#000091]/20 bg-[#F5F5FE] p-4 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <MapPin className="w-4 h-4 text-[#000091]" />
        <span className="text-sm font-semibold text-[#000091]">
          Adresse du site
        </span>
      </div>

      {/* Address search */}
      <div ref={containerRef} className="relative z-[1001]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#000091]" />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#000091] animate-spin" />
          )}
          <Input
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Tapez l'adresse du site pour le localiser sur la carte..."
            className="pl-9 pr-9 h-11 bg-white border-[#000091]/30 focus:border-[#000091] focus:ring-2 focus:ring-[#000091]/20 text-sm placeholder:text-[#929292]"
          />
        </div>
        {open && results.length > 0 && (
          <div className="absolute z-[1000] mt-1 w-full bg-white border border-[#CECECE] rounded-md shadow-lg max-h-48 overflow-y-auto">
            {results.map((r, i) => (
              <button
                key={i}
                type="button"
                className="w-full text-left px-3 py-2.5 text-sm hover:bg-[#F5F5FE] flex items-start gap-2 transition-colors"
                onClick={() => handleSelect(r)}
              >
                <MapPin className="w-4 h-4 text-[#000091] mt-0.5 shrink-0" />
                <span>{r.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map + fields — visible only after address selection */}
      {hasPosition && (
        <>
          <div className="relative rounded-sm overflow-hidden border border-[#CECECE] shadow-sm">
            <LeafletMap
              lat={lat}
              lng={lng}
              onPositionChange={handlePositionChange}
              locatedZoom={16}
            />
            <div className="absolute bottom-2 right-2 z-[1000] bg-white/90 backdrop-blur-sm rounded px-2.5 py-1 shadow text-xs font-medium text-[#000091] pointer-events-none">
              Glissez le marqueur pour ajuster
            </div>
          </div>

          {/* Address fields */}
          <div className="grid grid-cols-[80px_1fr] gap-2">
            <div>
              <Label className="text-xs text-[#666] mb-1 block">N° voie</Label>
              <Input
                value={adrNum}
                readOnly
                tabIndex={-1}
                className="bg-[#F6F6F6] border-[#E5E5E5] text-[#929292] text-sm cursor-default"
              />
            </div>
            <div>
              <Label className="text-xs text-[#666] mb-1 block">Voie</Label>
              <Input
                value={adrVoie}
                readOnly
                tabIndex={-1}
                className="bg-[#F6F6F6] border-[#E5E5E5] text-[#929292] text-sm cursor-default"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs text-[#666] mb-1 block">
              Complément d'adresse{" "}
              <span className="text-[#929292]">(facultatif)</span>
            </Label>
            <Input
              value={adrComplement}
              onChange={(e) =>
                onBatchChange({ adrComplement: e.target.value })
              }
              placeholder="Bâtiment B, Entrée principale..."
              className="bg-white border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091] text-sm"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-xs text-[#666] mb-1 block">
                Code postal
              </Label>
              <Input
                value={codePostal}
                readOnly
                tabIndex={-1}
                className="bg-[#F6F6F6] border-[#E5E5E5] text-[#929292] text-sm cursor-default"
              />
            </div>
            <div>
              <Label className="text-xs text-[#666] mb-1 block">
                Code INSEE
              </Label>
              <Input
                value={codeInsee}
                readOnly
                tabIndex={-1}
                className="bg-[#F6F6F6] border-[#E5E5E5] text-[#929292] text-sm cursor-default"
              />
            </div>
            <div>
              <Label className="text-xs text-[#666] mb-1 block">Commune</Label>
              <Input
                value={ville}
                readOnly
                tabIndex={-1}
                className="bg-[#F6F6F6] border-[#E5E5E5] text-[#929292] text-sm cursor-default"
              />
            </div>
          </div>

          {/* Coordinates */}
          <div className="flex items-center gap-4 text-xs text-[#929292]">
            <span>Lat. {lat.toFixed(6)}</span>
            <span>Lng. {lng.toFixed(6)}</span>
          </div>
        </>
      )}
    </div>
  );
}
