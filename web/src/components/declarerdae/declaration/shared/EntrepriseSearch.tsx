"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { searchSiret, SiretResult } from "@/lib/siret-api";
import { Search, Building2, Loader2, CheckCircle2 } from "lucide-react";

interface EntrepriseSearchProps {
  onSelect: (result: SiretResult) => void;
  onManualMode: () => void;
}

export default function EntrepriseSearch({
  onSelect,
  onManualMode,
}: EntrepriseSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SiretResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [apiError, setApiError] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const justSelectedRef = useRef(false);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (justSelectedRef.current) {
      justSelectedRef.current = false;
      return;
    }

    if (query.length < 3) {
      setResults([]);
      setOpen(false);
      setNoResults(false);
      setApiError(false);
      setLoading(false);
      return;
    }

    let stale = false;
    setLoading(true);
    setNoResults(false);
    setApiError(false);
    debounceRef.current = setTimeout(async () => {
      const { results: data, error } = await searchSiret(query);
      if (stale) return;
      if (error && data.length === 0) {
        // API error — retry once after 1s
        await new Promise((r) => setTimeout(r, 1000));
        if (stale) return;
        const retry = await searchSiret(query);
        if (stale) return;
        if (retry.error) {
          setLoading(false);
          setApiError(true);
          return;
        }
        setResults(retry.results);
        setLoading(false);
        setOpen(retry.results.length > 0);
        setNoResults(retry.results.length === 0);
        return;
      }
      setResults(data);
      setLoading(false);
      setOpen(data.length > 0);
      setNoResults(data.length === 0);
    }, 200);

    return () => {
      stale = true;
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = useCallback(
    (r: SiretResult) => {
      justSelectedRef.current = true;
      setQuery("");
      setOpen(false);
      setResults([]);
      setNoResults(false);
      onSelect(r);
    },
    [onSelect],
  );

  return (
    <div ref={wrapperRef} className="space-y-3">
      {/* Search header */}
      <div className="bg-[#F6F6F6] border border-[#CECECE] rounded-sm p-5">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-full bg-[#000091]/10 flex items-center justify-center">
            <Search className="w-4 h-4 text-[#000091]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#161616]">
              Recherchez votre entité
            </p>
            <p className="text-[11px] text-[#929292]">
              Saisissez le nom complet ou le numéro SIREN — remplissage
              automatique
            </p>
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#929292]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setOpen(true)}
            placeholder="Tapez le nom complet de votre organisme ou son numéro SIREN..."
            className="w-full h-11 pl-10 pr-10 rounded-sm border border-[#000091]/30 bg-white text-sm text-[#161616] placeholder:text-[#929292] focus:outline-none focus:ring-2 focus:ring-[#000091]/20 focus:border-[#000091] transition-colors"
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-[#929292]" />
          )}
        </div>

        {/* Results dropdown */}
        {open && results.length > 0 && (
          <div className="mt-2 rounded-sm border border-[#CECECE] bg-white shadow-lg max-h-56 overflow-auto">
            {results.map((r, i) => (
              <button
                key={r.siege?.siret || r.siren || i}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(r)}
                className="w-full text-left px-3 py-2.5 flex items-start gap-2.5 hover:bg-[#F6F6F6] transition-colors border-b last:border-b-0 border-[#E5E5E5]"
              >
                <Building2 className="w-4 h-4 mt-0.5 shrink-0 text-[#000091]" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm text-[#161616] truncate">
                    {r.nom_complet}
                  </p>
                  <p className="text-xs text-[#929292] truncate">
                    SIREN {r.siren}
                    {r.siege?.libelle_commune &&
                      ` — ${r.siege.libelle_commune}`}
                  </p>
                </div>
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-[#18753C] opacity-0 group-hover:opacity-100" />
              </button>
            ))}
          </div>
        )}

        {/* API error */}
        {apiError && !loading && (
          <p className="mt-2 text-xs text-[#E1000F]">
            Le service de recherche est temporairement indisponible. Réessayez
            dans quelques secondes ou saisissez les informations manuellement.
          </p>
        )}

        {/* No results */}
        {noResults && !apiError && !loading && (
          <p className="mt-2 text-xs text-[#92400E]">
            Aucun résultat trouvé. Saisissez le nom complet de l'entité (pas
            partiel) ou essayez avec le numéro SIREN.
          </p>
        )}

        {/* Manual mode link */}
        <button
          type="button"
          onClick={onManualMode}
          className="mt-3 text-xs text-[#000091] hover:underline flex items-center gap-1"
        >
          <span>Je ne trouve pas mon entité</span>
          <span className="text-[#929292]">— renseigner manuellement</span>
        </button>
      </div>
    </div>
  );
}
