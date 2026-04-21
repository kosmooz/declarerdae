"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  AlertTriangle,
  RotateCw,
  Trash2,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import type { GeodaeDaeDevice, GeodaeDeclaration } from "./types";
import { GEODAE_FIELDS, formatGeodaeValue } from "./geodae-fields";

interface GeodaeDetailContentProps {
  geodaeData: Record<string, any>;
  device: GeodaeDaeDevice;
  decl: GeodaeDeclaration;
  onResync: () => void;
  onDelete: () => void;
  deleting: boolean;
}

export default function GeodaeDetailContent({
  geodaeData,
  device,
  decl,
  onResync,
  onDelete,
  deleting,
}: GeodaeDetailContentProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  let diffCount = 0;

  const rows = GEODAE_FIELDS.map((field) => {
    const remoteRaw = geodaeData[field.key];
    const remote = formatGeodaeValue(remoteRaw);
    const localRaw = field.localValue ? field.localValue(device, decl) : undefined;
    const local = localRaw !== undefined ? formatGeodaeValue(localRaw) : null;

    let isDiff = false;
    if (!field.noDiff && local !== null) {
      if (field.compare) {
        isDiff = !field.compare(remoteRaw, localRaw ?? null);
      } else {
        const normRemote = remote.toLowerCase().trim();
        const normLocal = local.toLowerCase().trim();
        if (normRemote !== normLocal && !(normRemote === "\u2014" && normLocal === "\u2014")) {
          isDiff = true;
        }
      }
      if (isDiff) diffCount++;
    }

    return { ...field, remote, local, isDiff };
  });

  return (
    <div className="space-y-4">
      {diffCount > 0 && (
        <div className="alert-warning rounded text-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#92400E] shrink-0" />
              <span className="text-[#92400E]">
                <strong>{diffCount}</strong> différence{diffCount > 1 ? "s" : ""} détectée{diffCount > 1 ? "s" : ""} entre vos données et GéoDAE
              </span>
            </div>
            <Button
              size="sm"
              onClick={onResync}
              className="bg-[#000091] hover:bg-[#000091]/90 text-white shrink-0"
            >
              <RotateCw className="h-3.5 w-3.5 mr-1.5" />
              Mettre à jour
            </Button>
          </div>
        </div>
      )}

      {diffCount === 0 && (
        <div className="alert-success rounded text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#18753C] shrink-0" />
            <span className="text-[#166534]">
              Les données GéoDAE sont à jour avec votre déclaration.
            </span>
          </div>
        </div>
      )}

      <div className="border border-[#E5E5E5] rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F6F6F6] border-b border-[#E5E5E5]">
              <th className="text-left px-3 py-2 text-[10px] font-semibold text-[#929292] uppercase tracking-wide w-[30%]">
                Champ
              </th>
              <th className="text-left px-3 py-2 text-[10px] font-semibold text-[#929292] uppercase tracking-wide">
                GéoDAE
              </th>
              {rows.some((r) => r.local !== null) && (
                <th className="text-left px-3 py-2 text-[10px] font-semibold text-[#929292] uppercase tracking-wide">
                  Local
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.key}
                className={`border-b border-[#F6F6F6] last:border-0 ${
                  row.isDiff ? "bg-amber-50" : ""
                }`}
              >
                <td className="px-3 py-1.5 text-xs text-[#929292]">
                  {row.label}
                </td>
                <td className="px-3 py-1.5 text-xs text-[#161616] break-words max-w-[200px]">
                  {row.remote}
                </td>
                {rows.some((r) => r.local !== null) && (
                  <td className={`px-3 py-1.5 text-xs break-words max-w-[200px] ${
                    row.isDiff ? "text-[#92400E] font-medium" : "text-[#161616]"
                  }`}>
                    {row.local !== null ? row.local : "\u2014"}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mainteneur card */}
      <div className="rounded-sm border border-[#E5E5E5] bg-[#F6F6F6] p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="w-4 h-4 text-[#000091]" />
              <h4 className="text-sm font-semibold text-[#3A3A3A]">
                Mainteneur GéoDAE
              </h4>
            </div>
            <p className="text-sm text-[#161616]">
              Ce DAE est actuellement maintenu par <strong>declarerdefibrillateur.re</strong> dans la base nationale GéoDAE.
            </p>
            <p className="text-xs text-[#929292] mt-1.5">
              Si vous souhaitez changer de mainteneur, vous devez d'abord supprimer cette fiche. Le nouveau mainteneur devra ensuite redéclarer le DAE depuis sa propre interface GéoDAE.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={deleting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-red-200 bg-white text-red-600 text-xs font-medium hover:bg-red-50 transition-colors shrink-0 disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Changer de mainteneur
          </button>
        </div>
      </div>

      {/* Delete maintainer confirmation dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#E1000F]">
              <ShieldAlert className="h-5 w-5" />
              Supprimer le mainteneur
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 my-2">
            <div className="alert-danger rounded text-sm">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-[#E1000F] mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-[#E1000F]">Action irréversible</p>
                  <p className="text-[#E1000F]/80 mt-1">
                    Cette action va définitivement supprimer la fiche de ce DAE dans la base nationale GéoDAE. Vous ne pourrez pas annuler cette opération.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-2 text-sm text-[#3A3A3A]">
              <p>
                Le DAE <strong>{device.nom || "sans nom"}</strong> (GéoDAE #{device.geodaeGid}) sera marqué comme <strong>« Supprimé définitivement »</strong> dans la base nationale.
              </p>
              <p>
                Il ne sera plus visible sur la carte nationale des défibrillateurs et ne pourra pas être restauré depuis votre compte.
              </p>
              <p className="text-[#000091] font-medium">
                Si vous changez de mainteneur, celui-ci devra redéclarer le DAE depuis sa propre interface GéoDAE.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>
              Annuler
            </Button>
            <Button
              onClick={() => { setShowDeleteConfirm(false); onDelete(); }}
              disabled={deleting}
              className="bg-[#E1000F] hover:bg-[#E1000F]/90 text-white"
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-1.5" />
              )}
              Supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
