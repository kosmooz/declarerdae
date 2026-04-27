"use client";

import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  XCircle,
  Globe,
  AlertTriangle,
  Upload,
  RotateCw,
  Trash2,
} from "lucide-react";
import type { DaeDevice } from "@/types/declarations";

interface AdminDeclGeodaeProps {
  devices: DaeDevice[];
  needsResync: boolean;
  onShowDetail: (device: DaeDevice) => void;
  onOpenSyncManager: () => void;
}

export default function AdminDeclGeodae({
  devices,
  needsResync,
  onShowDetail,
  onOpenSyncManager,
}: AdminDeclGeodaeProps) {
  const geodaeSent = devices.filter(d => d.geodaeStatus === "SENT" || d.geodaeStatus === "UPDATED");
  const geodaeFailed = devices.filter(d => d.geodaeStatus === "FAILED");
  const geodaeDeleted = devices.filter(d => d.geodaeStatus === "DELETED");
  const geodaeNotSent = devices.filter(d => !d.geodaeStatus || d.geodaeStatus === "NOT_SENT");
  const geodaeAllSynced = geodaeSent.length === devices.length && devices.length > 0;
  const geodaeNoneSynced = geodaeSent.length === 0 && geodaeFailed.length === 0 && geodaeDeleted.length === 0;
  const geodaeIsUpdate = geodaeSent.length > 0;
  const geodaeLastSync = geodaeSent.reduce((latest: string | null, d) => {
    if (!d.geodaeLastSync) return latest;
    return !latest || new Date(d.geodaeLastSync) > new Date(latest) ? d.geodaeLastSync : latest;
  }, null);

  return (
    <div className={`rounded-lg border mb-6 overflow-hidden ${
      needsResync
        ? "border-amber-300 ring-2 ring-amber-200"
        : geodaeAllSynced
          ? "border-green-200"
          : geodaeFailed.length > 0
            ? "border-red-200"
            : geodaeNoneSynced
              ? "border-amber-200"
              : "border-[#000091]/20"
    }`}>
      <div className={`h-1 ${
        needsResync ? "bg-amber-500"
          : geodaeAllSynced ? "bg-[#18753C]"
          : geodaeFailed.length > 0 ? "bg-red-500"
          : geodaeNoneSynced ? "bg-amber-400"
          : "bg-[#000091]"
      }`} />

      <div className="bg-white p-5">
        {needsResync && (
          <div className="alert-warning rounded text-sm mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#92400E] shrink-0" />
              <span className="text-[#92400E]">
                Les informations ont été modifiées. Mettez à jour les DAE sur GéoDAE pour synchroniser les changements.
              </span>
            </div>
          </div>
        )}

        <div className="flex items-start gap-4">
          <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
            needsResync ? "bg-amber-100"
              : geodaeAllSynced ? "bg-green-100"
              : geodaeFailed.length > 0 ? "bg-red-100"
              : geodaeNoneSynced ? "bg-amber-100"
              : "bg-[#F5F5FE]"
          }`}>
            {needsResync ? (
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            ) : geodaeAllSynced ? (
              <CheckCircle className="h-5 w-5 text-[#18753C]" />
            ) : geodaeFailed.length > 0 ? (
              <AlertTriangle className="h-5 w-5 text-red-600" />
            ) : (
              <Globe className="h-5 w-5 text-[#000091]" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-bold text-[#3A3A3A]">Base nationale GéoDAE</h3>
              {needsResync && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700 animate-pulse">
                  <AlertTriangle className="h-2.5 w-2.5" />
                  Mise à jour requise
                </span>
              )}
              {geodaeAllSynced && !needsResync && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-[#18753C]">
                  <CheckCircle className="h-2.5 w-2.5" />
                  Synchronisé
                </span>
              )}
              {geodaeFailed.length > 0 && geodaeSent.length === 0 && !needsResync && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-700">
                  Échec
                </span>
              )}
              {!geodaeAllSynced && geodaeSent.length > 0 && !needsResync && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F5F5FE] text-[#000091]">
                  Partiellement synchronisé
                </span>
              )}
              {geodaeNoneSynced && !needsResync && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700">
                  Non envoyé
                </span>
              )}
            </div>

            <p className="text-xs text-[#929292] mb-3">
              {geodaeAllSynced
                ? `${geodaeSent.length} DAE enregistré${geodaeSent.length > 1 ? "s" : ""} dans la base nationale`
                : geodaeNoneSynced
                  ? `${devices.length} DAE en attente d'envoi`
                  : `${geodaeSent.length}/${devices.length} DAE synchronisé${geodaeSent.length > 1 ? "s" : ""}${geodaeFailed.length > 0 ? `, ${geodaeFailed.length} en échec` : ""}${geodaeNotSent.length > 0 ? `, ${geodaeNotSent.length} non envoyé${geodaeNotSent.length > 1 ? "s" : ""}` : ""}`}
              {geodaeLastSync && (
                <> · Dernière sync : {new Date(geodaeLastSync).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</>
              )}
            </p>

            <div className="flex flex-wrap gap-1.5">
              {devices.map((device, i) => {
                const isSent = device.geodaeStatus === "SENT" || device.geodaeStatus === "UPDATED";
                const isDeleted = device.geodaeStatus === "DELETED";
                const isFailed = device.geodaeStatus === "FAILED";
                return (
                  <div key={device.id} className="inline-flex items-center">
                    {isSent ? (
                      <button
                        type="button"
                        onClick={() => onShowDetail(device)}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                          needsResync
                            ? "bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100"
                            : "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                        }`}
                        title="Voir la fiche GéoDAE"
                      >
                        {needsResync ? <AlertTriangle className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
                        {device.nom || `DAE ${i + 1}`}
                        <span className="text-[10px] opacity-75">#{device.geodaeGid}</span>
                      </button>
                    ) : isDeleted ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium border bg-[#F6F6F6] border-[#E5E5E5] text-[#929292] line-through opacity-60">
                        <Trash2 className="h-3 w-3" />
                        {device.nom || `DAE ${i + 1}`}
                      </span>
                    ) : (
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium border ${
                        isFailed ? "bg-red-50 border-red-200 text-red-700" : "bg-[#F6F6F6] border-[#E5E5E5] text-[#929292]"
                      }`}>
                        {isFailed ? <XCircle className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                        {device.nom || `DAE ${i + 1}`}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="shrink-0">
            <Button
              size="sm"
              onClick={onOpenSyncManager}
              className={geodaeIsUpdate && geodaeFailed.length === 0 && !needsResync
                ? "bg-white text-[#000091] border border-[#000091] hover:bg-[#F5F5FE] shadow-none"
                : "bg-gradient-to-r from-[#000091] via-[#1a0f91] to-[#4a00e0] hover:from-[#000078] hover:via-[#15087a] hover:to-[#3d00c0] text-white shadow-md hover:shadow-lg transition-all duration-200"
              }
            >
              {geodaeIsUpdate ? <RotateCw className="h-3.5 w-3.5 mr-1.5" /> : <Upload className="h-3.5 w-3.5 mr-1.5" />}
              {geodaeFailed.length > 0 && geodaeSent.length === 0
                ? "Réessayer l'envoi"
                : geodaeIsUpdate
                  ? "Mettre à jour"
                  : "Envoyer vers GéoDAE"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
