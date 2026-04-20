import { ShieldCheck, Award, Clock, Users, FileCheck, Lock } from "lucide-react";
import ScrollReveal from "@/components/declarerdae/ScrollReveal";

const badges = [
  { icon: ShieldCheck, label: "Conforme décret 2018-1259", color: "text-[#000091]" },
  { icon: Award, label: "Attestation d'enregistrement", color: "text-[#18753C]" },
  { icon: Clock, label: "Déclaration en 5 min", color: "text-[#E1000F]" },
  { icon: Users, label: "+1 000 DAE déclarés", color: "text-[#000091]" },
  { icon: FileCheck, label: "Enregistrement Géo'DAE", color: "text-[#18753C]" },
  { icon: Lock, label: "Données protégées RGPD", color: "text-[#92400E]" },
];

export default function TrustBadges() {
  return (
    <ScrollReveal>
      <div className="flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-8 gap-y-3">
        {badges.map((badge, i) => (
          <div key={i} className="flex items-center gap-2">
            <badge.icon className={`w-4 h-4 ${badge.color}`} />
            <span className="text-xs font-medium text-[#3A3A3A] whitespace-nowrap">{badge.label}</span>
          </div>
        ))}
      </div>
    </ScrollReveal>
  );
}
