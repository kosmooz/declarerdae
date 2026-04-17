"use client";

import { useState, useEffect } from "react";

export function useSectionInView(sectionId: string, threshold = 0.3) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = document.getElementById(sectionId);
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [sectionId, threshold]);
  return inView;
}
