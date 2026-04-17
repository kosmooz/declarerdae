"use client";

import { useState, useEffect, useCallback } from "react";
import { Step2Data, calculatePricing } from "@/lib/schemas/subscribe";
import { ArrowLeft, FileText, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Contenu des conditions                                            */
/* ------------------------------------------------------------------ */

const CONDITIONS_CONTENT: Record<string, { title: string; body: string }> = {
  acceptTerms: {
    title: "Conditions générales d'abonnement",
    body: `Article 1 — Objet
Le présent contrat a pour objet la mise à disposition d'un ou plusieurs défibrillateurs automatisés externes (DAE) de marque ZOLL AED 3, incluant la maintenance, le remplacement des consommables et la formation initiale des utilisateurs.

Article 2 — Durée de l'abonnement
L'abonnement est conclu pour une durée de 48 mois à compter de la date d'installation du matériel. À l'issue de cette période, le contrat est renouvelé tacitement par périodes successives de 12 mois, sauf résiliation notifiée par lettre recommandée avec accusé de réception au moins 3 mois avant l'échéance.

Article 3 — Tarification
Le prix de l'abonnement mensuel est celui indiqué sur le bon de commande. Les prix sont exprimés en euros TTC (TVA applicable : 8,5 % — La Réunion). STAR aid se réserve le droit de réviser ses tarifs annuellement, dans la limite de l'indice des prix à la consommation.

Article 4 — Obligations de STAR aid
STAR aid s'engage à :
• Livrer et installer le(s) DAE dans un délai de 15 jours ouvrés après signature ;
• Assurer la maintenance préventive et corrective du matériel ;
• Remplacer les électrodes et batteries selon les préconisations du fabricant ;
• Former un référent sur site à l'utilisation du DAE.

Article 5 — Obligations du souscripteur
Le souscripteur s'engage à :
• Veiller à l'accessibilité permanente du DAE ;
• Signaler tout dysfonctionnement dans les 48 heures ;
• Ne pas déplacer le matériel sans accord préalable de STAR aid ;
• Régler les échéances mensuelles à bonne date.

Article 6 — Résiliation anticipée
En cas de résiliation anticipée par le souscripteur, les mensualités restant dues jusqu'au terme de la période d'engagement seront facturées à titre d'indemnité forfaitaire.

Article 7 — Responsabilité
STAR aid ne saurait être tenue responsable en cas de non-utilisation ou de mauvaise utilisation du DAE par le souscripteur ou un tiers. Le matériel reste la propriété de STAR aid pendant toute la durée du contrat.

Article 8 — Juridiction
Tout litige relatif au présent contrat sera soumis aux tribunaux compétents de Saint-Denis de La Réunion.`,
  },
  acceptContract: {
    title: "Termes du contrat",
    body: `CONTRAT DE LOCATION ET MAINTENANCE DE DÉFIBRILLATEUR

Entre les soussignés :
STAR aid, SAS au capital de 10 000 €, immatriculée au RCS de Saint-Denis sous le numéro XXX XXX XXX, dont le siège social est situé à Saint-Denis (974), ci-après dénommée « le Prestataire »,

Et le souscripteur identifié dans le bon de commande, ci-après dénommé « le Client »,

Il a été convenu ce qui suit :

1. OBJET DU CONTRAT
Le Prestataire met à la disposition du Client un ou plusieurs défibrillateurs automatisés externes (DAE) ZOLL AED 3, dans le cadre d'un abonnement mensuel incluant :
— La fourniture et l'installation du matériel ;
— La maintenance préventive et curative ;
— Le remplacement des consommables (électrodes, batteries) ;
— Une session de formation initiale ;
— Un support technique disponible 7j/7.

2. PRIX ET MODALITÉS DE PAIEMENT
Le montant de l'abonnement mensuel est celui figurant sur le récapitulatif de commande validé par le Client. Le paiement s'effectue par prélèvement automatique, le 5 de chaque mois. Tout retard de paiement entraînera l'application de pénalités de retard au taux légal en vigueur.

3. INSTALLATION
L'installation sera réalisée par un technicien agréé STAR aid dans un délai maximum de 15 jours ouvrés suivant la signature du contrat. Le Client devra fournir un emplacement conforme aux recommandations du fabricant (protection contre les intempéries, accessibilité, alimentation électrique si nécessaire pour le boîtier).

4. MAINTENANCE
Le Prestataire assure une maintenance préventive semestrielle incluant : vérification de l'état général du DAE, contrôle des indicateurs, remplacement préventif des consommables si nécessaire. En cas de panne, le Prestataire intervient sous 48 heures ouvrées.

5. PROPRIÉTÉ DU MATÉRIEL
Le matériel reste la propriété exclusive du Prestataire pendant toute la durée du contrat. À l'issue du contrat, le Client pourra acquérir le matériel à sa valeur résiduelle.

6. ASSURANCE
Le Prestataire assure le matériel contre le vol et la détérioration accidentelle. Le Client doit signaler tout sinistre dans les 24 heures.

7. FIN DU CONTRAT
À l'expiration ou la résiliation du contrat, le Client s'engage à restituer le matériel en bon état de fonctionnement dans un délai de 15 jours.`,
  },
  acceptDataProcessing: {
    title: "Politique de traitement des données personnelles (RGPD)",
    body: `POLITIQUE DE PROTECTION DES DONNÉES PERSONNELLES

Conformément au Règlement Général sur la Protection des Données (RGPD — Règlement UE 2016/679) et à la loi Informatique et Libertés modifiée, STAR aid vous informe de la manière dont vos données personnelles sont collectées et traitées.

1. RESPONSABLE DU TRAITEMENT
STAR aid, SAS, dont le siège est situé à Saint-Denis de La Réunion (974).
Contact DPO : dpo@star-aid.fr

2. DONNÉES COLLECTÉES
Dans le cadre de la souscription d'un abonnement, nous collectons :
— Identité : nom, prénom, fonction ;
— Coordonnées : adresse email, numéro de téléphone mobile ;
— Données professionnelles : raison sociale, numéro SIRET, adresse du siège ;
— Adresse d'installation du matériel ;
— Données de facturation et de paiement.

3. FINALITÉS DU TRAITEMENT
Vos données sont traitées pour les finalités suivantes :
— Gestion du contrat d'abonnement et de la relation client ;
— Facturation et recouvrement ;
— Installation et maintenance du matériel ;
— Communication relative aux services souscrits ;
— Respect de nos obligations légales et réglementaires.

4. BASE LÉGALE
Le traitement est fondé sur l'exécution du contrat (article 6.1.b du RGPD) et sur nos obligations légales (article 6.1.c).

5. DESTINATAIRES
Vos données peuvent être communiquées à :
— Nos sous-traitants techniques (hébergement, signature électronique) ;
— Les organismes de formation ;
— Les administrations fiscales et sociales, le cas échéant.

6. DURÉE DE CONSERVATION
Vos données sont conservées pendant la durée du contrat, puis pendant 5 ans après la fin de la relation contractuelle pour les besoins de la prescription légale.

7. VOS DROITS
Conformément au RGPD, vous disposez des droits suivants :
— Droit d'accès à vos données ;
— Droit de rectification ;
— Droit à l'effacement (« droit à l'oubli ») ;
— Droit à la limitation du traitement ;
— Droit à la portabilité ;
— Droit d'opposition.

Pour exercer ces droits, contactez-nous à : dpo@star-aid.fr

8. RÉCLAMATION
Vous pouvez introduire une réclamation auprès de la CNIL (www.cnil.fr) si vous estimez que le traitement de vos données n'est pas conforme à la réglementation.`,
  },
};

/* ------------------------------------------------------------------ */
/*  Modal responsive (normal on desktop, fullscreen on mobile)        */
/* ------------------------------------------------------------------ */

function ConditionsModal({
  open,
  onClose,
  title,
  body,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  body: string;
}) {
  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [open]);

  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );
  useEffect(() => {
    if (open) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel: fullscreen on mobile, centered card on desktop */}
      <div
        className={cn(
          "relative bg-background flex flex-col z-10",
          // Mobile: fullscreen
          "w-full h-full",
          // Desktop: centered card
          "md:w-[640px] md:max-w-[90vw] md:h-auto md:max-h-[85vh] md:rounded-2xl md:shadow-2xl",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0">
          <h2 className="font-bold text-lg pr-8">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors shrink-0"
            aria-label="Fermer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="prose prose-sm max-w-none whitespace-pre-line text-sm leading-relaxed text-foreground/90">
            {body}
          </div>
        </div>

        {/* Footer close button (mobile-friendly) */}
        <div className="border-t px-5 py-4 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full h-11 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            J&apos;ai compris
          </button>
        </div>
      </div>
    </div>
  );
}

interface Step3Props {
  formData: Step2Data;
  quantity: number;
  consents: { acceptTerms: boolean; acceptContract: boolean; acceptDataProcessing: boolean };
  onConsentsChange: (consents: Step3Props["consents"]) => void;
  onNext: () => void;
  onBack: () => void;
  loading: boolean;
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right max-w-[60%]">{value}</span>
    </div>
  );
}

export default function Step3Recapitulatif({
  formData,
  quantity,
  consents,
  onConsentsChange,
  onNext,
  onBack,
  loading,
}: Step3Props) {
  const { monthlyHT, monthlyTTC } = calculatePricing(quantity);
  const allConsentsGiven =
    consents.acceptTerms && consents.acceptContract && consents.acceptDataProcessing;

  const [openModal, setOpenModal] = useState<string | null>(null);
  const currentCondition = openModal ? CONDITIONS_CONTENT[openModal] : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Récapitulatif</h1>
        <p className="text-muted-foreground mt-1">
          Vérifiez les informations avant de signer le contrat
        </p>
      </div>

      {/* Contract preview */}
      <div className="rounded-2xl border overflow-hidden">
        <div className="bg-muted/50 px-6 py-4 flex items-center gap-3 border-b">
          <FileText className="w-5 h-5 text-primary" />
          <span className="font-semibold">Aperçu du contrat</span>
        </div>
        <div className="p-6 space-y-6">
          {/* Client info */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Client
            </h4>
            {formData.entityType === "organisation" && (
              <>
                <InfoRow label="Raison sociale" value={formData.companyName} />
                <InfoRow label="SIRET" value={formData.siret} />
                <InfoRow
                  label="Siège"
                  value={
                    formData.companyAddress
                      ? `${formData.companyAddress}, ${formData.companyPostalCode} ${formData.companyCity}`
                      : undefined
                  }
                />
              </>
            )}
            <InfoRow label="Signataire" value={`${formData.firstName} ${formData.lastName}`} />
            {formData.fonction && <InfoRow label="Fonction" value={formData.fonction} />}
            <InfoRow label="Email" value={formData.email} />
            <InfoRow label="Téléphone" value={formData.mobile} />
          </div>

          {/* Installation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Lieu d&apos;installation
            </h4>
            <InfoRow
              label="Adresse"
              value={`${formData.installAddress}, ${formData.installPostalCode} ${formData.installCity}`}
            />
          </div>

          {/* Pricing */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Abonnement
            </h4>
            <InfoRow label="Quantité" value={`${quantity} défibrillateur${quantity > 1 ? "s" : ""}`} />
            <InfoRow label="Mensuel HT" value={`${monthlyHT} €`} />
            <InfoRow label="Mensuel TTC" value={`${monthlyTTC.toFixed(2)} €`} />
            <InfoRow label="Engagement" value="48 mois" />
          </div>
        </div>
      </div>

      {/* Consents */}
      <div className="space-y-3">
        {([
          {
            key: "acceptTerms" as const,
            prefix: "J'accepte les ",
            linkText: "conditions générales d'abonnement",
          },
          {
            key: "acceptContract" as const,
            prefix: "J'accepte les ",
            linkText: "termes du contrat",
            suffix: " ci-dessus",
          },
          {
            key: "acceptDataProcessing" as const,
            prefix: "J'accepte le ",
            linkText: "traitement de mes données personnelles",
            suffix: " conformément au RGPD",
          },
        ] as { key: "acceptTerms" | "acceptContract" | "acceptDataProcessing"; prefix: string; linkText: string; suffix?: string }[]).map(({ key, prefix, linkText, suffix }) => (
          <label
            key={key}
            className={cn(
              "flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all",
              consents[key]
                ? "border-primary bg-primary/5"
                : "border-muted hover:border-muted-foreground/30",
            )}
          >
            <input
              type="checkbox"
              checked={consents[key]}
              onChange={(e) =>
                onConsentsChange({ ...consents, [key]: e.target.checked })
              }
              className="mt-0.5 accent-primary"
            />
            <span className="text-sm">
              {prefix}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setOpenModal(key);
                }}
                className="text-primary underline underline-offset-2 hover:text-primary/80 font-medium"
              >
                {linkText}
              </button>
              {suffix}
            </span>
          </label>
        ))}
      </div>

      {/* Conditions modal */}
      <ConditionsModal
        open={!!openModal}
        onClose={() => setOpenModal(null)}
        title={currentCondition?.title || ""}
        body={currentCondition?.body || ""}
      />

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="h-12 px-6 rounded-xl border font-medium flex items-center gap-2 hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!allConsentsGiven || loading}
          className={cn(
            "flex-1 h-12 bg-primary text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors",
            allConsentsGiven && !loading
              ? "hover:bg-primary/90"
              : "opacity-50 cursor-not-allowed",
          )}
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Création du contrat...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Signer le contrat
            </>
          )}
        </button>
      </div>
    </div>
  );
}
