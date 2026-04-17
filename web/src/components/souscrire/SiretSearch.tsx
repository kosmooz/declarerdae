"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { searchSiret, SiretResult } from "@/lib/siret-api";
import { Search, Building2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SiretSearchProps {
  onSelect: (result: SiretResult) => void;
}

export default function SiretSearch({ onSelect }: SiretSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SiretResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const justSelectedRef = useRef(false);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // Skip search if we just selected an item
    if (justSelectedRef.current) {
      justSelectedRef.current = false;
      return;
    }

    if (query.length < 3) {
      setResults([]);
      setOpen(false);
      setNoResults(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setNoResults(false);
    debounceRef.current = setTimeout(async () => {
      const { results: data } = await searchSiret(query);
      setResults(data);
      setLoading(false);
      setOpen(data.length > 0);
      setNoResults(data.length === 0);
    }, 200);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = useCallback((r: SiretResult) => {
    justSelectedRef.current = true;
    setQuery(r.nom_complet);
    setOpen(false);
    setResults([]);
    setNoResults(false);
    onSelect(r);
  }, [onSelect]);

  return (
    <div ref={wrapperRef} className="relative">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-full bg-[#d92d20]/10 flex items-center justify-center">
          <Search className="w-3.5 h-3.5 text-[#d92d20]" />
        </div>
        <p className="text-[13px] font-semibold text-gray-700">Recherchez votre entreprise</p>
        <span className="text-[11px] text-gray-400 font-normal">— remplissage automatique</span>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Tapez un nom d'entreprise ou un numéro SIRET..."
          className="w-full h-10 pl-9 pr-9 rounded-lg border border-[#d92d20]/30 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#d92d20]/20 focus:border-[#d92d20] transition-colors"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
        )}
      </div>

      {noResults && !loading && (
        <p className="mt-1.5 text-xs text-amber-600">
          Aucun résultat. Tapez le nom complet de l&apos;entreprise ou son numéro SIRET.
        </p>
      )}

      {open && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 rounded-xl border bg-popover shadow-lg max-h-56 overflow-auto">
          {results.map((r, i) => (
            <button
              key={r.siege?.siret || r.siren || i}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(r)}
              className={cn(
                "w-full text-left px-3 py-2.5 flex items-start gap-2.5 hover:bg-muted transition-colors",
                "border-b last:border-b-0",
              )}
            >
              <Building2 className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{r.nom_complet}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {r.siege?.siret || r.siren} — {r.siege?.libelle_commune}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
