"use client";

import { FIELD_LABELS } from "@/types/declarations";

interface AuditLog {
  id: string;
  action: string;
  fieldName: string | null;
  oldValue: string | null;
  newValue: string | null;
  deviceId: string | null;
  deviceName: string | null;
  metadata: string | null;
  createdAt: string;
  admin: { id: string; email: string; firstName: string | null; lastName: string | null } | null;
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  CREATED: { label: "Creation", color: "bg-[#18753C]" },
  FIELD_UPDATE: { label: "Modification", color: "bg-[#000091]" },
  STATUS_CHANGE: { label: "Changement de statut", color: "bg-amber-500" },
  DEVICE_UPDATE: { label: "Modification DAE", color: "bg-[#000091]" },
  USER_ATTACHED: { label: "Utilisateur rattache", color: "bg-purple-500" },
  GEODAE_SYNC: { label: "Envoi GéoDAE", color: "bg-sky-500" },
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Brouillon", COMPLETE: "Complète", VALIDATED: "Validée", CANCELLED: "Annulée",
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-[#F6F6F6] text-[#3A3A3A]",
  COMPLETE: "bg-amber-100 text-amber-700",
  VALIDATED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

interface AdminDeclHistoryProps {
  createdAt: string;
  updatedAt: string;
  ip: string | null;
  auditLogs: AuditLog[];
}

export default function AdminDeclHistory({ createdAt, updatedAt, ip, auditLogs }: AdminDeclHistoryProps) {
  return (
    <div className="space-y-4">
      {/* Meta header */}
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-[#929292] bg-[#F6F6F6] rounded-lg px-4 py-3 border border-[#E5E5E5]">
        <span>Creee le <strong className="text-[#3A3A3A]">{new Date(createdAt).toLocaleString("fr-FR")}</strong></span>
        <span>Mise a jour le <strong className="text-[#3A3A3A]">{new Date(updatedAt).toLocaleString("fr-FR")}</strong></span>
        {ip && <span>IP <strong className="text-[#3A3A3A]">{ip}</strong></span>}
      </div>

      {/* Timeline */}
      {auditLogs.length === 0 ? (
        <div className="text-center py-10 text-sm text-[#929292]">
          Aucune modification enregistree pour cette declaration.
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-[19px] top-2 bottom-2 w-px bg-[#E5E5E5]" />
          <div className="space-y-0">
            {auditLogs.map((log) => {
              const actionInfo = ACTION_LABELS[log.action] || { label: log.action, color: "bg-[#929292]" };
              const fieldLabel = log.fieldName ? (FIELD_LABELS[log.fieldName] || log.fieldName) : null;
              const adminName = log.admin
                ? (log.admin.firstName || log.admin.lastName
                  ? [log.admin.firstName, log.admin.lastName].filter(Boolean).join(" ")
                  : log.admin.email)
                : "Systeme";
              let meta: Record<string, any> = {};
              try { if (log.metadata) meta = JSON.parse(log.metadata); } catch {}

              return (
                <div key={log.id} className="relative flex gap-3 py-3 pl-1">
                  <div className={`relative z-10 mt-1 w-[10px] h-[10px] rounded-full shrink-0 ring-2 ring-white ${actionInfo.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium text-[#3A3A3A]">{actionInfo.label}</span>
                      {log.deviceName && (
                        <span className="text-[10px] bg-[#F6F6F6] border border-[#E5E5E5] rounded px-1.5 py-0.5 text-[#929292]">
                          {log.deviceName}
                        </span>
                      )}
                      <span className="text-[10px] text-[#929292] ml-auto shrink-0">
                        {new Date(log.createdAt).toLocaleString("fr-FR")} - {adminName}
                      </span>
                    </div>

                    {log.action === "STATUS_CHANGE" ? (
                      <div className="mt-1 flex items-center gap-2">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${STATUS_COLORS[log.oldValue || ""] || "bg-[#F6F6F6] text-[#3A3A3A]"}`}>
                          {STATUS_LABELS[log.oldValue || ""] || log.oldValue}
                        </span>
                        <span className="text-xs text-[#929292]">&rarr;</span>
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${STATUS_COLORS[log.newValue || ""] || "bg-[#F6F6F6] text-[#3A3A3A]"}`}>
                          {STATUS_LABELS[log.newValue || ""] || log.newValue}
                        </span>
                        {meta.cancelReason && (
                          <span className="text-[10px] text-[#929292] italic ml-1">({meta.cancelReason})</span>
                        )}
                      </div>
                    ) : log.action === "USER_ATTACHED" ? (
                      <p className="mt-1 text-xs text-[#929292]">
                        Utilisateur rattache : <span className="text-[#3A3A3A]">{log.newValue}</span>
                      </p>
                    ) : log.action === "GEODAE_SYNC" ? (
                      <div className="mt-1 text-xs">
                        {meta.status === "SENT" || meta.status === "UPDATED" ? (
                          <span className="text-[#18753C] bg-green-50 rounded px-1">
                            {meta.status === "UPDATED" ? "Mis à jour" : "Envoyé"} — GID {meta.gid}
                          </span>
                        ) : (
                          <span className="text-red-600 bg-red-50 rounded px-1">
                            Échec : {meta.error ? (meta.error.length > 100 ? meta.error.slice(0, 100) + "..." : meta.error) : "erreur inconnue"}
                          </span>
                        )}
                      </div>
                    ) : fieldLabel ? (
                      <div className="mt-1 text-xs">
                        <span className="text-[#929292]">{fieldLabel} : </span>
                        {log.oldValue ? (
                          <>
                            <span className="line-through text-red-400 bg-red-50 rounded px-1">{log.oldValue.length > 80 ? log.oldValue.slice(0, 80) + "..." : log.oldValue}</span>
                            <span className="text-[#929292] mx-1">&rarr;</span>
                          </>
                        ) : null}
                        <span className="text-[#18753C] bg-green-50 rounded px-1">{(log.newValue || "").length > 80 ? (log.newValue || "").slice(0, 80) + "..." : (log.newValue || "(vide)")}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export type { AuditLog };
