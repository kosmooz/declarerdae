"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function FloatingMobileCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("hero");
    const rdv = document.getElementById("rdv");
    if (!hero) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target.id === "hero" && !entry.isIntersecting) {
            setVisible(true);
          }
          if (entry.target.id === "hero" && entry.isIntersecting) {
            setVisible(false);
          }
          if (entry.target.id === "rdv" && entry.isIntersecting) {
            setVisible(false);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(hero);
    if (rdv) observer.observe(rdv);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: visible ? 0 : 100 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-4 py-3 pb-safe"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="text-xl font-bold text-gray-900 font-sans">89€</span>
          <span className="text-sm text-gray-500 font-sans"> TTC/mois</span>
        </div>
        <Button
          onClick={() => document.getElementById("rdv")?.scrollIntoView({ behavior: "smooth" })}
          className="bg-[#d92d20] hover:bg-[#b91c1c] text-white font-bold px-6"
        >
          Prendre RDV
        </Button>
      </div>
    </motion.div>
  );
}
