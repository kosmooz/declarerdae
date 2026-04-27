"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const CANCEL_REASONS = [
  {
    label: "Informations incomplètes",
    reason: "Informations incomplètes ou incorrectes",
    body: (n: number, rais: string) =>
      `Bonjour,\n\nNous avons bien reçu votre demande de déclaration #${n}${rais ? ` pour ${rais}` : ""}.\n\nAprès examen de votre dossier, nous ne sommes pas en mesure de poursuivre le traitement car certaines informations obligatoires sont manquantes ou incorrectes.\n\nNous vous invitons à soumettre une nouvelle déclaration en veillant à renseigner l'ensemble des champs requis.\n\nCordialement,\nL'équipe DéclarerDéfibrillateur`,
  },
  {
    label: "Doublon de déclaration",
    reason: "Doublon de déclaration",
    body: (n: number, rais: string) =>
      `Bonjour,\n\nVotre demande de déclaration #${n}${rais ? ` pour ${rais}` : ""} a été identifiée comme un doublon d'une déclaration déjà existante dans notre système.\n\nAfin d'éviter les doublons dans la base nationale Géo'DAE, cette demande a été annulée. Si vous pensez qu'il s'agit d'une erreur, n'hésitez pas à nous contacter.\n\nCordialement,\nL'équipe DéclarerDéfibrillateur`,
  },
  {
    label: "Demande du déclarant",
    reason: "Annulation à la demande du déclarant",
    body: (n: number, rais: string) =>
      `Bonjour,\n\nConformément à votre demande, nous avons procédé à l'annulation de la déclaration #${n}${rais ? ` pour ${rais}` : ""}.\n\nSi vous souhaitez déclarer vos défibrillateurs ultérieurement, vous pouvez à tout moment soumettre une nouvelle demande sur notre plateforme.\n\nCordialement,\nL'équipe DéclarerDéfibrillateur`,
  },
  {
    label: "DAE non éligible",
    reason: "Défibrillateur non éligible à la déclaration",
    body: (n: number, rais: string) =>
      `Bonjour,\n\nAprès vérification, le(s) défibrillateur(s) déclaré(s) dans votre demande #${n}${rais ? ` pour ${rais}` : ""} ne répondent pas aux critères d'éligibilité pour l'enregistrement dans la base nationale Géo'DAE.\n\nCela peut être dû au type d'appareil, à son état ou à des informations techniques non conformes. Nous vous invitons à vérifier ces éléments et à soumettre une nouvelle déclaration si nécessaire.\n\nCordialement,\nL'équipe DéclarerDéfibrillateur`,
  },
  {
    label: "Autre raison",
    reason: "",
    body: (n: number, rais: string) =>
      `Bonjour,\n\nVotre demande de déclaration #${n}${rais ? ` pour ${rais}` : ""} a été annulée.\n\n\n\nCordialement,\nL'équipe DéclarerDéfibrillateur`,
  },
];

interface AdminCancelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  declNumber: number;
  declExptRais: string | null;
  recipientEmail: string;
  transitioning: boolean;
  onConfirm: (cancelReason: string, cancelEmailBody: string) => void;
}

export default function AdminCancelDialog({
  open,
  onOpenChange,
  declNumber,
  declExptRais,
  recipientEmail,
  transitioning,
  onConfirm,
}: AdminCancelDialogProps) {
  const [cancelReason, setCancelReason] = useState("");
  const [cancelEmailBody, setCancelEmailBody] = useState("");

  const handleOpenChange = (o: boolean) => {
    onOpenChange(o);
    if (!o) { setCancelReason(""); setCancelEmailBody(""); }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Annuler la déclaration #{declNumber}</DialogTitle>
          <DialogDescription>
            Sélectionnez un motif d'annulation. Un email sera envoyé au déclarant.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 my-2">
          <label className="text-sm font-medium text-[#3A3A3A]">Motif d'annulation</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {CANCEL_REASONS.map((r) => (
              <button
                key={r.label}
                type="button"
                onClick={() => {
                  setCancelReason(r.reason);
                  setCancelEmailBody(r.body(declNumber, declExptRais || ""));
                }}
                className={`text-left px-3 py-2 rounded-md border text-sm transition-colors ${
                  cancelReason === r.reason && r.reason
                    ? "border-[#000091] bg-[#F5F5FE] text-[#000091] font-medium"
                    : "border-[#E5E5E5] hover:border-[#000091]/40 text-[#3A3A3A]"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          {cancelReason === "" && cancelEmailBody && (
            <input
              type="text"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Saisissez le motif..."
              className="w-full mt-2 px-3 py-2 rounded-md border border-[#E5E5E5] text-sm focus:outline-none focus:border-[#000091] focus:ring-1 focus:ring-[#000091]"
            />
          )}
        </div>

        {cancelEmailBody && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-[#3A3A3A]">Email de notification</label>
              <span className="text-xs text-[#929292]">
                Destinataire : {recipientEmail || "---"}
              </span>
            </div>
            <textarea
              value={cancelEmailBody}
              onChange={(e) => setCancelEmailBody(e.target.value)}
              rows={10}
              className="w-full px-3 py-2 rounded-md border border-[#E5E5E5] text-sm resize-none focus:outline-none focus:border-[#000091] focus:ring-1 focus:ring-[#000091] font-mono leading-relaxed"
            />
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={() => handleOpenChange(false)}
            disabled={transitioning}
          >
            Retour
          </Button>
          <Button
            variant="destructive"
            onClick={() => onConfirm(cancelReason || "Annulée sans motif", cancelEmailBody)}
            disabled={transitioning || !cancelEmailBody}
          >
            {transitioning ? "Annulation..." : "Annuler et envoyer l'email"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
