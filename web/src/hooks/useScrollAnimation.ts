"use client";

import { useRef, useEffect } from "react";

export interface ScrollData {
  offset: number;
}

export function scrollRange(offset: number, from: number, distance: number): number {
  return Math.max(0, Math.min(1, (offset - from) / distance));
}

export function useScrollFrame(
  scrollRef: React.RefObject<ScrollData | null>,
  callback: (offset: number, range: (from: number, distance: number) => number) => void
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    let raf: number;
    function animate() {
      const offset = scrollRef.current?.offset ?? 0;
      const range = (from: number, distance: number) => scrollRange(offset, from, distance);
      callbackRef.current(offset, range);
      raf = requestAnimationFrame(animate);
    }
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [scrollRef]);
}
