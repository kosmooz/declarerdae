"use client";
import { useEffect, useRef, useState } from "react";

interface StatCounterProps {
  end: number;
  suffix?: string;
  prefix?: string;
  label: string;
  sublabel?: string;
  duration?: number;
}

export default function StatCounter({ end, suffix = "", prefix = "", label, sublabel, duration = 1500 }: StatCounterProps) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const startTime = performance.now();
          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);

  return (
    <div ref={ref} className="text-center">
      <div className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-[#000091] leading-none">
        {prefix}{count.toLocaleString("fr-FR")}{suffix}
      </div>
      <div className="font-heading font-semibold text-sm sm:text-base text-[#3A3A3A] mt-2">{label}</div>
      {sublabel && <div className="text-xs text-[#929292] mt-1">{sublabel}</div>}
    </div>
  );
}
