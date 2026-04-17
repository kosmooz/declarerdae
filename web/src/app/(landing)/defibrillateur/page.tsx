"use client";

import { Suspense, lazy, useRef, useCallback, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useIsMobile } from "@/hooks/useMobile";
import type { ScrollData } from "@/hooks/useScrollAnimation";
import DefibrillatorHeader from "@/components/landing/defibrillateur/DefibrillatorHeader";
import LoadingFallback from "@/components/landing/defibrillateur/LoadingFallback";
import HeroOverlay from "@/components/landing/defibrillateur/HeroOverlay";
import FeaturesOverlay from "@/components/landing/defibrillateur/FeaturesOverlay";
import SpecsOverlay from "@/components/landing/defibrillateur/SpecsOverlay";
import UsageOverlay from "@/components/landing/defibrillateur/UsageOverlay";
import CTAOverlay from "@/components/landing/defibrillateur/CTAOverlay";

const DefibrillatorScene = lazy(
  () => import("@/components/landing/defibrillateur/DefibrillatorScene")
);
const MobileFallback = lazy(
  () => import("@/components/landing/defibrillateur/MobileFallback")
);

const PAGES = 5;

function DesktopExperience() {
  const scrollRef = useRef<ScrollData>({ offset: 0 });
  const [modelLoaded, setModelLoaded] = useState(false);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const maxScroll = el.scrollHeight - el.clientHeight;
    scrollRef.current.offset = maxScroll > 0 ? el.scrollTop / maxScroll : 0;
  }, []);

  return (
    <>
      <DefibrillatorHeader />
      <div className="fixed inset-0 pt-14 md:pt-16 bg-[#fafafa]">
        {/* 3D Canvas - always mounted, Suspense INSIDE keeps WebGL alive */}
        <Canvas
          camera={{ position: [0, 0, 5], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
          style={{ position: "absolute", inset: 0 }}
        >
          <Suspense fallback={null}>
            <DefibrillatorScene scrollRef={scrollRef} onReady={() => setModelLoaded(true)} />
          </Suspense>
        </Canvas>

        {/* Loading overlay - visible until 3D model is ready */}
        {!modelLoaded && (
          <div className="absolute inset-0 bg-[#fafafa] flex flex-col items-center justify-center z-10 transition-opacity duration-500">
            <div className="w-10 h-10 border-4 border-[#d92d20]/20 border-t-[#d92d20] rounded-full animate-spin mb-4" />
            <p className="text-gray-400 font-sans text-sm tracking-wider uppercase">
              Chargement 3D...
            </p>
          </div>
        )}

        {/* Scrollable HTML layer - transparent, on top of Canvas */}
        <div
          className="absolute inset-0 overflow-y-auto"
          onScroll={handleScroll}
          style={{ scrollbarWidth: "none" }}
        >
          <div style={{ height: `${PAGES * 100}vh`, position: "relative" }}>
            <HeroOverlay scrollRef={scrollRef} />
            <FeaturesOverlay scrollRef={scrollRef} />
            <SpecsOverlay scrollRef={scrollRef} />
            <UsageOverlay scrollRef={scrollRef} />
            <CTAOverlay scrollRef={scrollRef} />
          </div>
        </div>
      </div>
    </>
  );
}

export default function DefibrillateurPage() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <MobileFallback />
      </Suspense>
    );
  }

  return <DesktopExperience />;
}
