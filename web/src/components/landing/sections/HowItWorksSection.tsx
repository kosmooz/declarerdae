"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Zap, FileCheck, Headphones, GraduationCap, Wrench, ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STEPS } from "@/data/landing-content";
import Link from "next/link";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FileCheck,
  Headphones,
  GraduationCap,
  Wrench,
};

const stepColors = [
  { bg: "bg-[#d92d20]", light: "bg-[#d92d20]/10", ring: "ring-[#d92d20]/20" },
  { bg: "bg-[#b42318]", light: "bg-[#b42318]/10", ring: "ring-[#b42318]/20" },
  { bg: "bg-[#912018]", light: "bg-[#912018]/10", ring: "ring-[#912018]/20" },
  { bg: "bg-[#7a271a]", light: "bg-[#7a271a]/10", ring: "ring-[#7a271a]/20" },
];

/* ─── Animated SVG connector for desktop ─── */
function AnimatedConnector() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <div ref={ref} className="absolute top-10 left-[12.5%] right-[12.5%] h-2 pointer-events-none">
      <svg
        className="w-full h-full overflow-visible"
        viewBox="0 0 1000 8"
        preserveAspectRatio="none"
        fill="none"
      >
        {/* Background track */}
        <path
          d="M 0 4 L 1000 4"
          stroke="#d92d2015"
          strokeWidth="3"
          strokeDasharray="8 6"
        />
        {/* Animated fill */}
        <motion.path
          d="M 0 4 L 1000 4"
          stroke="#d92d20"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={inView ? { pathLength: 1 } : {}}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
        />
      </svg>
    </div>
  );
}

/* ─── Desktop step card ─── */
function DesktopStepCard({ item, index }: { item: (typeof STEPS)[number]; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const Icon = iconMap[item.iconName];
  const color = stepColors[index];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={
        inView
          ? { opacity: 1, y: 0, scale: 1 }
          : {}
      }
      transition={{
        duration: 0.5,
        delay: index * 0.15,
        type: "spring",
        stiffness: 100,
        damping: 14,
      }}
      whileHover={{ y: -8, transition: { duration: 0.25 } }}
      className="relative group cursor-default"
    >
      {/* Card */}
      <div className="relative bg-white rounded-2xl p-6 pt-12 border border-gray-100 shadow-sm group-hover:shadow-xl group-hover:border-[#d92d20]/20 transition-shadow duration-300">
        {/* Floating number badge */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={inView ? { scale: 1, rotate: 0 } : {}}
          transition={{
            delay: index * 0.15 + 0.2,
            type: "spring",
            stiffness: 200,
            damping: 12,
          }}
          className="absolute -top-6 left-1/2 -translate-x-1/2 z-10"
        >
          <div className={`relative w-12 h-12 ${color.bg} text-white rounded-xl flex items-center justify-center text-lg font-bold font-sans shadow-lg ring-4 ${color.ring} group-hover:scale-110 transition-transform duration-300`}>
            {item.step}
          </div>
        </motion.div>

        {/* Icon */}
        <div className={`w-10 h-10 ${color.light} rounded-lg flex items-center justify-center mx-auto mb-3`}>
          {Icon && <Icon className="w-5 h-5 text-[#d92d20]" />}
        </div>

        <h3 className="text-sm font-bold text-gray-900 mb-2 font-sans text-center">
          {item.title}
        </h3>
        <p className="text-xs text-gray-500 font-sans leading-relaxed text-center">
          {item.desc}
        </p>
      </div>

      {/* Arrow connector between cards (not on last) */}
      {index < STEPS.length - 1 && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: index * 0.15 + 0.4 }}
          className="absolute -right-5 top-1/2 -translate-y-1/2 z-20 hidden lg:block"
        >
          <ChevronRight className="w-5 h-5 text-[#d92d20]/40" />
        </motion.div>
      )}
    </motion.div>
  );
}

/* ─── Mobile step card ─── */
function MobileStepCard({ item, index }: { item: (typeof STEPS)[number]; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const Icon = iconMap[item.iconName];
  const color = stepColors[index];
  const isEven = index % 2 === 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: isEven ? -30 : 30 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        type: "spring",
        stiffness: 100,
        damping: 14,
      }}
      className="relative flex items-start gap-4"
    >
      {/* Number + dot on timeline */}
      <motion.div
        initial={{ scale: 0 }}
        animate={inView ? { scale: 1 } : {}}
        transition={{ delay: index * 0.1 + 0.1, type: "spring", stiffness: 200, damping: 12 }}
        className="flex-shrink-0 relative z-10"
      >
        <div className={`w-11 h-11 ${color.bg} text-white rounded-xl flex items-center justify-center text-sm font-bold font-sans shadow-lg`}>
          {item.step}
        </div>
      </motion.div>

      {/* Content */}
      <div className="flex-1 pb-8">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-1.5">
            {Icon && <Icon className="w-4 h-4 text-[#d92d20]" />}
            <h3 className="text-sm font-bold text-gray-900 font-sans">{item.title}</h3>
          </div>
          <p className="text-xs text-gray-500 font-sans leading-relaxed">{item.desc}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Animated vertical line for mobile ─── */
function MobileTimeline() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <div ref={ref} className="absolute left-[21px] top-0 bottom-0 w-0.5">
      <div className="w-full h-full bg-[#d92d20]/10 rounded-full" />
      <motion.div
        className="absolute top-0 left-0 w-full bg-[#d92d20] rounded-full origin-top"
        initial={{ scaleY: 0 }}
        animate={inView ? { scaleY: 1 } : {}}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />
    </div>
  );
}

/* ─── Header ─── */
function SectionHeader() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="text-center max-w-3xl mx-auto mb-14 md:mb-16"
    >
      <div className="inline-flex items-center gap-2 text-[#d92d20] text-xs font-bold uppercase tracking-wider mb-3 font-sans">
        <Zap className="w-4 h-4" />
        Simple et rapide
      </div>
      <h2 className="text-2xl md:text-3xl lg:text-4xl text-gray-900 mb-3">
        Comment <span className="text-[#d92d20]">ça marche</span> ?
      </h2>
      <p className="text-base text-gray-600 font-sans">
        En 4 étapes simples, votre établissement est protégé.
      </p>
    </motion.div>
  );
}

/* ─── Main section ─── */
export default function HowItWorksSection() {
  return (
    <section id="comment" className="py-14 md:py-24 bg-gradient-to-b from-gray-50/50 to-white">
      <div className="container">
        <SectionHeader />

        {/* Desktop: horizontal cards with animated connector */}
        <div className="hidden md:block relative">
          <AnimatedConnector />
          <div className="grid grid-cols-4 gap-8 lg:gap-10">
            {STEPS.map((item, i) => (
              <DesktopStepCard key={i} item={item} index={i} />
            ))}
          </div>
        </div>

        {/* Mobile: vertical timeline */}
        <div className="md:hidden relative pl-2">
          <MobileTimeline />
          <div className="space-y-0">
            {STEPS.map((item, i) => (
              <MobileStepCard key={i} item={item} index={i} />
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link href="/souscrire">
            <Button size="lg" className="bg-[#d92d20] hover:bg-[#b91c1c] text-white font-bold text-sm px-8 py-5 shadow-lg shadow-red-900/20">
              Souscrire en 3 minutes
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
