import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface CTABannerProps {
  title: string;
  subtitle?: string;
  buttonText: string;
  href: string;
  variant?: "primary" | "danger" | "success";
  compact?: boolean;
  isAnchor?: boolean;
}

const variantStyles = {
  primary: { bg: "bg-[#000091]", btn: "bg-[#E1000F] hover:bg-[#C00000] text-white", title: "text-white", subtitle: "text-white/75" },
  danger: { bg: "bg-[#E1000F]", btn: "bg-white hover:bg-[#F6F6F6] text-[#E1000F]", title: "text-white", subtitle: "text-white/80" },
  success: { bg: "bg-[#18753C]", btn: "bg-white hover:bg-[#F6F6F6] text-[#18753C]", title: "text-white", subtitle: "text-white/80" },
};

export default function CTABanner({ title, subtitle, buttonText, href, variant = "primary", compact = false, isAnchor = false }: CTABannerProps) {
  const styles = variantStyles[variant];
  const buttonEl = (
    <Button size={compact ? "default" : "lg"} className={`${styles.btn} font-semibold text-base px-6`}>
      {buttonText}
      <ArrowRight className="w-5 h-5 ml-2" />
    </Button>
  );

  return (
    <section className={`${styles.bg} ${compact ? "py-6 sm:py-8" : "py-8 sm:py-10"}`}>
      <div className="container-narrow">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className={compact ? "" : "max-w-xl"}>
            <p className={`font-heading font-bold ${compact ? "text-base sm:text-lg" : "text-lg sm:text-xl lg:text-2xl"} ${styles.title} leading-snug`}>{title}</p>
            {subtitle && <p className={`text-sm mt-1 ${styles.subtitle}`}>{subtitle}</p>}
          </div>
          {isAnchor ? (
            <a href={href} className="shrink-0">{buttonEl}</a>
          ) : (
            <Link href={href} className="shrink-0">{buttonEl}</Link>
          )}
        </div>
      </div>
    </section>
  );
}
