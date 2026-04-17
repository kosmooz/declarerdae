"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Phone } from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { FAQ_ITEMS, CONTACT } from "@/data/landing-content";

function ScrollReveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay, ease: "easeOut" }} className={className}>
      {children}
    </motion.div>
  );
}

export default function FAQSection() {
  const leftFaqs = FAQ_ITEMS.slice(0, 5);
  const rightFaqs = FAQ_ITEMS.slice(5);

  return (
    <section id="faq" className="py-14 md:py-20 bg-white">
      <div className="container">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-2xl md:text-3xl lg:text-4xl text-gray-900 mb-3">
              Questions <span className="text-[#d92d20]">fréquentes</span>
            </h2>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-4 md:gap-6">
            {/* Left column */}
            <Accordion type="single" collapsible className="space-y-3">
              {leftFaqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-l-${i}`} className="bg-gray-50 rounded-xl border border-gray-200 px-4">
                  <AccordionTrigger className="text-left font-semibold text-gray-900 font-sans text-sm py-4 hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 font-sans text-sm leading-relaxed pb-4">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            {/* Right column */}
            <Accordion type="single" collapsible className="space-y-3">
              {rightFaqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-r-${i}`} className="bg-gray-50 rounded-xl border border-gray-200 px-4">
                  <AccordionTrigger className="text-left font-semibold text-gray-900 font-sans text-sm py-4 hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 font-sans text-sm leading-relaxed pb-4">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="text-center mt-8">
            <p className="text-sm text-gray-600 font-sans mb-2">Une autre question ?</p>
            <a href={CONTACT.phoneHref} className="inline-flex items-center gap-2 text-[#d92d20] font-bold text-sm font-sans hover:underline">
              <Phone className="w-4 h-4" />
              {CONTACT.phone}
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
