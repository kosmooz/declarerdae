"use client";

import { Heart } from "lucide-react";

export default function LoadingFallback() {
  return (
    <div className="fixed inset-0 bg-gray-950 flex flex-col items-center justify-center z-40">
      <Heart className="w-12 h-12 text-[#d92d20] animate-heartbeat mb-4" />
      <p className="text-gray-400 font-sans text-sm tracking-wider uppercase">
        Chargement...
      </p>
    </div>
  );
}
