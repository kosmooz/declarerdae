"use client";
import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function StickyFooterCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 600);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-[#E5E5E5] shadow-[0_-4px_12px_rgba(0,0,0,0.1)] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-transform duration-300">
      <Link href="/declaration" className="block">
        <Button className="w-full bg-[#E1000F] hover:bg-[#C00000] text-white font-semibold text-base py-3 h-auto">
          Déclarer mon DAE maintenant
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </Link>
      <p className="text-center text-xs text-[#929292] mt-1">
        5 min — 100% conforme — Attestation sous 24h
      </p>
    </div>
  );
}
