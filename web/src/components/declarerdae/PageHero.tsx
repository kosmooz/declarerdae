import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageHeroProps {
  tag?: string;
  title: string;
  description: string;
  showCTA?: boolean;
  ctaText?: string;
  ctaHref?: string;
}

export default function PageHero({
  tag,
  title,
  description,
  showCTA = true,
  ctaText = "Déclarer mon DAE",
  ctaHref = "/declaration",
}: PageHeroProps) {
  return (
    <section className="bg-[#000091] py-12 sm:py-16">
      <div className="container-narrow">
        <div className="max-w-3xl mx-auto text-center">
          {tag && (
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#99C1F1] mb-3">
              {tag}
            </span>
          )}
          <h1 className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl text-white leading-tight mb-4">
            {title}
          </h1>
          <p className="text-base sm:text-lg text-white/80 leading-relaxed mb-6 max-w-2xl mx-auto">
            {description}
          </p>
          {showCTA && (
            <a href={ctaHref}>
              <Button size="lg" className="bg-[#E1000F] hover:bg-[#C00000] text-white font-semibold text-base px-6">
                {ctaText}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
