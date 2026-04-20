import Breadcrumb from "@/components/declarerdae/Breadcrumb";
import PageHero from "@/components/declarerdae/PageHero";
import CTABanner from "@/components/declarerdae/CTABanner";
import ScrollReveal from "@/components/declarerdae/ScrollReveal";
import { ArrowRight, Heart, Shield, Target, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AProposPage() {
  return (
    <>
      <Breadcrumb items={[{ label: "À propos" }]} />
      <PageHero
        tag="Notre mission"
        title="Simplifier la déclaration des défibrillateurs pour sauver des vies"
        description="Nous croyons que chaque défibrillateur déclaré est une vie potentiellement sauvée. Notre mission : rendre la conformité accessible à tous."
        showCTA={false}
      />

      <main>
        {/* Notre histoire */}
        <section className="bg-white py-12">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <ScrollReveal>
                <h2 className="font-heading font-bold text-xl text-[#161616] mb-4">
                  Pourquoi declarerdefibrillateur.fr ?
                </h2>
                <div className="space-y-4 text-sm text-[#3A3A3A] leading-relaxed">
                  <p>
                    En France, chaque année, entre 40 000 et 50 000 personnes sont victimes d'un arrêt cardiaque soudain. Le taux de survie est aujourd'hui inférieur à 10 %, l'un des plus bas d'Europe occidentale. Pourtant, lorsqu'un DAE est utilisé dans les premières minutes, le taux de survie est majoré à 50 %.
                  </p>
                  <p>
                    Depuis 2018, la loi impose à tous les exploitants de DAE de déclarer leurs appareils dans la base nationale Géo'DAE. L'objectif est simple : permettre aux services de secours et aux citoyens de localiser instantanément le défibrillateur le plus proche en cas d'urgence.
                  </p>
                  <p>
                    Malheureusement, au 13 janvier 2026, seuls 165 500 DAE sur les 500 000 installés en France étaient recensés dans Géo'DAE (source : PPL n° 274 du Sénat). La procédure officielle, jugée complexe et chronophage par de nombreux exploitants, constitue un frein majeur à la conformité.
                  </p>
                  <p>
                    <strong>C'est pour combler ce fossé que declarerdefibrillateur.fr a été créé.</strong> Notre plateforme automatise et simplifie l'intégralité du processus de déclaration, de la collecte des informations à l'enregistrement dans Géo'DAE, en passant par la vérification de conformité et la délivrance d'une attestation d'enregistrement.
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Nos valeurs */}
        <section className="bg-[#F6F6F6] py-12">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <ScrollReveal>
                <h2 className="font-heading font-bold text-xl text-[#161616] mb-8 text-center">
                  Nos valeurs
                </h2>
              </ScrollReveal>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {[
                  {
                    icon: Heart,
                    title: "Engagement citoyen",
                    desc: "Chaque défibrillateur déclaré est un maillon supplémentaire dans la chaîne de survie. Nous contribuons activement à la santé publique en facilitant la localisation des DAE sur tout le territoire.",
                    color: "text-[#E1000F]",
                    bg: "bg-[#FEF3F2]",
                  },
                  {
                    icon: Zap,
                    title: "Simplicité",
                    desc: "Nous croyons que la conformité ne devrait pas être un parcours du combattant. Notre plateforme a été conçue pour être intuitive, rapide et accessible à tous, sans connaissance technique.",
                    color: "text-[#000091]",
                    bg: "bg-[#EFF6FF]",
                  },
                  {
                    icon: Shield,
                    title: "Fiabilité",
                    desc: "Chaque déclaration est vérifiée par notre équipe avant enregistrement. Nous garantissons la conformité de vos données au standard réglementaire défini par l'arrêté du 29 octobre 2019.",
                    color: "text-[#18753C]",
                    bg: "bg-[#F0FDF4]",
                  },
                  {
                    icon: Users,
                    title: "Accompagnement",
                    desc: "Nous ne sommes pas qu'une plateforme. Notre équipe est disponible pour répondre à vos questions, vous guider dans vos démarches et vous accompagner dans la durée.",
                    color: "text-[#92400E]",
                    bg: "bg-[#FEF9C3]",
                  },
                ].map((item, i) => (
                  <ScrollReveal key={i} delay={i * 100}>
                    <div className="bg-white border border-[#E5E5E5] rounded p-4 sm:p-6 h-full">
                      <div className={`inline-flex items-center justify-center w-10 h-10 rounded ${item.bg} mb-4`}>
                        <item.icon className={`w-5 h-5 ${item.color}`} />
                      </div>
                      <h3 className="font-heading font-bold text-base text-[#161616] mb-2">{item.title}</h3>
                      <p className="text-sm text-[#666] leading-relaxed">{item.desc}</p>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Chiffres clés */}
        <section className="bg-[#000091] py-12">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <ScrollReveal>
                <h2 className="font-heading font-bold text-xl text-white mb-8 text-center">
                  Nos chiffres clés
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-center">
                  {[
                    { value: "1 000+", label: "DAE déclarés" },
                    { value: "98%", label: "Taux de satisfaction" },
                    { value: "< 5 min", label: "Temps moyen" },
                    { value: "24h", label: "Délai attestation" },
                  ].map((item, i) => (
                    <div key={i}>
                      <p className="font-heading font-black text-2xl sm:text-3xl text-white mb-1">{item.value}</p>
                      <p className="text-sm text-white/70">{item.label}</p>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Notre engagement */}
        <section className="bg-white py-12">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <ScrollReveal>
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded bg-[#F0FDF4] shrink-0">
                    <Target className="w-6 h-6 text-[#18753C]" />
                  </div>
                  <div>
                    <h2 className="font-heading font-bold text-xl text-[#161616] mb-3">
                      Notre objectif : 100 % des DAE déclarés
                    </h2>
                    <div className="space-y-3 text-sm text-[#3A3A3A] leading-relaxed">
                      <p>
                        Aujourd'hui, près de 2 défibrillateurs sur 3 en France ne sont pas déclarés. Cela signifie que des milliers d'appareils, pourtant installés et fonctionnels, restent invisibles pour les services de secours et les citoyens en situation d'urgence.
                      </p>
                      <p>
                        Notre ambition est de contribuer à ce que chaque DAE installé en France soit déclaré, localisable et fonctionnel. C'est un objectif ambitieux, mais chaque déclaration nous en rapproche.
                      </p>
                      <p>
                        En choisissant declarerdefibrillateur.fr, vous ne faites pas qu'une démarche administrative : vous participez à un effort collectif pour sauver des vies.
                      </p>
                    </div>
                    <div className="mt-5">
                      <a href="/declaration">
                        <Button className="bg-[#18753C] hover:bg-[#145F30] text-white font-semibold px-6">
                          Rejoindre le mouvement
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        <CTABanner
          title="Prêt à déclarer votre DAE ?"
          subtitle="Rejoignez les milliers d'exploitants en conformité"
          buttonText="Déclarer maintenant"
          href="/declaration"
          variant="primary"
        />
      </main>
    </>
  );
}