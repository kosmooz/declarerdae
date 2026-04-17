"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import MapConsentGate from "@/components/declarerdae/MapConsentGate";
import { Button } from "@/components/ui/button";
import {
  Crosshair,
  Search,
  MapPin,
  Clock,
  DoorOpen,
  ShieldCheck,
  Loader2,
  ChevronDown,
  Heart,
  Navigation,
  ExternalLink,
  Baby,
  Wrench,
  Smartphone,
  Accessibility,
  Calendar,
} from "lucide-react";
import {
  searchDae,
  formatDistance,
  googleMapsDirectionsUrl,
  type DaeResult,
  type SearchParams,
} from "@/lib/geodae-search";

/* ------------------------------------------------------------------ */
/*  Dynamic map import (SSR disabled)                                  */
/* ------------------------------------------------------------------ */

const FindDaeMapInner = dynamic(
  () => import("@/components/declarerdae/FindDaeMapInner"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-[#F6F6F6] rounded-lg flex items-center justify-center">
        <span className="text-[#929292] text-sm">Chargement de la carte...</span>
      </div>
    ),
  },
);

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const RADIUS_OPTIONS = [
  { value: 0.5, label: "500 m" },
  { value: 1, label: "1 km" },
  { value: 2, label: "2 km" },
  { value: 5, label: "5 km" },
  { value: 10, label: "10 km" },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function FindDaeClient() {
  // Position
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [locationLabel, setLocationLabel] = useState("");

  // Search
  const [addressQuery, setAddressQuery] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Filters
  const [radiusKm, setRadiusKm] = useState(2);
  const [accesLibre, setAccesLibre] = useState(false);
  const [accessFilter, setAccessFilter] = useState<string>("");

  // Results
  const [results, setResults] = useState<DaeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [selectedGid, setSelectedGid] = useState<number | null>(null);

  // Map-driven search
  const [skipFitBounds, setSkipFitBounds] = useState(false);
  const [liveReload, setLiveReload] = useState(false);
  const lastMapViewRef = useRef<{ lat: number; lng: number; r: number } | null>(null);

  // Geolocation loading
  const [geoLoading, setGeoLoading] = useState(false);

  // Ref for address debounce
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  /* ---- Geolocation ---- */

  const handleGeolocate = useCallback(() => {
    if (!navigator.geolocation) {
      setError("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }
    setGeoLoading(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLng(pos.coords.longitude);
        setLocationLabel("Ma position");
        setAddressQuery("");
        setGeoLoading(false);
      },
      (err) => {
        setGeoLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setError(
            "Accès à la localisation refusé. Autorisez la géolocalisation ou cherchez une adresse.",
          );
        } else {
          setError("Impossible d'obtenir votre position.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  /* ---- Address autocomplete (BAN) ---- */

  const handleAddressInput = useCallback((value: string) => {
    setAddressQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length < 3) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(value)}&limit=5`,
        );
        const json = await res.json();
        setAddressSuggestions(json.features || []);
        setShowSuggestions(true);
      } catch {
        setAddressSuggestions([]);
      }
    }, 300);
  }, []);

  const selectAddress = useCallback((feature: any) => {
    const [lng, lat] = feature.geometry.coordinates;
    setUserLat(lat);
    setUserLng(lng);
    setAddressQuery(feature.properties.label);
    setLocationLabel(feature.properties.label);
    setShowSuggestions(false);
    setAddressSuggestions([]);
  }, []);

  /* ---- Search ---- */

  const doSearch = useCallback(async (opts?: { fromMap?: { lat: number; lng: number; r: number } }) => {
    const fromMap = opts?.fromMap;
    const searchLat = fromMap?.lat ?? userLat;
    const searchLng = fromMap?.lng ?? userLng;
    const searchRadius = fromMap?.r ?? radiusKm;

    if (searchLat == null || searchLng == null) {
      setError("Localisez-vous ou entrez une adresse pour lancer la recherche.");
      return;
    }
    setLoading(true);
    setError("");
    setSearched(true);
    try {
      const data = await searchDae({
        lat: searchLat,
        lng: searchLng,
        radiusKm: searchRadius,
        accesLibre: accesLibre || undefined,
        access: accessFilter || undefined,
        distanceLat: userLat ?? searchLat,
        distanceLng: userLng ?? searchLng,
      });
      setResults(data);
      if (data.length === 0) {
        setError("Aucun défibrillateur trouvé dans cette zone. Déplacez la carte ou élargissez le rayon.");
      } else {
        setError("");
      }
    } catch {
      setError("Erreur lors de la recherche. Réessayez.");
    } finally {
      setLoading(false);
    }
  }, [userLat, userLng, radiusKm, accesLibre, accessFilter]);

  // Auto-search when user position or filters change
  useEffect(() => {
    if (userLat != null && userLng != null) {
      setSkipFitBounds(false);
      doSearch();
    }
  }, [userLat, userLng, radiusKm, accesLibre, accessFilter]);

  /* ---- Map move handler ---- */

  const handleMapMove = useCallback((lat: number, lng: number, radiusKm: number, userInitiated: boolean) => {
    lastMapViewRef.current = { lat, lng, r: radiusKm };
    if (!userInitiated || !liveReload) return;
    setSkipFitBounds(true);
    doSearch({ fromMap: { lat, lng, r: radiusKm } });
  }, [doSearch, liveReload]);

  // When user toggles live reload ON, immediately search from current map view
  const handleToggleLiveReload = useCallback((checked: boolean) => {
    setLiveReload(checked);
    if (checked && lastMapViewRef.current) {
      setSkipFitBounds(true);
      doSearch({ fromMap: lastMapViewRef.current });
    }
  }, [doSearch]);

  /* ---- Scroll to result ---- */

  const resultRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  useEffect(() => {
    if (selectedGid != null) {
      const el = resultRefs.current.get(selectedGid);
      el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [selectedGid]);

  /* ---- Render ---- */

  return (
    <div className="container py-6 sm:py-8">
      {/* Search bar */}
      <div className="bg-white border border-[#E5E5E5] rounded-lg p-4 sm:p-5 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Geolocate button */}
          <Button
            type="button"
            onClick={handleGeolocate}
            disabled={geoLoading}
            className="bg-[#000091] hover:bg-[#000070] text-white font-semibold shrink-0"
          >
            {geoLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Crosshair className="w-4 h-4 mr-2" />
            )}
            Me localiser
          </Button>

          {/* Address search */}
          <div className="relative flex-1">
            <div className="flex">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#929292]" />
                <input
                  type="text"
                  value={addressQuery}
                  onChange={(e) => handleAddressInput(e.target.value)}
                  onFocus={() =>
                    addressSuggestions.length > 0 && setShowSuggestions(true)
                  }
                  placeholder="Adresse, ville ou code postal..."
                  className="w-full pl-10 pr-4 py-2.5 border border-[#E5E5E5] rounded-lg text-sm text-[#3A3A3A] placeholder:text-[#929292] focus:outline-none focus:ring-2 focus:ring-[#000091]/30 focus:border-[#000091]"
                />
              </div>
            </div>

            {/* Autocomplete dropdown */}
            {showSuggestions && addressSuggestions.length > 0 && (
              <div className="absolute z-[1000] top-full left-0 right-0 mt-1 bg-white border border-[#E5E5E5] rounded-lg shadow-lg overflow-hidden">
                {addressSuggestions.map((f: any, i: number) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => selectAddress(f)}
                    className="w-full text-left px-4 py-2.5 text-sm text-[#3A3A3A] hover:bg-[#F6F6F6] flex items-start gap-2 transition-colors"
                  >
                    <MapPin className="w-4 h-4 text-[#000091] shrink-0 mt-0.5" />
                    <span>{f.properties.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap items-center gap-3 mt-4">
          {/* Radius */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-[#929292] uppercase tracking-wide">
              Rayon
            </label>
            <div className="relative">
              <select
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="appearance-none bg-[#F6F6F6] border border-[#E5E5E5] rounded px-3 py-1.5 pr-7 text-sm text-[#3A3A3A] focus:outline-none focus:ring-2 focus:ring-[#000091]/30"
              >
                {RADIUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#929292] pointer-events-none" />
            </div>
          </div>

          {/* Access type */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-[#929292] uppercase tracking-wide">
              Lieu
            </label>
            <div className="relative">
              <select
                value={accessFilter}
                onChange={(e) => setAccessFilter(e.target.value)}
                className="appearance-none bg-[#F6F6F6] border border-[#E5E5E5] rounded px-3 py-1.5 pr-7 text-sm text-[#3A3A3A] focus:outline-none focus:ring-2 focus:ring-[#000091]/30"
              >
                <option value="">Tous</option>
                <option value="Intérieur">Intérieur</option>
                <option value="Extérieur">Extérieur</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#929292] pointer-events-none" />
            </div>
          </div>

          {/* Acces libre toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={accesLibre}
              onChange={(e) => setAccesLibre(e.target.checked)}
              className="w-4 h-4 rounded border-[#E5E5E5] text-[#000091] focus:ring-[#000091]"
            />
            <span className="text-sm text-[#3A3A3A]">Accès libre uniquement</span>
          </label>
        </div>

        {/* Current location label */}
        {locationLabel && (
          <div className="mt-3 flex items-center gap-2 text-sm text-[#000091]">
            <Navigation className="w-3.5 h-3.5" />
            <span className="font-medium">{locationLabel}</span>
            <span className="text-[#929292]">
              ({results.length} résultat{results.length !== 1 ? "s" : ""})
            </span>
          </div>
        )}

        {error && (
          <div className="mt-3 text-sm text-[#E1000F]">{error}</div>
        )}
      </div>

      {/* Map + Results split */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Map */}
        <div className="lg:flex-1 relative">
          {/* Live reload checkbox — top-right overlay */}
          <label className="absolute top-3 right-3 z-[500] flex items-center gap-2 bg-white/95 border border-[#E5E5E5] rounded-lg px-3 py-1.5 shadow-md cursor-pointer select-none backdrop-blur-sm">
            <input
              type="checkbox"
              checked={liveReload}
              onChange={(e) => handleToggleLiveReload(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-[#E5E5E5] text-[#000091] focus:ring-[#000091]"
            />
            <span className="text-xs font-medium text-[#3A3A3A]">Rechercher en déplaçant</span>
          </label>
          <div
            className="rounded-lg overflow-hidden border border-[#E5E5E5] shadow-sm"
            style={{ height: "clamp(320px, 50vw, 520px)" }}
          >
          <MapConsentGate height={520}>
            <FindDaeMapInner
              results={results}
              userLat={userLat}
              userLng={userLng}
              selectedGid={selectedGid}
              onSelectGid={setSelectedGid}
              onMapMove={handleMapMove}
              skipFitBounds={skipFitBounds}
            />
          </MapConsentGate>
          </div>
        </div>

        {/* Results list */}
        <div className="lg:w-[380px] shrink-0">
          <div
            className="overflow-y-auto space-y-3 pr-1"
            style={{ maxHeight: "clamp(320px, 50vw, 520px)" }}
          >
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-[#000091] animate-spin" />
              </div>
            )}

            {!loading && !searched && (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-[#F6F6F6] flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-[#E1000F]" />
                </div>
                <p className="font-heading font-bold text-base text-[#3A3A3A] mb-2">
                  Trouvez un défibrillateur
                </p>
                <p className="text-sm text-[#929292] max-w-xs mx-auto">
                  Utilisez la géolocalisation ou entrez une adresse pour
                  trouver les DAE les plus proches.
                </p>
              </div>
            )}

            {!loading &&
              searched &&
              results.map((dae) => (
                <div
                  key={dae.gid}
                  ref={(el) => {
                    if (el) resultRefs.current.set(dae.gid, el);
                  }}
                  onClick={() => setSelectedGid(dae.gid)}
                  role="button"
                  tabIndex={0}
                  className={`w-full text-left bg-white border rounded-lg p-4 transition-all hover:shadow-md cursor-pointer ${
                    selectedGid === dae.gid
                      ? "border-[#000091] ring-2 ring-[#000091]/20 shadow-md"
                      : "border-[#E5E5E5]"
                  }`}
                >
                  {/* Header: name + distance */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-heading font-bold text-sm text-[#000091] leading-snug line-clamp-2">
                      {dae.nom}
                    </h3>
                    <span className="shrink-0 bg-[#F6F6F6] text-[#3A3A3A] text-xs font-bold px-2 py-0.5 rounded">
                      {formatDistance(dae.distance)}
                    </span>
                  </div>

                  {/* Address */}
                  <p className="text-xs text-[#666] mb-2">
                    {dae.adrNum} {dae.adrVoie}
                    {dae.adrVoie && ", "}
                    {dae.comCp} {dae.comNom}
                  </p>

                  {/* Badges row 1: access */}
                  <div className="flex flex-wrap gap-1.5">
                    {dae.accLib ? (
                      <span className="inline-flex items-center gap-1 bg-[#18753C]/10 text-[#18753C] text-[11px] font-semibold px-2 py-0.5 rounded-full">
                        <ShieldCheck className="w-3 h-3" />
                        Accès libre
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-[#92400E]/10 text-[#92400E] text-[11px] font-semibold px-2 py-0.5 rounded-full">
                        Accès restreint
                      </span>
                    )}

                    <span className="inline-flex items-center gap-1 bg-[#000091]/10 text-[#000091] text-[11px] font-semibold px-2 py-0.5 rounded-full">
                      <DoorOpen className="w-3 h-3" />
                      {dae.acc || "N/A"}
                      {dae.accEtg && dae.accEtg !== "0"
                        ? ` (${dae.accEtg}e ét.)`
                        : ""}
                    </span>

                    {dae.daeMobile && (
                      <span className="inline-flex items-center gap-1 bg-[#F6F6F6] text-[#666] text-[11px] font-semibold px-2 py-0.5 rounded-full">
                        <Smartphone className="w-3 h-3" />
                        Mobile
                      </span>
                    )}

                    {dae.accAcc && (
                      <span className="inline-flex items-center gap-1 bg-[#F6F6F6] text-[#666] text-[11px] font-semibold px-2 py-0.5 rounded-full">
                        <Accessibility className="w-3 h-3" />
                        PMR
                      </span>
                    )}

                    {dae.lcPed && (
                      <span className="inline-flex items-center gap-1 bg-[#F6F6F6] text-[#666] text-[11px] font-semibold px-2 py-0.5 rounded-full">
                        <Baby className="w-3 h-3" />
                        Pédiatrique
                      </span>
                    )}
                  </div>

                  {/* Badges row 2: availability */}
                  {((dae.dispJ && !dae.dispJ.includes("non renseign")) ||
                    (dae.dispH && !dae.dispH.includes("non renseign"))) && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {dae.dispJ && !dae.dispJ.includes("non renseign") && (
                        <span className="inline-flex items-center gap-1 bg-[#F6F6F6] text-[#666] text-[11px] font-medium px-2 py-0.5 rounded-full">
                          <Calendar className="w-3 h-3" />
                          {dae.dispJ.length > 35
                            ? dae.dispJ.slice(0, 35) + "..."
                            : dae.dispJ}
                        </span>
                      )}
                      {dae.dispH && !dae.dispH.includes("non renseign") && (
                        <span className="inline-flex items-center gap-1 bg-[#F6F6F6] text-[#666] text-[11px] font-medium px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3" />
                          {dae.dispH.length > 35
                            ? dae.dispH.slice(0, 35) + "..."
                            : dae.dispH}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Access details */}
                  {dae.accComplt && (
                    <p className="text-[11px] text-[#929292] mt-2 line-clamp-2">
                      {dae.accComplt}
                    </p>
                  )}

                  {/* Availability details */}
                  {dae.dispComplt && (
                    <p className="text-[11px] text-[#929292] mt-1 line-clamp-2">
                      {dae.dispComplt}
                    </p>
                  )}

                  {/* Maintenance + operator */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-2">
                    {dae.exptRais && (
                      <span className="text-[11px] text-[#929292]">
                        {dae.exptRais}
                      </span>
                    )}
                    {dae.dermnt && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#929292]">
                        <Wrench className="w-3 h-3" />
                        Maint. {dae.dermnt}
                      </span>
                    )}
                  </div>

                  {/* Directions link */}
                  <a
                    href={googleMapsDirectionsUrl(dae)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 bg-[#000091] hover:bg-[#000070] text-white text-xs font-semibold rounded transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Itinéraire Google Maps
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
