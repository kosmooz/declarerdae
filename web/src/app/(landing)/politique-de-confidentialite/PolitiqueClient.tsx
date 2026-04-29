"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
      .catch((err: unknown) => {
        if ((err as Error).name !== "AbortError") console.error("[rgpd-info]", err);
      });
    return () => ctrl.abort();
  }, []);

  const dpoEmail = rgpd?.dpo?.email || "info@star-aid.fr";
  const dpoName = rgpd?.dpo?.name;

  return (
    <>
      <Breadcrumb items={[{ label: "Politique de confidentialité" }]} />

      <main className="flex-1">
        <section className="bg-[#000091] py-10">
          <div className="container">
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-white text-center">
              Politique de protection des données personnelles
            </h1>
            <p className="text-white/70 text-sm text-center mt-2">Dernière mise à jour : 29 avril 2026</p>
          </div>
        </section>

        <section className="bg-white py-12">
          <div className="container">
            <div className="max-w-3xl mx-auto space-y-8">
              {/* Préambule */}
              <ScrollReveal>
                <div>
                  <h2 className="font-heading font-bold text-lg text-[#161616] mb-3">Préambule</h2>
                  <div className="text-sm text-[#3A3A3A] leading-relaxed space-y-3">
                    <p>
                      La société <strong>STAR GROUP</strong>, éditrice du site declarerdefibrillateur.fr (ci-après « le
                      Site »), accorde une importance particulière à la protection des données personnelles de ses
                      utilisateurs. La présente politique a pour objet d'informer les personnes concernées, de manière
                      claire, transparente et accessible, sur les modalités de collecte, d'utilisation et de
                      conservation de leurs données personnelles.
                    </p>
                    <p>
                      Cette politique est conforme au <strong>Règlement (UE) 2016/679 du 27 avril 2016</strong> relatif
                      à la protection des personnes physiques à l'égard du traitement des données à caractère personnel
                      (« RGPD ») et à la <strong>loi n° 78-17 du 6 janvier 1978 modifiée</strong> dite « Informatique
                      et Libertés ».
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              {/* 1. Responsable de traitement */}
              <ScrollReveal>
                <div>
                  <h2 className="font-heading font-bold text-lg text-[#161616] mb-3">
                    1. Responsable du traitement
                  </h2>
                  <div className="text-sm text-[#3A3A3A] leading-relaxed space-y-2">
                    <p>Le responsable du traitement au sens de l'article 4 du RGPD est :</p>
                    <div className="bg-[#F6F6F6] border border-[#E5E5E5] rounded p-4 space-y-1">
                      <p><strong>{rgpd?.company?.name || "STAR GROUP"}</strong></p>
                      <p>SARL au capital de 21 090 €</p>
                      <p>SIREN : 500 168 190 — RCS Saint-Denis-de-la-Réunion</p>
                      <p>{rgpd?.company?.address || "LE MOUFIA, 4 allée des Primevères, 97490 Saint-Denis (La Réunion)"}</p>
                      <p>Téléphone : +262 262 150 950</p>
                      <p>Email : info@star-aid.fr</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* 2. DPO */}
              <ScrollReveal>
                <div>
                  <h2 className="font-heading font-bold text-lg text-[#161616] mb-3">
                    2. Délégué à la protection des données (DPO)
                  </h2>
                  <div className="text-sm text-[#3A3A3A] leading-relaxed space-y-2">
                    <p>
                      Pour toute question, demande d'exercice de vos droits ou réclamation relative au traitement de
                      vos données personnelles, vous pouvez contacter notre Délégué à la Protection des Données :
                    </p>
                    <div className="bg-[#F6F6F6] border border-[#E5E5E5] rounded p-4 space-y-1">
                      {dpoName && <p><strong>Nom :</strong> {dpoName}</p>}
                      <p>
                        <strong>Email :</strong>{" "}
                        <a href={`mailto:${dpoEmail}`} className="text-[#000091] underline hover:no-underline">
                          {dpoEmail}
                        </a>
                      </p>
                      {rgpd?.dpo?.phone && <p><strong>Téléphone :</strong> {rgpd.dpo.phone}</p>}
                      {rgpd?.dpo?.address && <p><strong>Adresse postale :</strong> {rgpd.dpo.address}</p>}
                      {!rgpd?.dpo?.address && (
                        <p>
                          <strong>Adresse postale :</strong> STAR GROUP — DPO, LE MOUFIA, 4 allée des Primevères, 97490
                          Saint-Denis (La Réunion)
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* 3. Données collectées */}
              <ScrollReveal>
                <div>
                  <h2 className="font-heading font-bold text-lg text-[#161616] mb-3">
                    3. Données personnelles collectées
                  </h2>
                  <div className="text-sm text-[#3A3A3A] leading-relaxed space-y-3">
                    <p>
                      Nous ne collectons que les données strictement nécessaires aux finalités décrites ci-après
                      (principe de minimisation, art. 5.1.c RGPD). Aucune donnée sensible au sens de l'article 9 du
                      RGPD (santé, opinions, etc.) n'est collectée.
                    </p>

                    <p className="font-semibold pt-2">3.1. Données de compte utilisateur</p>
                    <div className="bg-[#F6F6F6] border border-[#E5E5E5] rounded p-4 space-y-1">
                      <p>Email, mot de passe (haché en argon2id, jamais stocké en clair), nom, prénom, téléphone,
                        société, SIRET, numéro de TVA, rôle (utilisateur / administrateur), date de création, date de
                        mise à jour, statut de vérification de l'email.</p>
                    </div>

                    <p className="font-semibold pt-2">3.2. Données de la déclaration DAE (exploitant)</p>
                    <div className="bg-[#F6F6F6] border border-[#E5E5E5] rounded p-4 space-y-1">
                      <p>Nom et prénom du contact, raison sociale, SIREN, SIRET, code APE/NAF, code INSEE, adresse
                        complète, code postal, commune, téléphone (avec indicatif pays), email.</p>
                    </div>

                    <p className="font-semibold pt-2">3.3. Données du site d'installation</p>
                    <div className="bg-[#F6F6F6] border border-[#E5E5E5] rounded p-4 space-y-1">
                      <p>Nom de l'établissement, type d'ERP, adresse, code postal, commune, code INSEE, coordonnées GPS
                        (latitude / longitude via la Base Adresse Nationale), score de précision géographique, deux
                        numéros de téléphone de contact site (avec indicatifs).</p>
                    </div>

                    <p className="font-semibold pt-2">3.4. Données du défibrillateur (DAE)</p>
                    <div className="bg-[#F6F6F6] border border-[#E5E5E5] rounded p-4 space-y-1">
                      <p>Nom donné au DAE, fabricant, modèle, numéro de série, type (DEA/DSA), identifiant européen
                        (IUD), date d'installation, date de dernière maintenance, fréquence de maintenance, mainteneur,
                        type d'accès (intérieur/extérieur, accès libre, étage, complément d'accès, poste de sécurité,
                        accueil), caractère mobile, jours et heures de disponibilité, état de fonctionnement,
                        coordonnées GPS spécifiques, dates de péremption des électrodes adultes/pédiatriques, photos du
                        DAE et de son emplacement (jusqu'à 5 Mo par image).</p>
                    </div>

                    <p className="font-semibold pt-2">3.5. Données de souscription au contrat de service</p>
                    <div className="bg-[#F6F6F6] border border-[#E5E5E5] rounded p-4 space-y-1">
                      <p>Type d'entité (organisation/particulier), raison sociale, SIRET, adresse de facturation et
                        d'installation, nom, prénom, fonction, mobile, email du signataire, données de signature
                        électronique transmises à Yousign (identifiants de demande, document, signataire), adresse IP
                        de signature, horodatage, contrat PDF signé.</p>
                    </div>

                    <p className="font-semibold pt-2">3.6. Données de contact (formulaire)</p>
                    <div className="bg-[#F6F6F6] border border-[#E5E5E5] rounded p-4 space-y-1">
                      <p>Nom, prénom, email, téléphone, sujet, message, date d'envoi.</p>
                    </div>

                    <p className="font-semibold pt-2">3.7. Données techniques et de connexion</p>
                    <div className="bg-[#F6F6F6] border border-[#E5E5E5] rounded p-4 space-y-1">
                      <p>Adresse IP, type et version du navigateur (User-Agent), horodatage des connexions et
                        actions, journaux d'authentification (logs de login, échecs, déconnexions), tokens de
                        rafraîchissement (hachés), codes de connexion à usage unique (2FA par email, durée 10 min),
                        tokens de réinitialisation de mot de passe (durée 1 h), tokens de vérification d'email.</p>
                    </div>

                    <p className="font-semibold pt-2">3.8. Données de consentement et de traçabilité</p>
                    <div className="bg-[#F6F6F6] border border-[#E5E5E5] rounded p-4 space-y-1">
                      <p>Email, périmètre du consentement (déclaration / contact / souscription / cookies), version du
                        texte accepté, date, adresse IP, User-Agent, statut accordé/retiré.</p>
                    </div>

                    <p className="font-semibold pt-2">3.9. Données d'audit</p>
                    <div className="bg-[#F6F6F6] border border-[#E5E5E5] rounded p-4 space-y-1">
                      <p>Journal des modifications apportées aux déclarations (action, champ modifié, ancienne valeur,
                        nouvelle valeur, identifiant administrateur, date) — utile pour la traçabilité réglementaire et
                        la sécurité.</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* 4. Origine des données */}
              <ScrollReveal>
                <div>
                  <h2 className="font-heading font-bold text-lg text-[#161616] mb-3">
                    4. Origine des données
                  </h2>
                  <div className="text-sm text-[#3A3A3A] leading-relaxed space-y-2">
                    <p>Les données traitées proviennent :</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>directement de vous (saisie via les formulaires du Site, espace personnel)&nbsp;;</li>
                      <li>de l'API publique <strong>recherche-entreprises.api.gouv.fr</strong> pour la recherche
                        d'entreprises (raison sociale, SIREN, adresse) ;</li>
                      <li>de l'API publique <strong>Base Adresse Nationale (api-adresse.data.gouv.fr)</strong> pour la
                        géolocalisation et la normalisation des adresses ;</li>
                      <li>de l'API <strong>Géo'DAE / Atlasante</strong> pour la consultation et la mise à jour des
                        fiches DAE existantes (vous concernant) ;</li>
                      <li>de votre navigateur (adresse IP, User-Agent, données techniques de connexion).</li>
                    </ul>
                  </div>
                </div>
              </ScrollReveal>

              {/* 5. Finalités */}
              <ScrollReveal>
                <div>
                  <h2 className="font-heading font-bold text-lg text-[#161616] mb-3">
                    5. Finalités et bases légales du traitement
                  </h2>
                  <div className="text-sm text-[#3A3A3A] leading-relaxed space-y-3">
                    <p>
                      Conformément à l'article 6 du RGPD, chaque traitement repose sur une base légale précise :
                    </p>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs sm:text-sm border-collapse border border-[#E5E5E5]">
                        <thead className="bg-[#F6F6F6]">
                          <tr>
                            <th className="border border-[#E5E5E5] p-2 text-left font-semibold">Finalité</th>
                            <th className="border border-[#E5E5E5] p-2 text-left font-semibold">Base légale</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-[#E5E5E5] p-2">
                              Traitement de la déclaration DAE et transmission à la base nationale Géo'DAE
                            </td>
                            <td className="border border-[#E5E5E5] p-2">
                              Obligation légale (art. 6.1.c RGPD — décret n° 2018-1259, arrêté 29/10/2019)
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-[#E5E5E5] p-2">Création et gestion du compte utilisateur</td>
                            <td className="border border-[#E5E5E5] p-2">Exécution du contrat (art. 6.1.b)</td>
                          </tr>
                          <tr>
                            <td className="border border-[#E5E5E5] p-2">
                              Souscription, signature électronique et facturation
                            </td>
                            <td className="border border-[#E5E5E5] p-2">
                              Exécution du contrat (art. 6.1.b) et obligation légale comptable (art. 6.1.c)
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-[#E5E5E5] p-2">
                              Maintenance, suivi réglementaire et alertes sur l'état des DAE
                            </td>
                            <td className="border border-[#E5E5E5] p-2">Exécution du contrat (art. 6.1.b)</td>
                          </tr>
                          <tr>
                            <td className="border border-[#E5E5E5] p-2">
                              Authentification, sécurité, prévention de la fraude (logs, 2FA, tokens)
                            </td>
                            <td className="border border-[#E5E5E5] p-2">Intérêt légitime (art. 6.1.f)</td>
                          </tr>
                          <tr>
                            <td className="border border-[#E5E5E5] p-2">
                              Réponse aux demandes via le formulaire de contact
                            </td>
                            <td className="border border-[#E5E5E5] p-2">
                              Intérêt légitime (art. 6.1.f) ou mesures précontractuelles (art. 6.1.b)
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-[#E5E5E5] p-2">
                              Affichage de cartes (Mapbox, CartoDB) et géolocalisation
                            </td>
                            <td className="border border-[#E5E5E5] p-2">Consentement (art. 6.1.a)</td>
                          </tr>
                          <tr>
                            <td className="border border-[#E5E5E5] p-2">Gestion des consentements RGPD</td>
                            <td className="border border-[#E5E5E5] p-2">
                              Obligation légale (art. 7 RGPD — preuve du consentement)
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-[#E5E5E5] p-2">
                              Audit / journalisation des modifications de déclarations
                            </td>
                            <td className="border border-[#E5E5E5] p-2">
                              Intérêt légitime (art. 6.1.f) et obligation de traçabilité réglementaire
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <p className="pt-2">
                      <strong>Pas de profilage ni de décision automatisée</strong> au sens de l'article 22 du RGPD.
                      Aucune donnée n'est utilisée à des fins publicitaires ou de prospection commerciale non sollicitée.
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              {/* 6. Destinataires */}
              <ScrollReveal>
                <div>
                  <h2 className="font-heading font-bold text-lg text-[#161616] mb-3">
                    6. Destinataires des données
                  </h2>
                  <div className="text-sm text-[#3A3A3A] leading-relaxed space-y-3">
                    <p>Vos données peuvent être communiquées, dans la stricte mesure du nécessaire, à :</p>

                    <p className="font-semibold pt-2">6.1. Personnel interne habilité</p>
                    <p>
                      Administrateurs et personnel de STAR GROUP en charge du traitement des déclarations, du support
                      utilisateur, de la facturation et de la maintenance technique du Site, soumis à une obligation
                      contractuelle de confidentialité.
                    </p>

                    <p className="font-semibold pt-2">6.2. Autorités publiques</p>
                    <p>
                      Ministère de la Santé et de la Prévention via la base nationale <strong>Géo'DAE</strong>, gérée
                      par le service public Atlasante, conformément à l'obligation réglementaire de déclaration des
                      DAE.
                    </p>

                    <p className="font-semibold pt-2">6.3. Sous-traitants</p>
                    <p>
                      Conformément à l'article 28 du RGPD, nos sous-traitants sont liés contractuellement et présentent
                      des garanties suffisantes en matière de protection des données :
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs sm:text-sm border-collapse border border-[#E5E5E5]">
                        <thead className="bg-[#F6F6F6]">
                          <tr>
                            <th className="border border-[#E5E5E5] p-2 text-left font-semibold">Sous-traitant</th>
                            <th className="border border-[#E5E5E5] p-2 text-left font-semibold">Finalité</th>
                            <th className="border border-[#E5E5E5] p-2 text-left font-semibold">Localisation</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-[#E5E5E5] p-2">Hostinger operations, UAB</td>
                            <td className="border border-[#E5E5E5] p-2">Hébergement du Site et des données</td>
                            <td className="border border-[#E5E5E5] p-2">Lituanie (UE)</td>
                          </tr>
                          <tr>
                            <td className="border border-[#E5E5E5] p-2">Atlasante / Géo'DAE</td>
                            <td className="border border-[#E5E5E5] p-2">
                              Base nationale officielle des DAE (transmission obligatoire)
                            </td>
                            <td className="border border-[#E5E5E5] p-2">France</td>
                          </tr>
                          <tr>
                            <td className="border border-[#E5E5E5] p-2">Yousign SAS</td>
                            <td className="border border-[#E5E5E5] p-2">Signature électronique des contrats</td>
                            <td className="border border-[#E5E5E5] p-2">France (UE)</td>
                          </tr>
                          <tr>
                            <td className="border border-[#E5E5E5] p-2">OVH SAS</td>
                            <td className="border border-[#E5E5E5] p-2">
                              Service SMTP d'envoi des emails transactionnels
                            </td>
                            <td className="border border-[#E5E5E5] p-2">France (UE)</td>
                          </tr>
                          <tr>
                            <td className="border border-[#E5E5E5] p-2">Mapbox Inc.</td>
                            <td className="border border-[#E5E5E5] p-2">
                              Affichage des cartes satellite (soumis au consentement)
                            </td>
                            <td className="border border-[#E5E5E5] p-2">États-Unis</td>
                          </tr>
                          <tr>
                            <td className="border border-[#E5E5E5] p-2">CARTO / CartoDB Inc.</td>
                            <td className="border border-[#E5E5E5] p-2">
                              Tuiles cartographiques (soumis au consentement)
                            </td>
                            <td className="border border-[#E5E5E5] p-2">États-Unis</td>
                          </tr>
                          <tr>
                            <td className="border border-[#E5E5E5] p-2">DINUM / data.gouv.fr</td>
                            <td className="border border-[#E5E5E5] p-2">
                              Recherche d'entreprises et géocodage (services publics)
                            </td>
                            <td className="border border-[#E5E5E5] p-2">France</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <p className="pt-3">
                      <strong>Aucune donnée n'est vendue, louée ou cédée à des tiers à des fins commerciales.</strong>
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              {/* 7. Transferts hors UE */}
              <ScrollReveal>
                <div>
                  <h2 className="font-heading font-bold text-lg text-[#161616] mb-3">
                    7. Transferts hors Union européenne
                  </h2>
                  <div className="text-sm text-[#3A3A3A] leading-relaxed space-y-3">
                    <p>
                      Le stockage principal de vos données est réalisé au sein de l'Union européenne (Lituanie). Des
                      transferts ponctuels vers les <strong>États-Unis</strong> peuvent intervenir lorsque vous
                      consentez à l'utilisation des cartes (Mapbox, CARTO).
                    </p>
                    <p>
                      Ces transferts sont encadrés par les garanties prévues au chapitre V du RGPD&nbsp;:
                      <strong> Clauses Contractuelles Types</strong> de la Commission européenne (décision 2021/914) et,
                      lorsque les sous-traitants y adhèrent, le <strong>Data Privacy Framework UE-US</strong> (décision
                      d'adéquation du 10 juillet 2023).
                    </p>
                    <p>
                      Vous pouvez à tout moment refuser ces transferts en n'activant pas les cookies de cartographie ;
                      les fonctionnalités cartographiques seront alors désactivées sans incidence sur les autres
                      services.
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              {/* 8. Durées */}
              <ScrollReveal>
                <div>
                  <h2 className="font-heading font-bold text-lg text-[#161616] mb-3">
                    8. Durée de conservation
                  </h2>
                  <div className="text-sm text-[#3A3A3A] leading-relaxed space-y-3">
                    <p>
                      Conformément à l'article 5.1.e du RGPD, vos données ne sont conservées que pour la durée
                      strictement nécessaire aux finalités poursuivies, puis supprimées ou archivées :
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs sm:text-sm border-collapse border border-[#E5E5E5]">
                        <thead className="bg-[#F6F6F6]">
                          <tr>
                            <th className="border border-[#E5E5E5] p-2 text-left font-semibold">Catégorie</th>
                            <th className="border border-[#E5E5E5] p-2 text-left font-semibold">Durée active</th>
                            <th className="border border-[#E5E5E5] p-2 text-left font-semibold">Archivage légal</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-[#E5E5E5] p-2">Compte utilisateur</td>
                            <td className="border border-[#E5E5E5] p-2">Durée du compte</td>
                            <td className="border border-[#E5E5E5] p-2">3 ans après suppression</td>
                          </tr>
                          <tr>
                            <td className="border border-[#E5E5E5] p-2">Déclarations DAE actives</td>
                            <td className="border border-[#E5E5E5] p-2">Durée de validité de la déclaration</td>
                            <td className="border border-[#E5E5E5] p-2">3 ans après dernière interaction</td>
                          </tr>
                          <tr>
                            <td className="border border-[#E5E5E5] p-2">Brouillons non soumis</td>
                            <td className="border border-[#E5E5E5] p-2">6 mois sans activité</td>
                            <td className="border border-[#E5E5E5] p-2">Suppression automatique</td>
                          </tr>
                          <tr>
                            <td className="border border-[#E5E5E5] p-2">Souscriptions / contrats</td>
                            <td className="border border-[#E5E5E5] p-2">Durée du contrat</td>
                            <td className="border border-[#E5E5E5] p-2">5 ans (prescription civile)</td>
                          </tr>
                          <tr>
                            <td className="border border-[#E5E5E5] p-2">Documents comptables et factures</td>
                            <td className="border border-[#E5E5E5] p-2">—</td>
                            <td className="border border-[#E5E5E5] p-2">10 ans (art. L.123-22 Code de commerce)</td>
                          </tr>
                          <tr>
                            <td className="border border-[#E5E5E5] p-2">Demandes via formulaire de contact</td>
                            <td className="border border-[#E5E5E5] p-2">Le temps du traitement</td>
                            <td className="border border-[#E5E5E5] p-2">13 mois</td>
                          </tr>
                          <tr>
                            <td className="border border-[#E5E5E5] p-2">Logs d'authentification et de sécurité</td>
                            <td className="border border-[#E5E5E5] p-2">—</td>
                            <td className="border border-[#E5E5E5] p-2">12 mois (recommandation CNIL)</td>
                          </tr>
                          <tr>
                            <td className="border border-[#E5E5E5] p-2">Tokens (refresh, vérif. email, reset mdp)</td>
                            <td className="border border-[#E5E5E5] p-2">Durée d'expiration</td>
                            <td className="border border-[#E5E5E5] p-2">Suppression / révocation immédiate</td>
                          </tr>
                          <tr>
                            <td className="border border-[#E5E5E5] p-2">Codes 2FA par email</td>
                            <td className="border border-[#E5E5E5] p-2">10 minutes</td>
                            <td className="border border-[#E5E5E5] p-2">Suppression immédiate après usage</td>
                          </tr>
                          <tr>
                            <td className="border border-[#E5E5E5] p-2">Preuves de consentement RGPD</td>
                            <td className="border border-[#E5E5E5] p-2">—</td>
                            <td className="border border-[#E5E5E5] p-2">5 ans après retrait/expiration</td>
                          </tr>
                          <tr>
                            <td className="border border-[#E5E5E5] p-2">Audit log des déclarations</td>
                            <td className="border border-[#E5E5E5] p-2">—</td>
                            <td className="border border-[#E5E5E5] p-2">3 ans après l'événement</td>
                          </tr>
                          <tr>
                            <td className="border border-[#E5E5E5] p-2">Cookies (déposés)</td>
                            <td className="border border-[#E5E5E5] p-2">—</td>
                            <td className="border border-[#E5E5E5] p-2">13 mois maximum (recommandation CNIL)</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="pt-2">
                      Au-delà des durées d'archivage indiquées, les données sont définitivement supprimées ou
                      anonymisées de manière irréversible.
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              {/* 9. Droits */}
              <ScrollReveal>
                <div>
                  <h2 className="font-heading font-bold text-lg text-[#161616] mb-3">
                    9. Vos droits sur vos données
                  </h2>
                  <div className="text-sm text-[#3A3A3A] leading-relaxed space-y-3">
                    <p>
                      Conformément aux articles 15 à 22 du RGPD, vous disposez à tout moment des droits suivants sur
                      les données vous concernant :
                    </p>
                    <div className="bg-[#F6F6F6] border border-[#E5E5E5] rounded p-4 space-y-2">
                      <p><strong>Droit d'accès (art. 15)</strong> — obtenir la confirmation que vos données sont
                        traitées et en recevoir une copie.</p>
                      <p><strong>Droit de rectification (art. 16)</strong> — faire corriger des données inexactes ou
                        incomplètes.</p>
                      <p><strong>Droit à l'effacement / « droit à l'oubli » (art. 17)</strong> — demander la
                        suppression de vos données dans les conditions prévues par le RGPD (sauf obligation légale de
                        conservation).</p>
                      <p><strong>Droit à la limitation du traitement (art. 18)</strong> — geler temporairement
                        l'utilisation de vos données.</p>
                      <p><strong>Droit à la portabilité (art. 20)</strong> — recevoir vos données dans un format
                        structuré, couramment utilisé et lisible par machine, ou les transmettre à un autre
                        responsable.</p>
                      <p><strong>Droit d'opposition (art. 21)</strong> — vous opposer au traitement pour des motifs
                        tenant à votre situation particulière.</p>
                      <p><strong>Droit de retirer votre consentement (art. 7.3)</strong> — à tout moment, sans
                        affecter la licéité du traitement antérieur.</p>
                      <p><strong>Droit de définir des directives post-mortem</strong> sur le sort de vos données après
                        votre décès (art. 85 loi Informatique et Libertés).</p>
                      <p><strong>Droit de ne pas faire l'objet d'une décision automatisée (art. 22)</strong> — non
                        applicable, aucune décision automatisée n'est mise en œuvre.</p>
                    </div>

                    <p className="font-semibold pt-3">9.1. Comment exercer vos droits</p>
                    <p>
                      <strong>En libre-service :</strong> si vous disposez d'un compte, accédez à l'onglet{" "}
                      <Link
                        href="/dashboard/mes-donnees"
                        className="text-[#000091] underline hover:no-underline"
                      >
                        « Mes données »
                      </Link>{" "}
                      de votre espace personnel pour exporter vos données ou supprimer votre compte.
                    </p>
                    <p>
                      <strong>Par email :</strong>{" "}
                      <a href={`mailto:${dpoEmail}`} className="text-[#000091] underline hover:no-underline">
                        {dpoEmail}
                      </a>
                    </p>
                    <p>
                      <strong>Par courrier postal :</strong> STAR GROUP — DPO, LE MOUFIA, 4 allée des Primevères, 97490
                      Saint-Denis (La Réunion)
                    </p>
                    <p>
                      Pour des raisons de sécurité, nous pourrons être amenés à vous demander une preuve d'identité.
                      Une réponse vous sera apportée dans un <strong>délai d'un mois</strong> à compter de la
                      réception de votre demande, prolongeable de deux mois en cas de complexité (art. 12.3 RGPD).
                    </p>

                    <p className="font-semibold pt-3">9.2. Réclamation auprès de l'autorité de contrôle</p>
                    <p>
                      Si, après nous avoir contactés, vous estimez que vos droits ne sont pas respectés, vous pouvez
                      introduire une réclamation auprès de la <strong>CNIL</strong> :
                    </p>
                    <div className="bg-[#F6F6F6] border border-[#E5E5E5] rounded p-4 space-y-1">
                      <p>Commission Nationale de l'Informatique et des Libertés</p>
                      <p>3 place de Fontenoy, TSA 80715</p>
                      <p>75334 Paris Cedex 07</p>
                      <p>Téléphone : 01 53 73 22 22</p>
                      <p>
                        Site web :{" "}
                        <a
                          href="https://www.cnil.fr"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#000091] underline hover:no-underline"
                        >
                          www.cnil.fr
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* 10. Sécurité */}
              <ScrollReveal>
                <div>
                  <h2 className="font-heading font-bold text-lg text-[#161616] mb-3">
                    10. Mesures de sécurité
                  </h2>
                  <div className="text-sm text-[#3A3A3A] leading-relaxed space-y-3">
                    <p>
                      Conformément à l'article 32 du RGPD, nous mettons en œuvre des mesures techniques et
                      organisationnelles appropriées pour garantir un niveau de sécurité adapté au risque :
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>chiffrement des échanges <strong>HTTPS / TLS</strong> ;</li>
                      <li>hachage des mots de passe avec l'algorithme <strong>argon2id</strong> (lauréat PHC) ;</li>
                      <li>authentification à deux facteurs (2FA) par email à code unique configurable ;</li>
                      <li>tokens JWT à courte durée de vie + refresh tokens hachés en base ;</li>
                      <li>limitation du nombre de requêtes par IP (rate-limiting / throttling) ;</li>
                      <li>contrôle d'accès strict par rôles (utilisateur / administrateur) ;</li>
                      <li>journalisation des actions sensibles et audit log immutable ;</li>
                      <li>validation et assainissement systématiques des données entrantes ;</li>
                      <li>sauvegardes chiffrées régulières et plan de reprise d'activité ;</li>
                      <li>séparation environnements de développement / production ;</li>
                      <li>mise à jour régulière des dépendances et veille sécurité.</li>
                    </ul>
                    <p>
                      En cas de violation de données susceptible d'engendrer un risque pour vos droits et libertés,
                      nous nous engageons à notifier la CNIL dans les <strong>72 heures</strong> et à vous en informer
                      dans les meilleurs délais conformément aux articles 33 et 34 du RGPD.
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              {/* 11. Cookies */}
              <ScrollReveal>
                <div>
                  <h2 className="font-heading font-bold text-lg text-[#161616] mb-3">
                    11. Cookies et traceurs
                  </h2>
                  <div className="text-sm text-[#3A3A3A] leading-relaxed space-y-3">
                    <p>
                      Le Site utilise des cookies et technologies similaires (localStorage, sessionStorage). Ils sont
                      regroupés en deux catégories :
                    </p>
                    <div className="bg-[#F6F6F6] border border-[#E5E5E5] rounded p-4 space-y-3">
                      <div>
                        <p className="font-semibold">Cookies strictement nécessaires (toujours actifs)</p>
                        <p>
                          Authentification (cookie HTTP-only contenant le refresh token), session utilisateur,
                          sauvegarde locale du formulaire de déclaration en cours, mémorisation des préférences
                          d'affichage. Exemptés de consentement (art. 82 loi Informatique et Libertés).
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold">Cookies de cartographie (soumis à consentement)</p>
                        <p>
                          Affichage des fonds de carte Mapbox et CARTO. Ces services tiers (États-Unis) reçoivent les
                          coordonnées de la zone affichée et votre adresse IP. Vous pouvez les accepter ou les refuser
                          via le bandeau cookies, et modifier votre choix à tout moment.
                        </p>
                      </div>
                    </div>
                    <p>
                      Aucun cookie de mesure d'audience, publicitaire ou de réseaux sociaux n'est déposé. Les cookies
                      ont une durée de vie maximale de 13 mois conformément aux recommandations de la CNIL.
                    </p>
                    <p>
                      Vous pouvez à tout moment paramétrer vos préférences :{" "}
                      <CookieSettingsButton />
                    </p>
                    <p>
                      Vous pouvez également configurer votre navigateur pour bloquer ou être averti du dépôt de
                      cookies. Le refus des cookies essentiels peut empêcher le bon fonctionnement de certaines
                      fonctionnalités.
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              {/* 12. Mineurs */}
              <ScrollReveal>
                <div>
                  <h2 className="font-heading font-bold text-lg text-[#161616] mb-3">
                    12. Protection des mineurs
                  </h2>
                  <p className="text-sm text-[#3A3A3A] leading-relaxed">
                    Le Site n'est pas destiné aux mineurs de moins de 15 ans (art. 8 RGPD et 7-1 loi Informatique et
                    Libertés). Aucune donnée personnelle n'est collectée sciemment auprès de mineurs. Si vous estimez
                    qu'un mineur nous a transmis ses données sans le consentement parental, contactez-nous afin que
                    nous procédions à leur suppression.
                  </p>
                </div>
              </ScrollReveal>

              {/* 13. Liens externes */}
              <ScrollReveal>
                <div>
                  <h2 className="font-heading font-bold text-lg text-[#161616] mb-3">
                    13. Sites tiers
                  </h2>
                  <p className="text-sm text-[#3A3A3A] leading-relaxed">
                    Le Site peut contenir des liens vers des sites tiers (data.gouv.fr, Légifrance, Géo'DAE,
                    service-public.fr, etc.). STAR GROUP n'est pas responsable des pratiques de confidentialité de ces
                    sites. Nous vous recommandons de consulter leurs propres politiques de confidentialité avant de
                    leur transmettre des données personnelles.
                  </p>
                </div>
              </ScrollReveal>

              {/* 14. Modifications */}
              <ScrollReveal>
                <div>
                  <h2 className="font-heading font-bold text-lg text-[#161616] mb-3">
                    14. Modifications de la politique
                  </h2>
                  <p className="text-sm text-[#3A3A3A] leading-relaxed">
                    La présente politique peut être amenée à évoluer afin de tenir compte des évolutions légales,
                    réglementaires, jurisprudentielles ou techniques. Toute modification sera publiée sur cette page,
                    avec mention de la date de mise à jour. En cas de modification substantielle, vous serez informé
                    par email ou par un avis sur le Site, et un nouveau consentement pourra vous être demandé lorsque
                    cela est requis.
                  </p>
                </div>
              </ScrollReveal>

              {/* 15. Contact */}
              <ScrollReveal>
                <div>
                  <h2 className="font-heading font-bold text-lg text-[#161616] mb-3">
                    15. Contact
                  </h2>
                  <div className="text-sm text-[#3A3A3A] leading-relaxed space-y-1">
                    <p>Pour toute question relative à la présente politique :</p>
                    <p className="pt-2"><strong>STAR GROUP — Délégué à la protection des données</strong></p>
                    <p>LE MOUFIA, 4 allée des Primevères, 97490 Saint-Denis (La Réunion)</p>
                    <p>
                      Email :{" "}
                      <a href={`mailto:${dpoEmail}`} className="text-[#000091] underline hover:no-underline">
                        {dpoEmail}
                      </a>
                    </p>
                    <p>Téléphone : +262 262 150 950</p>
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
