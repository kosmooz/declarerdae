"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, Map, Cookie, ChevronDown, ChevronUp } from "lucide-react";
import { getConsent, setConsent, hasConsented } from "@/lib/cookie-consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [mapsEnabled, setMapsEnabled] = useState(true);

  useEffect(() => {
    if (!hasConsented()) {
      setVisible(true);
    }

    const handleChange = () => {
      if (!hasConsented()) {
        setVisible(true);
        setShowDetails(false);
        setMapsEnabled(true);
      }
    };
    window.addEventListener("cookie-consent-change", handleChange);
    return () => window.removeEventListener("cookie-consent-change", handleChange);
  }, []);

  if (!visible) return null;

  const handleAcceptAll = () => {
    setConsent(true);
    setVisible(false);
  };

  const handleRefuseAll = () => {
    setConsent(false);
    setVisible(false);
  };

  const handleSavePreferences = () => {
    setConsent(mapsEnabled);
    setVisible(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-[9999] border-t-[3px] border-[#000091] bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.15)]">
      <div className="container max-w-4xl py-5 px-4 sm:px-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex items-center justify-center w-9 h-9 rounded bg-[#EFF6FF] shrink-0 mt-0.5">
            <Cookie className="w-5 h-5 text-[#000091]" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-base text-[#161616]">
              Gestion des cookies
            </h2>
            <p className="text-sm text-[#3A3A3A] leading-relaxed mt-1">
              Ce site utilise des cookies strictement necessaires a son fonctionnement.
              Certaines fonctionnalites optionnelles (cartographie) necessitent des
              connexions a des services tiers.{" "}
              <Link
                href="/politique-de-confidentialite"
                className="text-[#000091] underline"
              >
                En savoir plus
              </Link>
            </p>
          </div>
        </div>

        {showDetails && (
          <div className="mb-4 space-y-3 pl-0 sm:pl-12">
            <div className="flex items-center justify-between bg-[#F6F6F6] border border-[#E5E5E5] rounded p-3">
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-[#18753C]" />
                <div>
                  <p className="text-sm font-semibold text-[#161616]">Cookies essentiels</p>
                  <p className="text-xs text-[#666]">
                    Authentification, sauvegarde formulaire. Indispensables au fonctionnement du site.
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-[#18753C] bg-[#F0FDF4] border border-[#BBF7D0] rounded-full px-2.5 py-0.5 shrink-0">
                Toujours actifs
              </span>
            </div>

            <div className="flex items-center justify-between bg-[#F6F6F6] border border-[#E5E5E5] rounded p-3">
              <div className="flex items-center gap-2.5">
                <Map className="w-4 h-4 text-[#000091]" />
                <div>
                  <p className="text-sm font-semibold text-[#161616]">Cartographie</p>
                  <p className="text-xs text-[#666]">
                    Affichage des cartes via Mapbox et CartoDB. Transmet des donnees de navigation a ces services (USA).
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={mapsEnabled}
                onClick={() => setMapsEnabled(!mapsEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
                  mapsEnabled ? "bg-[#000091]" : "bg-[#CECECE]"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    mapsEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 pl-0 sm:pl-12">
          <button
            type="button"
            onClick={handleRefuseAll}
            className="px-4 py-2.5 text-sm font-semibold border border-[#000091] text-[#000091] rounded hover:bg-[#EFF6FF] transition-colors"
          >
            Tout refuser
          </button>
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="px-4 py-2.5 text-sm font-semibold border border-[#E5E5E5] text-[#3A3A3A] rounded hover:bg-[#F6F6F6] transition-colors flex items-center justify-center gap-1.5"
          >
            Personnaliser
            {showDetails ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
          {showDetails ? (
            <button
              type="button"
              onClick={handleSavePreferences}
              className="px-4 py-2.5 text-sm font-semibold bg-[#000091] text-white rounded hover:bg-[#000070] transition-colors"
            >
              Enregistrer mes choix
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAcceptAll}
              className="px-4 py-2.5 text-sm font-semibold bg-[#000091] text-white rounded hover:bg-[#000070] transition-colors"
            >
              Tout accepter
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
