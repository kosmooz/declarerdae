"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { geocodeAddress, GeocodingResult } from "@/lib/geocoding";
import { MapPin, Check } from "lucide-react";

interface AddressAutocompleteProps {
  value: string;
  codePostal: string;
  ville: string;
  adrNum: string;
  latCoor1: number | null;
  longCoor1: number | null;
  onChange: (fields: {
    adrVoie?: string;
    adrNum?: string;
    codePostal?: string;
    ville?: string;
    latCoor1?: number | null;
    longCoor1?: number | null;
    xyPrecis?: number | null;
  }) => void;
}

export default function AddressAutocomplete({
  value,
  codePostal,
  ville,
  adrNum,
  latCoor1,
  longCoor1,
  onChange,
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync query with external value
  useEffect(() => {
    setQuery(value);
  }, [value]);

  const search = useCallback(
    (q: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        const res = await geocodeAddress(q, codePostal || undefined);
        setResults(res);
        setOpen(res.length > 0);
      }, 300);
    },
    [codePostal],
  );

  const handleInputChange = (val: string) => {
    setQuery(val);
    onChange({ adrVoie: val });
    if (val.length >= 3) {
      search(val);
    } else {
      setResults([]);
      setOpen(false);
    }
  };

  const handleSelect = (r: GeocodingResult) => {
    setQuery(r.street);
    setOpen(false);
    onChange({
      adrVoie: r.street,
      adrNum: r.housenumber,
      codePostal: r.postcode,
      ville: r.city,
      latCoor1: r.latitude,
      longCoor1: r.longitude,
      xyPrecis: r.score,
    });
  };

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
    <div ref={containerRef} className="space-y-3">
      <div className="grid grid-cols-[80px_1fr] gap-3">
        <div>
          <Label className="text-xs text-[#666] mb-1 block">N° voie</Label>
          <Input
            value={adrNum}
            onChange={(e) => onChange({ adrNum: e.target.value })}
            placeholder="12bis"
            className="border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091]"
          />
        </div>
        <div className="relative">
          <Label className="text-xs text-[#666] mb-1 block">
            Adresse du site *
          </Label>
          <Input
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Tapez l'adresse pour rechercher..."
            className="border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091]"
          />
          {open && results.length > 0 && (
            <div className="absolute z-50 mt-1 w-full bg-white border border-[#CECECE] rounded-md shadow-lg max-h-48 overflow-y-auto">
              {results.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-[#F6F6F6] flex items-start gap-2"
                  onClick={() => handleSelect(r)}
                >
                  <MapPin className="w-4 h-4 text-[#000091] mt-0.5 shrink-0" />
                  <span>{r.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-[#666] mb-1 block">
            Code postal *
          </Label>
          <Input
            value={codePostal}
            onChange={(e) => onChange({ codePostal: e.target.value })}
            placeholder="75007"
            className="border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091]"
          />
        </div>
        <div>
          <Label className="text-xs text-[#666] mb-1 block">Ville *</Label>
          <Input
            value={ville}
            onChange={(e) => onChange({ ville: e.target.value })}
            placeholder="Paris"
            className="border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091]"
          />
        </div>
      </div>

      {latCoor1 != null && longCoor1 != null && (
        <div className="flex items-center gap-2 text-xs text-[#18753C] bg-[#e8f5e9] rounded px-3 py-1.5">
          <Check className="w-3.5 h-3.5" />
          <span>
            Coordonnées GPS détectées : {latCoor1.toFixed(6)},{" "}
            {longCoor1.toFixed(6)}
          </span>
        </div>
      )}
    </div>
  );
}
