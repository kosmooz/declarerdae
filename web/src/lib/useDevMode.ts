"use client";

import { useMemo } from "react";

export function useDevMode() {
  const isDev = process.env.NODE_ENV === "development";

  return useMemo(
    () => ({
      isDev,
      bgShield: "bg-[#000091]",
      bgActive: "bg-white/15",
      borderSpinner: "border-[#000091]",
      textAccent: "text-[#000091]",
    }),
    [isDev],
  );
}
