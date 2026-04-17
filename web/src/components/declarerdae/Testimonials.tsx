import { Star, Quote } from "lucide-react";
import ScrollReveal from "@/components/declarerdae/ScrollReveal";

const testimonials = [
  {
    name: "Marie-Claire Dubois",
    role: "Directrice, Mairie de Sceaux",
    text: "Nous avions 12 DAE à déclarer dans nos bâtiments municipaux. La procédure classique nous aurait pris des jours. Grâce à ce service, tout a été fait en une matinée. L'attestation est arrivée le lendemain.",
    stars: 5,
  },
  {
    name: "Philippe Martin",
    role: "Gérant, Salle de sport FitClub",
    text: "En tant qu'ERP de catégorie 4, je ne savais même pas que j'avais une obligation de déclaration. L'équipe m'a guidé de A à Z. Simple, rapide, et maintenant je suis en conformité.",
    stars: 5,
  },
  {
    name: "Dr. Sophie Lefèvre",
    role: "Pharmacienne, Paris 11e",
    text: "Le formulaire est vraiment intuitif. J'ai déclaré mon DAE en 4 minutes chrono. Le fait de recevoir une attestation officielle est très rassurant pour mes obligations professionnelles.",
    stars: 5,
  },
  {
    name: "Jean-Marc Rousseau",
    role: "Président, Association sportive locale",
    text: "Notre club de football avait besoin de déclarer son défibrillateur. Le processus était limpide et l'accompagnement excellent. Je recommande sans hésitation.",
    stars: 5,
  },
];

export default function Testimonials() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-5 max-w-4xl mx-auto">
      {testimonials.map((t, i) => (
        <ScrollReveal key={i} delay={i * 100}>
          <div className="bg-white border border-[#E5E5E5] rounded p-4 sm:p-5 h-full flex flex-col">
            <Quote className="w-6 h-6 text-[#000091]/20 mb-3" />
            <p className="text-sm text-[#3A3A3A] leading-relaxed flex-1 italic">
              &ldquo;{t.text}&rdquo;
            </p>
            <div className="mt-4 pt-3 border-t border-[#F6F6F6] flex items-center justify-between">
              <div>
                <p className="font-heading font-semibold text-sm text-[#161616]">{t.name}</p>
                <p className="text-xs text-[#929292]">{t.role}</p>
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      ))}
    </div>
  );
}
