"use client";

import { useEffect, useState } from "react";
import Breadcrumb from "@/components/declarerdae/Breadcrumb";
import ScrollReveal from "@/components/declarerdae/ScrollReveal";
import CookieSettingsButton from "@/components/declarerdae/CookieSettingsButton";

interface RgpdInfo {
  dpo: { name: string | null; email: string | null; address: string | null; phone: string | null };
  company: { name: string | null; address: string | null };
}

export default function PolitiqueClient() {
  const [rgpd, setRgpd] = useState<RgpdInfo | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch("/api/health/rgpd-info", { signal: ctrl.signal })
      .then((r) => r.json())
      .then(setRgpd)
      .catch((err: unknown) => { if ((err as Error).name !== "AbortError") console.error("[rgpd-info]", err); });
    return () => ctrl.abort();
  }, []);

  const dpoEmail = rgpd?.dpo?.email || "contact@declarerdefibrillateur.fr";
  const dpoName = rgpd?.dpo?.name;

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
                    Le responsable du traitement des données personnelles collectées sur le site declarerdefibrillateur.fr est la société {rgpd?.company?.name || "Déclarer Défibrillateur"}, SAS, dont le siège social est situé à {rgpd?.company?.address || "Paris, France"}. Vous pouvez nous contacter à l&apos;adresse email : contact@declarerdefibrillateur.fr.
                  </p>
                </div>
              </ScrollReveal>

              {/* DPO section */}
              <ScrollReveal>
                <div>
                  <h2 className="font-heading font-bold text-lg text-[#161616] mb-3">
                    2. Délégué à la protection des données (DPO)
                  </h2>
                  <div className="text-sm text-[#3A3A3A] leading-relaxed">
                    {dpoName ? (
                      <div className="bg-[#F6F6F6] border border-[#E5E5E5] rounded p-4 space-y-1">
                        <p><strong>Nom :</strong> {dpoName}</p>
                        <p><strong>Email :</strong>{" "}
                          <a href={`mailto:${dpoEmail}`} className="text-[#000091] underline">{dpoEmail}</a>
                        </p>
                        {rgpd?.dpo?.address && <p><strong>Adresse :</strong> {rgpd.dpo.address}</p>}
                        {rgpd?.dpo?.phone && <p><strong>Téléphone :</strong> {rgpd.dpo.phone}</p>}
                      </div>
                    ) : (
                      <p>
                        Pour toute question relative à la protection de vos données personnelles, vous pouvez contacter notre délégué à la protection des données à l&apos;adresse :{" "}
                        <a href={`mailto:${dpoEmail}`} className="text-[#000091] underline">{dpoEmail}</a>.
                      </p>
                    )}
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div>
                  <h2 className="font-heading font-bold text-lg text-[#161616] mb-3">
                    3. Données collectées
                  </h2>
                  <div className="text-sm text-[#3A3A3A] leading-relaxed space-y-3">
                    <p>Dans le cadre de la déclaration de votre DAE, nous collectons les données suivantes :</p>
                    <div className="bg-[#F6F6F6] border border-[#E5E5E5] rounded p-4 space-y-2">
                      <p><strong>Données d&apos;identification :</strong> nom, prénom, email, téléphone de l&apos;exploitant</p>
                      <p><strong>Données de l&apos;établissement :</strong> raison sociale, SIRET, adresse, type d&apos;établissement</p>
                      <p><strong>Données du DAE :</strong> marque, modèle, numéro de série, type, date d&apos;installation, localisation GPS, photos, accessibilité</p>
                      <p><strong>Données de navigation :</strong> adresse IP, type de navigateur (à des fins de sécurité et de suivi des consentements)</p>
                      <p><strong>Données de contact :</strong> nom, prénom, email, téléphone, message (formulaire de contact)</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div>
                  <h2 className="font-heading font-bold text-lg text-[#161616] mb-3">
                    4. Finalités du traitement
                  </h2>
                  <div className="text-sm text-[#3A3A3A] leading-relaxed space-y-2">
                    <p>Les données personnelles collectées sont traitées pour les finalités suivantes :</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Traitement de votre déclaration de DAE et enregistrement dans la base nationale Géo&apos;DAE</li>
                      <li>Vérification de la conformité de votre déclaration</li>
                      <li>Délivrance de l&apos;attestation de déclaration</li>
                      <li>Communication relative à votre dossier (demandes de compléments, confirmation)</li>
                      <li>Réponse à vos demandes de contact</li>
                      <li>Gestion de votre compte utilisateur</li>
                      <li>Amélioration de nos services et statistiques d&apos;utilisation</li>
                    </ul>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div>
                  <h2 className="font-heading font-bold text-lg text-[#161616] mb-3">
                    5. Base légale du traitement
                  </h2>
                  <div className="text-sm text-[#3A3A3A] leading-relaxed space-y-2">
                    <p>Le traitement de vos données repose sur les bases légales suivantes :</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li><strong>Obligation légale :</strong> la déclaration des DAE est une obligation réglementaire (décret n&deg;2018-1259)</li>
                      <li><strong>Exécution contractuelle :</strong> traitement nécessaire à l&apos;exécution du service de déclaration et de souscription</li>
                      <li><strong>Intérêt légitime :</strong> amélioration de nos services, sécurité, réponse aux demandes de contact</li>
                      <li><strong>Consentement :</strong> pour les cookies de cartographie et la soumission du formulaire de déclaration</li>
                    </ul>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div>
                  <h2 className="font-heading font-bold text-lg text-[#161616] mb-3">
                    6. Destinataires et sous-traitants
                  </h2>
                  <div className="text-sm text-[#3A3A3A] leading-relaxed space-y-3">
                    <p>Vos données personnelles sont destinées :</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>A notre équipe interne chargée du traitement des déclarations</li>
                      <li>A la base de données nationale Géo&apos;DAE (Ministère de la Santé) pour l&apos;enregistrement de votre DAE</li>
                    </ul>
                    <p className="font-semibold mt-2">Sous-traitants :</p>
                    <div className="bg-[#F6F6F6] border border-[#E5E5E5] rounded p-4 space-y-2">
                      <p><strong>Géo&apos;DAE / Atlasante</strong> (France) — Base nationale des DAE, transmission obligatoire dans le cadre du décret n&deg;2018-1259</p>
                      <p><strong>Yousign</strong> (France) — Signature électronique des contrats de souscription</p>
                      <p><strong>Mapbox</strong> (USA) — Affichage de cartes satellite, soumis à votre consentement cookies</p>
                      <p><strong>CartoDB / CARTO</strong> (USA) — Tuiles cartographiques, soumis à votre consentement cookies</p>
                      <p><strong>Base Adresse Nationale</strong> (France, service public) — Géocodage des adresses</p>
                    </div>
                    <p className="mt-2">
                      <strong>Aucune donnée n&apos;est vendue ou cédée à des tiers à des fins commerciales.</strong>
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div>
                  <h2 className="font-heading font-bold text-lg text-[#161616] mb-3">
                    7. Durée de conservation
                  </h2>
                  <div className="text-sm text-[#3A3A3A] leading-relaxed space-y-2">
                    <div className="bg-[#F6F6F6] border border-[#E5E5E5] rounded p-4 space-y-2">
                      <p><strong>Déclarations DAE :</strong> durée de validité + 3 ans après la dernière interaction</p>
                      <p><strong>Brouillons non soumis :</strong> 6 mois sans activité puis suppression automatique</p>
                      <p><strong>Compte utilisateur :</strong> durée du compte + 3 ans après suppression</p>
                      <p><strong>Souscriptions :</strong> durée du contrat + 5 ans (prescription légale)</p>
                      <p><strong>Données de contact :</strong> 13 mois après la demande</p>
                      <p><strong>Logs d&apos;authentification :</strong> 13 mois</p>
                      <p><strong>Consentements :</strong> 5 ans (preuve de consentement)</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div>
                  <h2 className="font-heading font-bold text-lg text-[#161616] mb-3">
                    8. Vos droits
                  </h2>
                  <div className="text-sm text-[#3A3A3A] leading-relaxed space-y-2">
                    <p>Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, vous disposez des droits suivants :</p>
                    <div className="bg-[#F6F6F6] border border-[#E5E5E5] rounded p-4 space-y-2">
                      <p><strong>Droit d&apos;accès :</strong> obtenir la confirmation que vos données sont traitées et en obtenir une copie</p>
                      <p><strong>Droit de rectification :</strong> demander la correction de données inexactes ou incomplètes</p>
                      <p><strong>Droit à l&apos;effacement :</strong> demander la suppression de vos données dans les conditions prévues par le RGPD</p>
                      <p><strong>Droit à la limitation :</strong> demander la limitation du traitement de vos données</p>
                      <p><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré et couramment utilisé</p>
                      <p><strong>Droit d&apos;opposition :</strong> vous opposer au traitement de vos données pour des motifs légitimes</p>
                    </div>
                    <p className="mt-2">
                      <strong>Exercice en libre-service :</strong> si vous disposez d&apos;un compte, rendez-vous dans l&apos;onglet{" "}
                      <a href="/dashboard/mes-donnees" className="text-[#000091] underline">Mes données</a>{" "}
                      de votre espace personnel pour exporter ou supprimer vos données.
                    </p>
                    <p>
                      Vous pouvez également exercer vos droits par email à :{" "}
                      <a href={`mailto:${dpoEmail}`} className="text-[#000091] underline font-medium">{dpoEmail}</a>
                    </p>
                    <p>
                      Vous disposez du droit d&apos;introduire une réclamation auprès de la CNIL :{" "}
                      <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-[#000091] underline">www.cnil.fr</a>.
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div>
                  <h2 className="font-heading font-bold text-lg text-[#161616] mb-3">
                    9. Cookies
                  </h2>
                  <div className="text-sm text-[#3A3A3A] leading-relaxed space-y-3">
                    <p>Le site declarerdefibrillateur.fr utilise deux catégories de cookies :</p>
                    <div className="bg-[#F6F6F6] border border-[#E5E5E5] rounded p-4 space-y-2">
                      <p><strong>Cookies essentiels</strong> (toujours actifs) : authentification (JWT), sauvegarde locale du formulaire de déclaration (localStorage). Ces cookies sont indispensables au fonctionnement du site et ne nécessitent pas votre consentement.</p>
                      <p><strong>Cookies de cartographie</strong> (soumis à consentement) : affichage des cartes via Mapbox et CartoDB. Ces services tiers (USA) reçoivent des données de navigation (coordonnées de la zone affichée, adresse IP). Vous pouvez les accepter ou les refuser via le bandeau de gestion des cookies.</p>
                    </div>
                    <p>
                      Aucun cookie publicitaire ou de traçage n&apos;est utilisé. Aucun outil de mesure d&apos;audience n&apos;est installé.
                    </p>
                    <p>
                      Vous pouvez modifier vos préférences à tout moment :{" "}
                      <CookieSettingsButton />
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div>
                  <h2 className="font-heading font-bold text-lg text-[#161616] mb-3">
                    10. Sécurité
                  </h2>
                  <p className="text-sm text-[#3A3A3A] leading-relaxed">
                    Nous mettons en oeuvre des mesures techniques et organisationnelles appropriées pour protéger vos données personnelles : chiffrement des échanges via HTTPS/TLS, hachage des mots de passe (argon2id), contrôle d&apos;accès par rôles, journalisation des accès et modifications, sauvegarde régulière des données.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div>
                  <h2 className="font-heading font-bold text-lg text-[#161616] mb-3">
                    11. Modifications
                  </h2>
                  <p className="text-sm text-[#3A3A3A] leading-relaxed">
                    Nous nous réservons le droit de modifier la présente politique de confidentialité à tout moment. Toute modification sera publiée sur cette page avec la date de mise à jour. En cas de modification substantielle, un nouveau consentement pourra vous être demandé.
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
