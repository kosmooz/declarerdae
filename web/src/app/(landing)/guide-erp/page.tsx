import Breadcrumb from "@/components/declarerdae/Breadcrumb";
import PageHero from "@/components/declarerdae/PageHero";
import CTABanner from "@/components/declarerdae/CTABanner";
import ScrollReveal from "@/components/declarerdae/ScrollReveal";
import { ArrowRight, Building2, Calendar, CheckCircle2, HelpCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const erpCategories = [
  {
    cat: "Catégorie 1",
    capacity: "Plus de 1 500 personnes",
    examples: "Grands centres commerciaux, stades, salles de concert, aéroports",
    deadline: "1er janvier 2020",
    color: "border-[#E1000F]",
    bg: "bg-[#FEF3F2]",
  },
  {
    cat: "Catégorie 2",
    capacity: "701 à 1 500 personnes",
    examples: "Cinémas multiplexes, grandes surfaces, salles de spectacle",
    deadline: "1er janvier 2020",
    color: "border-[#E1000F]",
    bg: "bg-[#FEF3F2]",
  },
  {
    cat: "Catégorie 3",
    capacity: "301 à 700 personnes",
    examples: "Restaurants, hôtels, supermarchés, salles de sport",
    deadline: "1er janvier 2020",
    color: "border-[#E1000F]",
    bg: "bg-[#FEF3F2]",
  },
  {
    cat: "Catégorie 4",
    capacity: "Jusqu'à 300 personnes",
    examples: "Petits commerces, bars, boutiques, salons de coiffure",
    deadline: "1er janvier 2021",
    color: "border-[#000091]",
    bg: "bg-[#EFF6FF]",
  },
  {
    cat: "Catégorie 5",
    capacity: "Selon seuils réglementaires",
    examples: "Structures d'accueil pour personnes âgées, refuges de montagne, établissements sportifs clos et couverts, gares, hôtels-restaurants d'altitude",
    deadline: "1er janvier 2022",
    color: "border-[#18753C]",
    bg: "bg-[#F0FDF4]",
  },
];

const erpTypes = [
  { type: "J", desc: "Structures d'accueil pour personnes âgées ou handicapées" },
  { type: "L", desc: "Salles d'auditions, de conférences, de réunions, de spectacles" },
  { type: "M", desc: "Magasins de vente, centres commerciaux" },
  { type: "N", desc: "Restaurants et débits de boissons" },
  { type: "O", desc: "Hôtels et pensions de famille" },
  { type: "P", desc: "Salles de danse et salles de jeux" },
  { type: "R", desc: "Établissements d'enseignement, colonies de vacances" },
  { type: "S", desc: "Bibliothèques, centres de documentation" },
  { type: "T", desc: "Salles d'expositions" },
  { type: "U", desc: "Établissements sanitaires" },
  { type: "V", desc: "Établissements de culte" },
  { type: "W", desc: "Administrations, banques, bureaux" },
  { type: "X", desc: "Établissements sportifs couverts" },
  { type: "Y", desc: "Musées" },
];

export default function GuideERPPage() {
  return (
    <>
      <Breadcrumb items={[{ label: "Guide ERP" }]} />
      <PageHero
        tag="Guide pratique"
        title="Guide complet : ERP et obligation de défibrillateur"
        description="Tout comprendre sur l'obligation d'équipement en DAE pour les Établissements Recevant du Public (ERP). Catégories, calendrier, types d'ERP concernés."
      />

      <main>
        {/* Qu'est-ce qu'un ERP */}
        <section className="bg-white py-12">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <ScrollReveal>
                <h2 className="font-heading font-bold text-xl text-[#161616] mb-4">
                  Qu'est-ce qu'un Établissement Recevant du Public (ERP) ?
                </h2>
                <div className="space-y-4 text-sm text-[#3A3A3A] leading-relaxed">
                  <p>
                    Un <strong>Établissement Recevant du Public (ERP)</strong> est un bâtiment, un local ou une enceinte dans lequel des personnes extérieures sont admises, que l'accès soit payant ou gratuit, libre, restreint ou sur invitation. Les ERP sont classés en catégories selon leur capacité d'accueil et en types selon la nature de leur activité.
                  </p>
                  <p>
                    La loi n°2018-527 du 28 juin 2018 impose à certaines catégories d'ERP de s'équiper d'au moins un défibrillateur automatisé externe (DAE) et de le déclarer dans la base nationale Géo'DAE. Le calendrier de mise en œuvre est progressif, de 2020 à 2022.
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Catégories ERP */}
        <section className="bg-[#F6F6F6] py-12">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <ScrollReveal>
                <h2 className="font-heading font-bold text-xl text-[#161616] mb-2">
                  Calendrier d'obligation par catégorie d'ERP
                </h2>
                <p className="text-sm text-[#666] mb-8 leading-relaxed">
                  Le décret n°2018-1186 du 19 décembre 2018 définit le calendrier progressif d'obligation d'équipement en DAE pour les ERP.
                </p>
              </ScrollReveal>

              <div className="space-y-4">
                {erpCategories.map((erp, i) => (
                  <ScrollReveal key={i} delay={i * 100}>
                    <div className={`border-l-4 ${erp.color} ${erp.bg} p-3 sm:p-5 rounded-r`}>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                        <h3 className="font-heading font-bold text-base text-[#161616]">{erp.cat}</h3>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold bg-white/80 px-2 py-1 rounded">
                          <Calendar className="w-3 h-3" />
                          Obligatoire depuis le {erp.deadline}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-[#666]" />
                        <span className="text-sm font-medium text-[#3A3A3A]">{erp.capacity}</span>
                      </div>
                      <p className="text-sm text-[#666]">
                        <strong>Exemples :</strong> {erp.examples}
                      </p>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA intermédiaire */}
        <CTABanner
          title="Votre ERP est concerné ? Déclarez votre DAE en 5 minutes"
          buttonText="Déclarer maintenant"
          href="/declaration"
          variant="danger"
          compact
        />

        {/* Types d'ERP */}
        <section className="bg-white py-12">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <ScrollReveal>
                <h2 className="font-heading font-bold text-xl text-[#161616] mb-2">
                  Types d'ERP concernés
                </h2>
                <p className="text-sm text-[#666] mb-6 leading-relaxed">
                  Les ERP sont classés en types selon la nature de leur activité. Voici la liste des types d'ERP soumis à l'obligation d'équipement en DAE.
                </p>
              </ScrollReveal>

              <ScrollReveal>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border border-[#E5E5E5] rounded overflow-hidden">
                    <thead>
                      <tr className="bg-[#000091] text-white">
                        <th className="text-left py-2.5 px-4 font-heading font-semibold w-16">Type</th>
                        <th className="text-left py-2.5 px-4 font-heading font-semibold">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {erpTypes.map((item, i) => (
                        <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-[#F6F6F6]"}>
                          <td className="py-2.5 px-4 font-heading font-bold text-[#000091]">{item.type}</td>
                          <td className="py-2.5 px-4 text-[#3A3A3A]">{item.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Cas particuliers catégorie 5 */}
        <section className="bg-[#F6F6F6] py-12">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <ScrollReveal>
                <h2 className="font-heading font-bold text-xl text-[#161616] mb-4">
                  Cas particuliers : ERP de catégorie 5
                </h2>
                <div className="space-y-4 text-sm text-[#3A3A3A] leading-relaxed">
                  <p>
                    Les ERP de catégorie 5 ne sont pas tous soumis à l'obligation d'équipement. Seuls certains types sont concernés, en fonction de seuils spécifiques définis par le décret :
                  </p>
                  <div className="bg-white border border-[#E5E5E5] rounded p-3 sm:p-5 space-y-3">
                    {[
                      "Structures d'accueil pour personnes âgées (type J)",
                      "Structures d'accueil pour personnes handicapées (type J)",
                      "Établissements sportifs clos et couverts (type X)",
                      "Refuges de montagne",
                      "Établissements de plein air (type PA)",
                      "Chapiteaux, tentes et structures (type CTS)",
                      "Gares et stations de métro",
                      "Hôtels-restaurants d'altitude",
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#18753C] mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Checklist */}
        <section className="bg-white py-12">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <ScrollReveal>
                <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded p-4 sm:p-6">
                  <h2 className="font-heading font-bold text-lg text-[#000091] mb-4 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5" />
                    Checklist : mon ERP est-il en conformité ?
                  </h2>
                  <div className="space-y-3">
                    {[
                      "Mon établissement est équipé d'au moins un DAE fonctionnel",
                      "Le DAE est accessible au public (signalétique visible)",
                      "Le DAE est déclaré dans la base nationale Géo'DAE",
                      "La maintenance du DAE est à jour (électrodes, batterie)",
                      "Mon assurance couvre la mise à disposition du DAE",
                      "La signalétique est conforme à la norme NF EN ISO 7010",
                    ].map((item, i) => (
                      <label key={i} className="flex items-start gap-3 cursor-pointer group">
                        <input type="checkbox" className="mt-1 w-4 h-4 rounded border-[#CECECE] text-[#000091] focus:ring-[#000091]" />
                        <span className="text-sm text-[#3A3A3A] group-hover:text-[#000091] transition-colors">{item}</span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-5 pt-4 border-t border-[#BFDBFE]">
                    <p className="text-sm text-[#1E40AF] mb-3">
                      Si vous n'avez pas coché toutes les cases, votre établissement n'est pas en conformité.
                    </p>
                    <a href="/declaration">
                      <Button className="bg-[#000091] hover:bg-[#000070] text-white font-semibold px-6">
                        Mettre mon ERP en conformité
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </a>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* CTA final */}
        <CTABanner
          title="Besoin d'aide pour déclarer les DAE de votre ERP ?"
          subtitle="Déclaration en lot disponible pour les établissements multi-sites"
          buttonText="Déclarer mes DAE"
          href="/declaration"
          variant="primary"
        />
      </main>
    </>
  );
}