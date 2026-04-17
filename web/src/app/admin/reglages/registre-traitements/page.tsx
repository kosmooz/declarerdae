"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Shield } from "lucide-react";
import Link from "next/link";

const TRAITEMENTS = [
  {
    nom: "Declaration DAE",
    finalite: "Declaration legale des defibrillateurs automatises externes conformement au decret n\u00b02018-1259",
    baseLegale: "Obligation legale (Decret 2018-1259)",
    categories: "Nom, prenom, email, telephone, SIREN, SIRET, adresse, coordonnees GPS, informations DAE (marque, modele, n\u00b0 serie, photos)",
    personnes: "Exploitants de DAE (professionnels et particuliers)",
    destinataires: "Equipe interne, Geo'DAE / Atlasante (Ministere de la Sante)",
    duree: "Duree de validite + 3 ans apres derniere interaction",
    securite: "HTTPS/TLS, hachage mots de passe (argon2id), controle d'acces par roles, audit trail",
  },
  {
    nom: "Formulaire de contact",
    finalite: "Repondre aux demandes d'information et de support",
    baseLegale: "Interet legitime",
    categories: "Nom, prenom, email, telephone (facultatif), objet, message",
    personnes: "Visiteurs du site",
    destinataires: "Equipe interne",
    duree: "13 mois apres la demande",
    securite: "HTTPS/TLS, acces restreint equipe interne",
  },
  {
    nom: "Souscription contrat DAE",
    finalite: "Execution du contrat d'abonnement (fourniture, installation, maintenance DAE)",
    baseLegale: "Execution contractuelle",
    categories: "Nom, prenom, email, telephone, fonction, entreprise, SIRET, adresses (societe + installation), signature electronique",
    personnes: "Souscripteurs (professionnels et collectivites)",
    destinataires: "Equipe interne, Yousign (signature electronique, France)",
    duree: "Duree du contrat + 5 ans (prescription legale)",
    securite: "HTTPS/TLS, signature electronique certifiee (Yousign), acces restreint",
  },
  {
    nom: "Compte utilisateur",
    finalite: "Gestion de l'espace client, suivi des declarations, acces aux attestations",
    baseLegale: "Execution contractuelle",
    categories: "Email, nom, prenom, telephone, entreprise, SIRET",
    personnes: "Utilisateurs inscrits",
    destinataires: "Equipe interne",
    duree: "Duree du compte + 3 ans apres suppression",
    securite: "HTTPS/TLS, JWT (access 15min + refresh 30j), argon2id, double authentification possible",
  },
  {
    nom: "Authentification et securite",
    finalite: "Securite des acces, detection des tentatives frauduleuses, journalisation",
    baseLegale: "Interet legitime",
    categories: "Email, adresse IP, user-agent, horodatage, type d'action (connexion, echec, reinitialisation)",
    personnes: "Tous les utilisateurs (connectes ou tentatives)",
    destinataires: "Equipe interne (administrateurs)",
    duree: "13 mois",
    securite: "Acces restreint aux administrateurs, anonymisation apres retention",
  },
  {
    nom: "Cookies de cartographie",
    finalite: "Affichage des cartes interactives (localisation DAE, geocodage des adresses)",
    baseLegale: "Consentement (bandeau cookies)",
    categories: "Coordonnees du viewport cartographique, adresse IP (transmis a Mapbox et CartoDB)",
    personnes: "Visiteurs ayant accepte les cookies de cartographie",
    destinataires: "Mapbox (USA), CartoDB (USA)",
    duree: "Session (cookies non persistants)",
    securite: "Consentement explicite requis, possibilite de refus via bandeau cookies",
  },
  {
    nom: "Consentements RGPD",
    finalite: "Preuve du recueil du consentement conformement au RGPD",
    baseLegale: "Obligation legale (RGPD art. 7)",
    categories: "Email, scope du consentement, version, adresse IP, user-agent, date",
    personnes: "Declarants, utilisateurs du formulaire de contact",
    destinataires: "Equipe interne",
    duree: "5 ans (preuve de consentement)",
    securite: "Acces restreint, non modifiable apres enregistrement",
  },
];

export default function RegistreTraitementsPage() {
  const tableRef = useRef<HTMLDivElement>(null);

  const handleExport = () => {
    const rows = TRAITEMENTS.map((t) =>
      [t.nom, t.finalite, t.baseLegale, t.categories, t.personnes, t.destinataires, t.duree, t.securite]
        .map((v) => `"${v.replace(/"/g, '""')}"`)
        .join(","),
    );
    const csv = [
      "Traitement,Finalite,Base legale,Categories de donnees,Personnes concernees,Destinataires,Duree de conservation,Mesures de securite",
      ...rows,
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registre-traitements-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/reglages" className="text-[#929292] hover:text-[#3A3A3A]">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#3A3A3A]">Registre des traitements</h1>
            <p className="text-[#929292] text-sm mt-1">
              Registre conforme a l&apos;article 30 du RGPD
            </p>
          </div>
        </div>
        <Button onClick={handleExport} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Exporter CSV
        </Button>
      </div>

      <div className="bg-[#F5F5FE] border border-[#000091]/20 rounded p-4 mb-6 flex items-start gap-2">
        <Shield className="w-5 h-5 text-[#000091] shrink-0 mt-0.5" />
        <p className="text-sm text-[#3A3A3A]">
          Ce registre recense l&apos;ensemble des traitements de donnees personnelles operes par declarerdefibrillateur.fr. Il est tenu a jour et peut etre presente en cas de controle CNIL.
        </p>
      </div>

      <div ref={tableRef} className="space-y-4">
        {TRAITEMENTS.map((t, i) => (
          <div key={i} className="bg-white border border-[#E5E5E5] rounded overflow-hidden">
            <div className="bg-[#F6F6F6] px-4 py-2.5 border-b border-[#E5E5E5]">
              <h3 className="font-semibold text-sm text-[#161616]">
                {i + 1}. {t.nom}
              </h3>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-[#929292] text-xs font-medium uppercase tracking-wider mb-1">Finalite</p>
                <p className="text-[#3A3A3A]">{t.finalite}</p>
              </div>
              <div>
                <p className="text-[#929292] text-xs font-medium uppercase tracking-wider mb-1">Base legale</p>
                <p className="text-[#3A3A3A]">{t.baseLegale}</p>
              </div>
              <div>
                <p className="text-[#929292] text-xs font-medium uppercase tracking-wider mb-1">Categories de donnees</p>
                <p className="text-[#3A3A3A]">{t.categories}</p>
              </div>
              <div>
                <p className="text-[#929292] text-xs font-medium uppercase tracking-wider mb-1">Personnes concernees</p>
                <p className="text-[#3A3A3A]">{t.personnes}</p>
              </div>
              <div>
                <p className="text-[#929292] text-xs font-medium uppercase tracking-wider mb-1">Destinataires</p>
                <p className="text-[#3A3A3A]">{t.destinataires}</p>
              </div>
              <div>
                <p className="text-[#929292] text-xs font-medium uppercase tracking-wider mb-1">Duree de conservation</p>
                <p className="text-[#3A3A3A]">{t.duree}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-[#929292] text-xs font-medium uppercase tracking-wider mb-1">Mesures de securite</p>
                <p className="text-[#3A3A3A]">{t.securite}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
