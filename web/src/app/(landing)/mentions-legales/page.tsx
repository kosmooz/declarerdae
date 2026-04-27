import type { Metadata } from "next";
import Breadcrumb from "@/components/declarerdae/Breadcrumb";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales de DéclarerDéfibrillateur.fr : éditeur, hébergement, conditions d'utilisation et politique de protection des données.",
  alternates: { canonical: "/mentions-legales" },
};
import ScrollReveal from "@/components/declarerdae/ScrollReveal";

export default function MentionsLegalesPage() {
  return (
    <>
      <Breadcrumb items={[{ label: "Mentions légales" }]} />

      <main className="flex-1">
        <section className="bg-[#000091] py-10">
          <div className="container">
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-white text-center">
              Mentions légales
            </h1>
          </div>
        </section>

        <section className="bg-white py-12">
          <div className="container">
            <div className="max-w-3xl mx-auto space-y-8">
              <ScrollReveal>
                <div>
                  <h2 className="font-heading font-bold text-lg text-[#161616] mb-3">
                    1. Éditeur du site
                  </h2>
                  <div className="text-sm text-[#3A3A3A] leading-relaxed space-y-1">
                    <p>Le site declarerdefibrillateur.fr est édité par :</p>
                    <p><strong>Déclarer Défibrillateur</strong></p>
                    <p>Société par actions simplifiée (SAS)</p>
                    <p>Siège social : Paris, France</p>
                    <p>Email : contact@declarerdefibrillateur.fr</p>
                    <p>Téléphone : 01 23 45 67 89</p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div>
                  <h2 className="font-heading font-bold text-lg text-[#161616] mb-3">
                    2. Directeur de la publication
                  </h2>
                  <p className="text-sm text-[#3A3A3A] leading-relaxed">
                    Le directeur de la publication est le représentant légal de la société Déclarer Défibrillateur.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div>
                  <h2 className="font-heading font-bold text-lg text-[#161616] mb-3">
                    3. Hébergement
                  </h2>
                  <div className="text-sm text-[#3A3A3A] leading-relaxed space-y-1">
                    <p>Le site est hébergé par :</p>
                    <p><strong>Manus</strong></p>
                    <p>Service d'hébergement web</p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div>
                  <h2 className="font-heading font-bold text-lg text-[#161616] mb-3">
                    4. Propriété intellectuelle
                  </h2>
                  <p className="text-sm text-[#3A3A3A] leading-relaxed">
                    L'ensemble des contenus présents sur le site declarerdefibrillateur.fr (textes, images, graphismes, logo, icônes, sons, logiciels) est protégé par les lois en vigueur sur la propriété intellectuelle. Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable de Déclarer Défibrillateur.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div>
                  <h2 className="font-heading font-bold text-lg text-[#161616] mb-3">
                    5. Limitation de responsabilité
                  </h2>
                  <div className="text-sm text-[#3A3A3A] leading-relaxed space-y-3">
                    <p>
                      Les informations contenues sur ce site sont aussi précises que possible et le site est périodiquement remis à jour, mais peut toutefois contenir des inexactitudes, des omissions ou des lacunes. Si vous constatez une lacune, erreur ou ce qui paraît être un dysfonctionnement, merci de bien vouloir le signaler par email à contact@declarerdefibrillateur.fr.
                    </p>
                    <p>
                      Déclarer Défibrillateur ne pourra être tenu responsable des dommages directs et indirects causés au matériel de l'utilisateur, lors de l'accès au site declarerdefibrillateur.fr. Déclarer Défibrillateur décline toute responsabilité quant à l'utilisation qui pourrait être faite des informations et contenus présents sur le site.
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div>
                  <h2 className="font-heading font-bold text-lg text-[#161616] mb-3">
                    6. Liens hypertextes
                  </h2>
                  <p className="text-sm text-[#3A3A3A] leading-relaxed">
                    Le site declarerdefibrillateur.fr peut contenir des liens hypertextes vers d'autres sites internet. Les liens vers ces autres ressources vous font quitter le site declarerdefibrillateur.fr. Déclarer Défibrillateur n'est pas responsable du contenu des sites tiers.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div>
                  <h2 className="font-heading font-bold text-lg text-[#161616] mb-3">
                    7. Droit applicable
                  </h2>
                  <p className="text-sm text-[#3A3A3A] leading-relaxed">
                    Les présentes mentions légales sont régies par le droit français. En cas de litige, les tribunaux français seront seuls compétents.
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}