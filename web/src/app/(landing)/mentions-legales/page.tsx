import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb from "@/components/declarerdae/Breadcrumb";
import ScrollReveal from "@/components/declarerdae/ScrollReveal";

export const metadata: Metadata = {
  title: "Mentions légales",
  description:
    "Mentions légales de DéclarerDéfibrillateur.fr : éditeur (STAR GROUP SARL), hébergement, propriété intellectuelle, protection des données et conditions d'utilisation.",
  alternates: { canonical: "/mentions-legales" },
};

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
            <p className="text-center text-white/80 text-sm mt-2">
              Dernière mise à jour : 29 avril 2026
            </p>
          </div>
        </section>

        <section className="bg-white py-12">
          <div className="container">
            <div className="max-w-3xl mx-auto space-y-8">
              <ScrollReveal>
                <div>
                  <p className="text-sm text-[#3A3A3A] leading-relaxed">
                    Conformément aux dispositions des articles 6-III et 19 de la loi n° 2004-575 du 21 juin 2004 pour la
                    Confiance dans l'économie numérique (LCEN), il est porté à la connaissance des utilisateurs et
                    visiteurs du site <strong>declarerdefibrillateur.fr</strong> les présentes mentions légales.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div>
                  <h2 className="font-heading font-bold text-lg text-[#161616] mb-3">
                    1. Éditeur du site
                  </h2>
                  <div className="text-sm text-[#3A3A3A] leading-relaxed space-y-1">
                    <p>Le site declarerdefibrillateur.fr est édité par :</p>
                    <p className="pt-2"><strong>STAR GROUP</strong></p>
                    <p>Société à responsabilité limitée (SARL)</p>
                    <p>Capital social : 21 090,00 €</p>
                    <p>Siège social : LE MOUFIA, 4 allée des Primevères, 97490 Saint-Denis (La Réunion)</p>
                    <p>SIREN : 500 168 190</p>
                    <p>SIRET (siège) : 500 168 190 00022</p>
                    <p>RCS : 500 168 190 R.C.S. Saint-Denis-de-la-Réunion (inscription le 02/10/2007)</p>
                    <p>RNE : inscrit le 26/09/2007</p>
                    <p>N° TVA intracommunautaire : FR39500168190</p>
                    <p>Code NAF / APE : 77.29Z — Location et location-bail d'autres biens personnels et domestiques</p>
                    <p>Convention collective : Négoce et prestations de services dans les domaines médico-techniques (IDCC 1982)</p>
                    <p className="pt-2"><strong>Contact :</strong></p>
                    <p>Téléphone : +262 262 150 950</p>
                    <p>Email : info@star-aid.fr</p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div>
                  <h2 className="font-heading font-bold text-lg text-[#161616] mb-3">
                    2. Rédaction et directeur de la publication
                  </h2>
                  <div className="text-sm text-[#3A3A3A] leading-relaxed space-y-1">
                    <p>
                      Le directeur de la publication est <strong>Monsieur Frédéric GAUDIN</strong>, en sa qualité de
                      co-gérant de la société STAR GROUP.
                    </p>
                    <p className="pt-2"><strong>Contact :</strong></p>
                    <p>Téléphone : +262 262 150 950</p>
                    <p>Email : info@star-aid.fr</p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div>
                  <h2 className="font-heading font-bold text-lg text-[#161616] mb-3">
                    3. Hébergement du site
                  </h2>
                  <div className="text-sm text-[#3A3A3A] leading-relaxed space-y-1">
                    <p>Le site est hébergé par :</p>
                    <p className="pt-2"><strong>HOSTINGER operations, UAB</strong></p>
                    <p>Švitrigailos str. 34, Vilnius 03230, Lituanie</p>
                    <p>Téléphone : +370 645 03378</p>
                    <p>Email : domains@hostinger.com</p>
                    <p>
                      Site web :{" "}
                      <a
                        href="https://www.hostinger.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#000091] underline hover:no-underline"
                      >
                        www.hostinger.com
                      </a>
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div>
                  <h2 className="font-heading font-bold text-lg text-[#161616] mb-3">
                    4. Activité et objet du site
                  </h2>
                  <div className="text-sm text-[#3A3A3A] leading-relaxed space-y-3">
                    <p>
                      Le site declarerdefibrillateur.fr propose un service d'accompagnement à la déclaration des
                      défibrillateurs automatisés externes (DAE) auprès de la base de données nationale Géo'DAE,
                      conformément à l'obligation issue du <strong>décret n° 2018-1259 du 27 décembre 2018</strong> et
                      de l'<strong>arrêté du 29 octobre 2019</strong>.
                    </p>
                    <p>
                      Le service permet également la maintenance, l'entretien et le suivi réglementaire des DAE
                      installés en établissement recevant du public (ERP), conformément aux exigences du Code de la
                      santé publique.
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div>
                  <h2 className="font-heading font-bold text-lg text-[#161616] mb-3">
                    5. Propriété intellectuelle
                  </h2>
                  <div className="text-sm text-[#3A3A3A] leading-relaxed space-y-3">
                    <p>
                      L'ensemble des éléments composant le site declarerdefibrillateur.fr (structure, textes, images,
                      photographies, graphismes, logos, icônes, sons, logiciels, bases de données, mise en page) est la
                      propriété exclusive de la société STAR GROUP ou fait l'objet d'une autorisation d'utilisation. Ces
                      éléments sont protégés par les lois françaises et internationales relatives à la propriété
                      intellectuelle, notamment les articles L.111-1 et suivants du Code de la propriété intellectuelle.
                    </p>
                    <p>
                      Toute reproduction, représentation, modification, publication, transmission, dénaturation, totale
                      ou partielle du site ou de son contenu, par quelque procédé que ce soit, et sur quelque support
                      que ce soit, est strictement interdite sans l'autorisation écrite préalable de STAR GROUP. Toute
                      exploitation non autorisée du site ou de l'un quelconque des éléments qu'il contient sera
                      considérée comme constitutive d'une contrefaçon et poursuivie conformément aux articles L.335-2
                      et suivants du Code de la propriété intellectuelle.
                    </p>
                    <p>
                      Les marques, logos et noms de domaine cités sur ce site sont la propriété de leurs détenteurs
                      respectifs.
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div>
                  <h2 className="font-heading font-bold text-lg text-[#161616] mb-3">
                    6. Protection des données personnelles
                  </h2>
                  <div className="text-sm text-[#3A3A3A] leading-relaxed space-y-3">
                    <p>
                      Conformément au Règlement (UE) 2016/679 du 27 avril 2016 (RGPD) et à la loi n° 78-17 du 6 janvier
                      1978 modifiée dite « Informatique et Libertés », STAR GROUP s'engage à protéger la vie privée des
                      utilisateurs du site et à traiter leurs données personnelles avec la plus grande confidentialité.
                    </p>
                    <p>
                      Les modalités complètes de collecte, de traitement et de conservation des données, ainsi que les
                      droits dont disposent les utilisateurs (accès, rectification, effacement, opposition, portabilité,
                      limitation), sont décrites dans notre{" "}
                      <Link
                        href="/politique-de-confidentialite"
                        className="text-[#000091] underline hover:no-underline"
                      >
                        politique de protection des données personnelles
                      </Link>
                      .
                    </p>
                    <p>
                      Pour toute question relative au traitement de vos données ou pour exercer vos droits, vous pouvez
                      nous contacter à l'adresse : <strong>contact@declarerdefibrillateur.fr</strong>.
                    </p>
                    <p>
                      Vous disposez également du droit d'introduire une réclamation auprès de la Commission Nationale de
                      l'Informatique et des Libertés (CNIL) — 3 place de Fontenoy, TSA 80715, 75334 Paris Cedex 07 —{" "}
                      <a
                        href="https://www.cnil.fr"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#000091] underline hover:no-underline"
                      >
                        www.cnil.fr
                      </a>
                      .
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div>
                  <h2 className="font-heading font-bold text-lg text-[#161616] mb-3">
                    7. Cookies
                  </h2>
                  <div className="text-sm text-[#3A3A3A] leading-relaxed space-y-3">
                    <p>
                      Le site declarerdefibrillateur.fr utilise des cookies strictement nécessaires à son fonctionnement
                      (authentification, session, sécurité) ainsi que, le cas échéant, des cookies de mesure d'audience
                      anonymisés.
                    </p>
                    <p>
                      Conformément aux recommandations de la CNIL, aucun cookie non essentiel n'est déposé sans le
                      consentement préalable de l'utilisateur. Vous pouvez à tout moment paramétrer votre navigateur
                      pour refuser les cookies ou être averti avant leur dépôt.
                    </p>
                    <p>
                      Pour plus d'informations, consultez notre{" "}
                      <Link
                        href="/politique-de-confidentialite"
                        className="text-[#000091] underline hover:no-underline"
                      >
                        politique de protection des données personnelles
                      </Link>
                      .
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div>
                  <h2 className="font-heading font-bold text-lg text-[#161616] mb-3">
                    8. Limitation de responsabilité
                  </h2>
                  <div className="text-sm text-[#3A3A3A] leading-relaxed space-y-3">
                    <p>
                      Les informations diffusées sur le site declarerdefibrillateur.fr sont présentées à titre
                      informatif. STAR GROUP s'efforce de fournir des informations aussi précises et à jour que
                      possible, mais ne peut garantir l'exactitude, la complétude ou l'actualité des informations
                      diffusées sur son site.
                    </p>
                    <p>
                      L'utilisateur reconnaît utiliser ces informations sous sa responsabilité exclusive. STAR GROUP ne
                      pourra être tenue responsable des dommages directs ou indirects, quelles qu'en soient les causes,
                      origines, natures ou conséquences, résultant de la consultation ou de l'utilisation du site, et
                      notamment des pertes de données, intrusions, virus, rupture du service ou tout autre problème
                      involontaire.
                    </p>
                    <p>
                      Si vous constatez une erreur, une omission ou un dysfonctionnement, merci de nous le signaler par
                      email à <strong>contact@declarerdefibrillateur.fr</strong> en décrivant le problème (page
                      concernée, navigateur utilisé, type d'appareil).
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div>
                  <h2 className="font-heading font-bold text-lg text-[#161616] mb-3">
                    9. Liens hypertextes
                  </h2>
                  <div className="text-sm text-[#3A3A3A] leading-relaxed space-y-3">
                    <p>
                      Le site declarerdefibrillateur.fr peut contenir des liens hypertextes vers d'autres sites
                      internet, notamment vers les ressources institutionnelles (data.gouv.fr, Légifrance, Géo'DAE,
                      service-public.fr). STAR GROUP n'exerce aucun contrôle sur ces sites tiers et décline toute
                      responsabilité quant à leur contenu, leur disponibilité ou leurs pratiques en matière de
                      protection des données.
                    </p>
                    <p>
                      La création de liens hypertextes vers le site declarerdefibrillateur.fr est libre, sous réserve de
                      ne pas porter atteinte à l'image de la société et de ne pas créer de confusion sur l'origine du
                      contenu. STAR GROUP se réserve le droit de demander la suppression d'un lien jugé non conforme.
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div>
                  <h2 className="font-heading font-bold text-lg text-[#161616] mb-3">
                    10. Médiation de la consommation
                  </h2>
                  <div className="text-sm text-[#3A3A3A] leading-relaxed space-y-3">
                    <p>
                      Conformément aux articles L.611-1 et suivants du Code de la consommation, tout consommateur a le
                      droit de recourir gratuitement à un médiateur de la consommation en vue de la résolution amiable
                      d'un litige l'opposant à un professionnel.
                    </p>
                    <p>
                      Avant toute saisine du médiateur, le consommateur doit avoir tenté de résoudre le litige
                      directement auprès de STAR GROUP par une réclamation écrite à l'adresse{" "}
                      <strong>contact@declarerdefibrillateur.fr</strong>.
                    </p>
                    <p>
                      La plateforme européenne de Règlement en Ligne des Litiges (RLL) est également accessible à
                      l'adresse :{" "}
                      <a
                        href="https://ec.europa.eu/consumers/odr"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#000091] underline hover:no-underline"
                      >
                        https://ec.europa.eu/consumers/odr
                      </a>
                      .
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div>
                  <h2 className="font-heading font-bold text-lg text-[#161616] mb-3">
                    11. Droit applicable et juridiction compétente
                  </h2>
                  <p className="text-sm text-[#3A3A3A] leading-relaxed">
                    Les présentes mentions légales et l'utilisation du site sont régies par le droit français. À défaut
                    de résolution amiable, tout litige relatif à l'interprétation ou à l'exécution des présentes sera de
                    la compétence exclusive des tribunaux du ressort de la Cour d'appel de Saint-Denis-de-la-Réunion,
                    sauf disposition légale impérative contraire.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div>
                  <h2 className="font-heading font-bold text-lg text-[#161616] mb-3">
                    12. Contact
                  </h2>
                  <div className="text-sm text-[#3A3A3A] leading-relaxed space-y-1">
                    <p>Pour toute question relative aux présentes mentions légales :</p>
                    <p className="pt-2"><strong>STAR GROUP</strong></p>
                    <p>LE MOUFIA, 4 allée des Primevères</p>
                    <p>97490 Saint-Denis (La Réunion)</p>
                    <p>Email : contact@declarerdefibrillateur.fr</p>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
