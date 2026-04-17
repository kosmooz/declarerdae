import Breadcrumb from "@/components/declarerdae/Breadcrumb";
import ScrollReveal from "@/components/declarerdae/ScrollReveal";

export default function PolitiqueConfidentialitePage() {
  return (
    <>
      <Breadcrumb items={[{ label: "Politique de confidentialité" }]} />

      <main className="flex-1">
        <section className="bg-[#000091] py-10">
          <div className="container">
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-white text-center">
              Politique de confidentialité
            </h1>
            <p className="text-white/70 text-sm text-center mt-2">Dernière mise à jour : avril 2026</p>
          </div>
        </section>

        <section className="bg-white py-12">
          <div className="container">
            <div className="max-w-3xl mx-auto space-y-8">
              <ScrollReveal>
                <div>
                  <h2 className="font-heading font-bold text-lg text-[#161616] mb-3">
                    1. Responsable du traitement
                  </h2>
                  <p className="text-sm text-[#3A3A3A] leading-relaxed">
                    Le responsable du traitement des données personnelles collectées sur le site declarerdefibrillateur.fr est la société Déclarer Défibrillateur, SAS, dont le siège social est situé à Paris, France. Vous pouvez nous contacter à l'adresse email : contact@declarerdefibrillateur.fr.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div>
                  <h2 className="font-heading font-bold text-lg text-[#161616] mb-3">
                    2. Données collectées
                  </h2>
                  <div className="text-sm text-[#3A3A3A] leading-relaxed space-y-3">
                    <p>Dans le cadre de la déclaration de votre DAE, nous collectons les données suivantes :</p>
                    <div className="bg-[#F6F6F6] border border-[#E5E5E5] rounded p-4 space-y-2">
                      <p><strong>Données d'identification :</strong> nom, prénom, email, téléphone de l'exploitant</p>
                      <p><strong>Données de l'établissement :</strong> raison sociale, SIRET, adresse, type d'établissement</p>
                      <p><strong>Données du DAE :</strong> marque, modèle, numéro de série, type, date d'installation, localisation, accessibilité</p>
                      <p><strong>Données de navigation :</strong> adresse IP, type de navigateur, pages visitées (à des fins statistiques uniquement)</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div>
                  <h2 className="font-heading font-bold text-lg text-[#161616] mb-3">
                    3. Finalités du traitement
                  </h2>
                  <div className="text-sm text-[#3A3A3A] leading-relaxed space-y-2">
                    <p>Les données personnelles collectées sont traitées pour les finalités suivantes :</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Traitement de votre déclaration de DAE et enregistrement dans la base nationale Géo'DAE</li>
                      <li>Vérification de la conformité de votre déclaration</li>
                      <li>Délivrance de l'attestation de déclaration</li>
                      <li>Communication relative à votre dossier (demandes de compléments, confirmation)</li>
                      <li>Envoi de rappels de maintenance (si vous avez souscrit à cette option)</li>
                      <li>Amélioration de nos services et statistiques d'utilisation</li>
                    </ul>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div>
                  <h2 className="font-heading font-bold text-lg text-[#161616] mb-3">
                    4. Base légale du traitement
                  </h2>
                  <div className="text-sm text-[#3A3A3A] leading-relaxed space-y-2">
                    <p>Le traitement de vos données repose sur les bases légales suivantes :</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li><strong>Obligation légale :</strong> la déclaration des DAE est une obligation réglementaire (décret n°2018-1259)</li>
                      <li><strong>Exécution contractuelle :</strong> traitement nécessaire à l'exécution du service de déclaration</li>
                      <li><strong>Intérêt légitime :</strong> amélioration de nos services et statistiques d'utilisation</li>
                      <li><strong>Consentement :</strong> pour l'envoi de communications commerciales (le cas échéant)</li>
                    </ul>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div>
                  <h2 className="font-heading font-bold text-lg text-[#161616] mb-3">
                    5. Destinataires des données
                  </h2>
                  <div className="text-sm text-[#3A3A3A] leading-relaxed space-y-2">
                    <p>Vos données personnelles sont destinées :</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>À notre équipe interne chargée du traitement des déclarations</li>
                      <li>À la base de données nationale Géo'DAE (Ministère de la Santé) pour l'enregistrement de votre DAE</li>
                      <li>À nos sous-traitants techniques (hébergement, email) dans le strict cadre de leurs missions</li>
                    </ul>
                    <p className="mt-2">
                      <strong>Aucune donnée n'est vendue ou cédée à des tiers à des fins commerciales.</strong>
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div>
                  <h2 className="font-heading font-bold text-lg text-[#161616] mb-3">
                    6. Durée de conservation
                  </h2>
                  <p className="text-sm text-[#3A3A3A] leading-relaxed">
                    Les données relatives à votre déclaration sont conservées pendant toute la durée de validité de la déclaration et pendant une durée de 3 ans après la dernière interaction avec notre service. Les données de navigation sont conservées pendant 13 mois conformément aux recommandations de la CNIL.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div>
                  <h2 className="font-heading font-bold text-lg text-[#161616] mb-3">
                    7. Vos droits
                  </h2>
                  <div className="text-sm text-[#3A3A3A] leading-relaxed space-y-2">
                    <p>Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, vous disposez des droits suivants :</p>
                    <div className="bg-[#F6F6F6] border border-[#E5E5E5] rounded p-4 space-y-2">
                      <p><strong>Droit d'accès :</strong> obtenir la confirmation que vos données sont traitées et en obtenir une copie</p>
                      <p><strong>Droit de rectification :</strong> demander la correction de données inexactes ou incomplètes</p>
                      <p><strong>Droit à l'effacement :</strong> demander la suppression de vos données dans les conditions prévues par le RGPD</p>
                      <p><strong>Droit à la limitation :</strong> demander la limitation du traitement de vos données</p>
                      <p><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré et couramment utilisé</p>
                      <p><strong>Droit d'opposition :</strong> vous opposer au traitement de vos données pour des motifs légitimes</p>
                    </div>
                    <p className="mt-2">
                      Pour exercer ces droits, contactez-nous à : <strong>contact@declarerdefibrillateur.fr</strong>
                    </p>
                    <p>
                      Vous disposez également du droit d'introduire une réclamation auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés) : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-[#000091] underline">www.cnil.fr</a>.
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div>
                  <h2 className="font-heading font-bold text-lg text-[#161616] mb-3">
                    8. Cookies
                  </h2>
                  <p className="text-sm text-[#3A3A3A] leading-relaxed">
                    Le site declarerdefibrillateur.fr utilise des cookies strictement nécessaires au fonctionnement du site et des cookies de mesure d'audience anonymisés. Aucun cookie publicitaire ou de traçage n'est utilisé. Vous pouvez paramétrer votre navigateur pour refuser les cookies.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div>
                  <h2 className="font-heading font-bold text-lg text-[#161616] mb-3">
                    9. Sécurité
                  </h2>
                  <p className="text-sm text-[#3A3A3A] leading-relaxed">
                    Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données personnelles contre tout accès non autorisé, modification, divulgation ou destruction. Les échanges de données sont chiffrés via le protocole HTTPS/TLS.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div>
                  <h2 className="font-heading font-bold text-lg text-[#161616] mb-3">
                    10. Modifications
                  </h2>
                  <p className="text-sm text-[#3A3A3A] leading-relaxed">
                    Nous nous réservons le droit de modifier la présente politique de confidentialité à tout moment. Toute modification sera publiée sur cette page avec la date de mise à jour. Nous vous encourageons à consulter régulièrement cette page.
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