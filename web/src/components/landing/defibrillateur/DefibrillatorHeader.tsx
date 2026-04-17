"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IMAGES } from "@/data/landing-content";

export default function DefibrillatorHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="container flex items-center justify-between h-14 md:h-16">
        <div className="flex items-center gap-4">
          <Link href="/">
            <img
              src={IMAGES.logo}
              alt="Star Aid"
              className="h-9 md:h-12 w-auto"
            />
          </Link>
          <Link
            href="/"
            className="hidden md:flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-[#d92d20] transition-colors font-sans"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Link>
        </div>
        <a href="/#rdv">
          <Button className="bg-[#d92d20] hover:bg-[#b91c1c] text-white font-semibold text-sm px-4 py-2">
            Prendre RDV
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </a>
      </div>
    </header>
  );
}
