"use client";

import { useState, useEffect, type ReactNode } from "react";
import { Map } from "lucide-react";
import { isMapsAllowed, setConsent } from "@/lib/cookie-consent";

interface MapConsentGateProps {
  children: ReactNode;
  height?: number;
}

export default function MapConsentGate({
  children,
  height = 300,
}: MapConsentGateProps) {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    setAllowed(isMapsAllowed());

    const handleChange = () => setAllowed(isMapsAllowed());
    window.addEventListener("cookie-consent-change", handleChange);
    return () =>
      window.removeEventListener("cookie-consent-change", handleChange);
  }, []);

  if (allowed) return <>{children}</>;

  return (
    <div
      className="rounded-sm border border-[#CECECE] bg-[#F6F6F6] flex flex-col items-center justify-center gap-3 px-4"
      style={{ height }}
    >
      <Map className="w-8 h-8 text-[#929292]" />
      <p className="text-sm text-[#666] text-center max-w-xs">
        La carte necessite des cookies de cartographie (Mapbox).
        Acceptez-les pour afficher la carte.
      </p>
      <button
        type="button"
        onClick={() => {
          setConsent(true);
          setAllowed(true);
        }}
        className="px-4 py-2 text-sm font-semibold bg-[#000091] text-white rounded hover:bg-[#000070] transition-colors"
      >
        Accepter et afficher la carte
      </button>
    </div>
  );
}
