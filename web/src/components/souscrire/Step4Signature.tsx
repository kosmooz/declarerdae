"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle, Loader2, ExternalLink, FileSignature, Phone, Mail, Download, RotateCcw } from "lucide-react";

interface Step4Props {
  signatureRequestId: string;
  signerId: string;
  signatureLink: string;
  onBack: () => void;
  onReset: () => void;
}

export default function Step4Signature({
  signatureRequestId,
  signatureLink,
  onBack,
  onReset,
}: Step4Props) {
  const [signed, setSigned] = useState(false);
  const [checking, setChecking] = useState(true);
  const [opened, setOpened] = useState(false);

  // Check signature status on mount (handles page reload after signing)
  useEffect(() => {
    let cancelled = false;
    const checkOnce = async () => {
      try {
        const res = await fetch(`/api/yousign/status/${signatureRequestId}`);
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && data.status === "done") {
            setSigned(true);
          }
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setChecking(false);
      }
    };
    checkOnce();
    return () => { cancelled = true; };
  }, [signatureRequestId]);

  // Poll for signature status every 5s once link has been opened
  useEffect(() => {
    if (signed || !opened) return;

    const check = async () => {
      try {
        const res = await fetch(`/api/yousign/status/${signatureRequestId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === "done") {
            setSigned(true);
          }
        }
      } catch {
        // ignore
      }
    };

    const interval = setInterval(check, 5000);
    return () => clearInterval(interval);
  }, [signatureRequestId, signed, opened]);

  function handleOpenYousign() {
    setOpened(true);
    window.open(signatureLink, "_blank", "noopener,noreferrer");
  }

  if (signed) {
    return (
      <div className="py-12 space-y-8">
        {/* Success header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Contrat signé avec succès !</h2>
            <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
              Merci pour votre confiance. Un email récapitulatif contenant votre
              contrat signé vous a été envoyé.
            </p>
          </div>
        </div>

        {/* Next steps */}
        <div className="rounded-xl border bg-muted/30 p-6 space-y-4 max-w-lg mx-auto">
          <h3 className="font-semibold text-lg">Et maintenant ?</h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold shrink-0 mt-0.5">1</span>
              <span>
                <strong className="text-foreground">Prise en charge immédiate</strong> — Votre
                demande est en cours de traitement. Notre équipe s&apos;en occupe dans les
                plus brefs délais.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold shrink-0 mt-0.5">2</span>
              <span>
                <strong className="text-foreground">Un professionnel vous rappelle</strong> — Vous
                serez contacté(e) par un de nos spécialistes pour organiser la livraison
                et l&apos;installation de votre défibrillateur.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold shrink-0 mt-0.5">3</span>
              <span>
                <strong className="text-foreground">Formation incluse</strong> — Une formation
                à l&apos;utilisation du défibrillateur et aux gestes de premiers secours
                sera programmée.
              </span>
            </li>
          </ul>
        </div>

        {/* Contact info */}
        <div className="rounded-xl border p-6 space-y-3 max-w-lg mx-auto">
          <h3 className="font-semibold">Une question ? Contactez-nous</h3>
          <div className="flex flex-col gap-2 text-sm">
            <a href="tel:0262123456" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <Phone className="w-4 h-4" />
              02 62 12 34 56
            </a>
            <a href="mailto:contact@star-aid.fr" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <Mail className="w-4 h-4" />
              contact@star-aid.fr
            </a>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center gap-3">
          <a
            href={`/api/yousign/download/${signatureRequestId}`}
            className="inline-flex items-center gap-2 h-12 px-6 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
          >
            <Download className="w-4 h-4" />
            Télécharger le contrat signé
          </a>
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Faire une nouvelle demande
          </button>
        </div>
      </div>
    );
  }

  if (checking) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">Vérification du statut de la signature...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Signature électronique
        </h1>
        <p className="text-muted-foreground mt-1">
          Signez votre contrat via la plateforme sécurisée Yousign
        </p>
      </div>

      {/* Signing CTA */}
      <div className="rounded-xl border bg-muted/30 p-8 flex flex-col items-center gap-6 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <FileSignature className="w-8 h-8 text-primary" />
        </div>

        {!opened ? (
          <>
            <div>
              <h2 className="text-lg font-semibold">
                Votre contrat est prêt à être signé
              </h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-md">
                Cliquez sur le bouton ci-dessous pour ouvrir l&apos;interface de
                signature Yousign. Vous pourrez y relire le contrat et le signer
                électroniquement.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenYousign}
              className="h-12 px-8 bg-primary text-white rounded-xl font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Signer le contrat sur Yousign
            </button>
          </>
        ) : (
          <>
            <div>
              <h2 className="text-lg font-semibold">
                Signature en cours...
              </h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-md">
                Complétez la signature dans l&apos;onglet Yousign.
                Cette page se mettra à jour automatiquement une fois
                la signature terminée.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              En attente de votre signature...
            </div>
            <button
              type="button"
              onClick={handleOpenYousign}
              className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Rouvrir l&apos;onglet Yousign
            </button>
          </>
        )}
      </div>

      {/* Back button */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="h-12 px-6 rounded-xl border font-medium flex items-center gap-2 hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>
      </div>
    </div>
  );
}
