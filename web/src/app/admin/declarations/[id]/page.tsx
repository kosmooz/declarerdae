"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Cpu,
  MapPin,
  CheckCircle,
  ShieldCheck,
  XCircle,
  User,
  Pencil,
  ClipboardList,
  Clock,
  Building2,
  Phone,
  Mail,
  MapPinned,
  Hash,
  Upload,
  RefreshCw,
  Globe,
  Loader2,
  AlertTriangle,
  RotateCw,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import AdminEditableSection from "./AdminEditableSection";
import ExploitantEditForm from "./ExploitantEditForm";
import SiteEditForm from "./SiteEditForm";
import DeviceEditForm from "./DeviceEditForm";
import UserAttachmentDialog from "./UserAttachmentDialog";
import { GeodaeSyncManager, GeodaeDetailContent } from "@/components/declarerdae/geodae";
import AdminDeclHistory from "./AdminDeclHistory";
import type { AuditLog } from "./AdminDeclHistory";
import AdminCancelDialog from "./AdminCancelDialog";
import AdminDeclGeodae from "./AdminDeclGeodae";

import PHONE_PREFIXES from "@/data/phone-prefixes";

const DIAL_BY_CODE = new Map(PHONE_PREFIXES.map((p) => [p.code, p.dial]));

function formatPhone(number: string | null, prefixCode: string | null): string {
  if (!number) return "—";
  const dial = prefixCode ? DIAL_BY_CODE.get(prefixCode) : null;
  if (!dial) return number;
  const cleaned = number.replace(/^0/, "");
  return `+${dial} ${cleaned}`;
}

/** Build a tel: URI in E.164 format (no spaces, no leading 0) */
function phoneHref(number: string | null, prefixCode: string | null): string | undefined {
  if (!number) return undefined;
  const dial = prefixCode ? DIAL_BY_CODE.get(prefixCode) : null;
  const cleaned = number.replace(/[\s\-\.()]/g, "").replace(/^0/, "");
  if (!dial) return `tel:${cleaned}`;
  return `tel:+${dial}${cleaned}`;
}

/* ─── Types ───────────────────────────────────────────────────────────── */

import type { DaeDevice, Declaration as BaseDeclaration } from "@/types/declarations";
import { FIELD_LABELS } from "@/types/declarations";
import { isPhoneValid, isPrefixValid, GEODAE_PREFIXES } from "@/lib/validation";

interface Declaration extends BaseDeclaration {
  number: number;
  ip: string | null;
  userId: string | null;
  user: { id: string; email: string; emailVerified: boolean; firstName: string | null; lastName: string | null } | null;
}

/* ─── Constants ───────────────────────────────────────────────────────── */

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Brouillon",
  COMPLETE: "Complète",
  VALIDATED: "Validée",
  CANCELLED: "Annulée",
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-[#F6F6F6] text-[#3A3A3A]",
  COMPLETE: "bg-amber-100 text-amber-700",
  VALIDATED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const TYPE_ERP_LABELS: Record<string, string> = {
  erp: "ERP (Établissement Recevant du Public)",
  "non-erp": "Autre établissement",
  entreprise: "Entreprise privée",
  association: "Association",
  collectivite: "Collectivité territoriale",
};


// CANCEL_REASONS moved to AdminCancelDialog

// AuditLog type imported from AdminDeclHistory

function parseJsonArray(val: string | null): string[] {
  if (!val) return [];
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [val];
  } catch {
    return [val];
  }
}

/* ─── InfoRow ─────────────────────────────────────────────────────────── */

function InfoRow({
  label,
  value,
  href,
}: {
  label: string;
  value: string | null | undefined;
  href?: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center py-1.5">
      <span className="text-sm text-[#929292] sm:w-44 shrink-0">{label}</span>
      {href && value ? (
        <a href={href} className="text-sm font-medium text-[#000091] hover:underline">
          {value}
        </a>
      ) : (
        <span className="text-sm font-medium text-[#3A3A3A]">
          {value || "—"}
        </span>
      )}
    </div>
  );
}

/* ─── Page component ──────────────────────────────────────────────────── */

function computeNeedsResync(decl: Declaration): boolean {
  const synced = decl.daeDevices.filter(
    (d) => (d.geodaeStatus === "SENT" || d.geodaeStatus === "UPDATED") && d.geodaeLastSync,
  );
  if (synced.length === 0) return false;
  const declUpdated = new Date(decl.updatedAt).getTime();
  return synced.some((d) => declUpdated > new Date(d.geodaeLastSync!).getTime());
}

export default function AdminDeclarationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [decl, setDecl] = useState<Declaration | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit mode
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editData, setEditData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  // Notes edit
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState("");

  // Dialogs
  const [showUserAttachment, setShowUserAttachment] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showValidateConfirm, setShowValidateConfirm] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  // Cancel dialog state
  // cancelReason/cancelEmailBody moved to AdminCancelDialog

  // Active detail section
  const [activeTab, setActiveTab] = useState("exploitant");
  const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null);

  // Audit logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // GéoDAE sync (shared component)
  const [showGeodaeSyncManager, setShowGeodaeSyncManager] = useState(false);
  const [geodaeDetailDevice, setGeodaeDetailDevice] = useState<DaeDevice | null>(null);
  const [geodaeDetailData, setGeodaeDetailData] = useState<Record<string, any> | null>(null);
  const [geodaeDetailLoading, setGeodaeDetailLoading] = useState(false);
  const [geodaeDetailError, setGeodaeDetailError] = useState<string | null>(null);
  const [deletingDevice, setDeletingDevice] = useState(false);
  const [needsResync, setNeedsResync] = useState(false);

  /* ─── Load ─────────────────────────────────────────────────────────── */

  useEffect(() => {
    const ctrl = new AbortController();
    async function load() {
      setLoading(true);
      const [declRes, logsRes] = await Promise.all([
        apiFetch(`/api/admin/declarations/${id}`, { signal: ctrl.signal }),
        apiFetch(`/api/admin/declarations/${id}/audit-logs`, { signal: ctrl.signal }),
      ]);
      if (declRes.ok) {
        const data = await declRes.json();
        setDecl(data);
        setNotesValue(data.notes || "");
        setNeedsResync(computeNeedsResync(data));
      } else {
        toast.error("Déclaration introuvable");
        router.push("/admin/declarations");
      }
      if (logsRes.ok) {
        setAuditLogs(await logsRes.json());
      }
      if (!ctrl.signal.aborted) setLoading(false);
    }
    load().catch((err: unknown) => { if ((err as Error).name !== "AbortError") console.error("[admin-decl-load]", err); });
    return () => ctrl.abort();
  }, [id, router]);

  /* ─── Edit helpers ─────────────────────────────────────────────────── */

  const startEdit = useCallback(
    (section: string, data: Record<string, any>) => {
      setEditingSection(section);
      setEditData({ ...data });
    },
    [],
  );

  const cancelEdit = useCallback(() => {
    setEditingSection(null);
    setEditData({});
  }, []);

  const handleEditChange = useCallback(
    (field: string, value: any) => {
      setEditData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleBatchChange = useCallback(
    (fields: Record<string, any>) => {
      setEditData((prev) => ({ ...prev, ...fields }));
    },
    [],
  );

  const SKIP_DEVICE_KEYS = new Set([
    "id", "position", "declarationId", "createdAt", "updatedAt", "localId",
    "geodaeGid", "geodaeStatus", "geodaeLastSync", "geodaeLastError",
    // Champs supprimés du DTO (colonnes DB conservées mais non exposées)
    "accPcsec", "accAcc", "fabSiren", "idEuro", "mntRais", "mntSiren", "freqMnt", "dtprBat",
  ]);

  // GEODAE_PREFIXES, isPhoneValid, isPrefixValid imported from @/lib/validation

  const handleSectionSave = useCallback(
    async (section: string) => {
      if (!decl) return;

      // Validate phone fields before saving
      if (section === "exploitant") {
        if (!editData.exptTel1?.trim()) {
          toast.error("Téléphone exploitant obligatoire");
          return;
        }
        if (!isPhoneValid(editData.exptTel1)) {
          toast.error("Téléphone exploitant : 9 chiffres requis (hors indicatif)");
          return;
        }
        if (!isPrefixValid(editData.exptTel1Prefix)) {
          toast.error("Indicatif exploitant : France ou DOM-TOM requis");
          return;
        }
      }
      if (section === "site") {
        if (!editData.tel1?.trim()) {
          toast.error("Téléphone du site obligatoire");
          return;
        }
        if (!isPhoneValid(editData.tel1)) {
          toast.error("Téléphone du site : 9 chiffres requis (hors indicatif)");
          return;
        }
        if (!isPrefixValid(editData.tel1Prefix)) {
          toast.error("Indicatif du site : France ou DOM-TOM requis");
          return;
        }
        if (editData.tel2?.trim()) {
          if (!isPhoneValid(editData.tel2)) {
            toast.error("Téléphone secondaire : 9 chiffres requis (hors indicatif)");
            return;
          }
          if (!isPrefixValid(editData.tel2Prefix)) {
            toast.error("Indicatif tél. secondaire : France ou DOM-TOM requis");
            return;
          }
        }
      }
      if (section.startsWith("device-")) {
        if (!editData.dermnt?.trim()) {
          toast.error(editData.hadMaintenance === "OUI" ? "Date de maintenance obligatoire" : "Date d'installation obligatoire");
          return;
        }
      }

      setSaving(true);

      let body: Record<string, any>;

      if (section.startsWith("device-")) {
        const deviceId = section.replace("device-", "");
        const devicePayload: Record<string, any> = { id: deviceId };
        for (const [key, value] of Object.entries(editData)) {
          if (SKIP_DEVICE_KEYS.has(key)) continue;
          if (key === "dispJ" || key === "dispH") {
            devicePayload[key] = Array.isArray(value) ? JSON.stringify(value) : value;
          } else {
            devicePayload[key] = value;
          }
        }
        body = { daeDevices: [devicePayload] };
      } else {
        body = { ...editData };
      }

      const res = await apiFetch(`/api/admin/declarations/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
        silent: true,
      });

      if (res.ok) {
        const data = await res.json();
        setDecl(data);
        setNotesValue(data.notes || "");
        setEditingSection(null);
        setEditData({});
        toast.success("Section mise à jour");
        // Refresh audit logs
        apiFetch(`/api/admin/declarations/${id}/audit-logs`).then(async (r) => {
          if (r.ok) setAuditLogs(await r.json());
        });
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Erreur lors de la mise à jour");
      }
      setSaving(false);
    },
    [decl, editData, id],
  );

  /* ─── Status transitions ───────────────────────────────────────────── */

  const handleStatusTransition = useCallback(
    async (newStatus: string, extra?: Record<string, any>) => {
      if (!decl) return;
      setTransitioning(true);

      const res = await apiFetch(`/api/admin/declarations/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus, ...extra }),
        silent: true,
      });

      if (res.ok) {
        const data = await res.json();
        setDecl(data);
        setNotesValue(data.notes || "");
        toast.success(`Déclaration ${STATUS_LABELS[newStatus] || newStatus}`);
        apiFetch(`/api/admin/declarations/${id}/audit-logs`).then(async (r) => {
          if (r.ok) setAuditLogs(await r.json());
        });
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Erreur lors de la transition");
      }
      setTransitioning(false);
      setShowCancelConfirm(false);
      setShowValidateConfirm(false);
    },
    [decl, id],
  );

  /* ─── Notes save ───────────────────────────────────────────────────── */

  const handleNotesSave = useCallback(async () => {
    if (!decl) return;
    setSaving(true);

    const res = await apiFetch(`/api/admin/declarations/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ notes: notesValue }),
      silent: true,
    });

    if (res.ok) {
      const data = await res.json();
      setDecl(data);
      setNotesValue(data.notes || "");
      setEditingNotes(false);
      toast.success("Notes mises à jour");
      apiFetch(`/api/admin/declarations/${id}/audit-logs`).then(async (r) => {
        if (r.ok) setAuditLogs(await r.json());
      });
    } else {
      const err = await res.json().catch(() => ({}));
      toast.error(err.message || "Erreur");
    }
    setSaving(false);
  }, [decl, id, notesValue]);

  /* ─── GéoDAE ────────────────────────────────────────────────────────── */

  const reloadDeclAndLogs = useCallback(async () => {
    const [declRes, logsRes] = await Promise.all([
      apiFetch(`/api/admin/declarations/${id}`),
      apiFetch(`/api/admin/declarations/${id}/audit-logs`),
    ]);
    if (declRes.ok) {
      const data = await declRes.json();
      setDecl(data);
      setNotesValue(data.notes || "");
      setNeedsResync(computeNeedsResync(data));
    }
    if (logsRes.ok) setAuditLogs(await logsRes.json());
  }, [id]);

  const handleShowGeodaeDetail = useCallback(async (device: DaeDevice) => {
    setGeodaeDetailDevice(device);
    setGeodaeDetailData(null);
    setGeodaeDetailError(null);
    setGeodaeDetailLoading(true);
    try {
      const res = await apiFetch(`/api/admin/geodae/fetch/${device.id}`);
      if (res.ok) {
        setGeodaeDetailData(await res.json());
      } else {
        const err = await res.json().catch(() => ({}));
        setGeodaeDetailError(err.message || "Erreur");
      }
    } catch {
      setGeodaeDetailError("Erreur réseau");
    }
    setGeodaeDetailLoading(false);
  }, []);

  const handleDeleteDevice = useCallback(async (deviceId: string) => {
    setDeletingDevice(true);
    try {
      const res = await apiFetch(`/api/admin/geodae/delete-device/${deviceId}`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast.success("DAE supprimé de GéoDAE");
        setGeodaeDetailDevice(null);
      } else {
        toast.error(data.error || "Erreur");
      }
    } catch {
      toast.error("Erreur réseau");
    }
    setDeletingDevice(false);
    reloadDeclAndLogs();
  }, [reloadDeclAndLogs]);

  /* ─── Render ───────────────────────────────────────────────────────── */

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#000091]" />
      </div>
    );
  }

  if (!decl) return null;

  const exploitantName = [decl.exptPrenom, decl.exptNom].filter(Boolean).join(" ");
  const fullAddress = [decl.adrNum, decl.adrVoie, decl.codePostal, decl.ville].filter(Boolean).join(" ");

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <button
        onClick={() => router.push("/admin/declarations")}
        className="flex items-center gap-1.5 text-sm text-[#929292] hover:text-[#3A3A3A] transition-colors mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Déclarations
      </button>

      {/* Header row: title + status + date + actions */}
      <div className="bg-white rounded-lg border border-[#E5E5E5] p-5 mb-6">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg font-bold text-[#3A3A3A]">
              Demande #{decl.number}
            </h1>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[decl.status] || ""}`}
            >
              {STATUS_LABELS[decl.status] || decl.status}
            </span>
            {decl.user ? (
              <span className="flex items-center gap-1.5 ml-1">
                <a
                  href={`/admin/users/${decl.user.id}`}
                  className="text-xs text-[#000091] hover:underline"
                >
                  Compte : {decl.user.email}
                </a>
                {decl.user.emailVerified ? (
                  <CheckCircle className="w-3.5 h-3.5 text-[#18753C] shrink-0" />
                ) : (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-700">
                    <AlertTriangle className="w-3 h-3" />
                    Non vérifié
                  </span>
                )}
              </span>
            ) : (
              <span className="text-xs text-amber-600 ml-1">Non rattachée</span>
            )}
          </div>
          <p className="text-xs text-[#929292] shrink-0">
            {new Date(decl.createdAt).toLocaleDateString("fr-FR")}
          </p>
        </div>

        {/* 4-column summary */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Column 1: Exploitant */}
          <div className="rounded-md border border-[#E5E5E5] p-4">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-4 h-4 text-[#000091]" />
              <span className="text-xs font-semibold text-[#000091] uppercase tracking-wide">
                Exploitant
              </span>
            </div>
            <p className="text-sm font-semibold text-[#3A3A3A]">
              {decl.exptRais || "—"}
            </p>
            {decl.exptSiren && (
              <p className="text-xs text-[#929292] mt-0.5">
                SIREN {decl.exptSiren}
                {decl.exptSiret && <span> · SIRET {decl.exptSiret}</span>}
              </p>
            )}

            {exploitantName && (
              <div className="mt-3 pt-3 border-t border-[#E5E5E5]">
                <p className="text-xs font-medium text-[#929292] mb-1">Contact</p>
                <p className="text-sm text-[#3A3A3A]">{exploitantName}</p>
                {decl.exptEmail && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <Mail className="w-3 h-3 text-[#929292]" />
                    <a href={`mailto:${decl.exptEmail}`} className="text-xs text-[#000091] hover:underline">{decl.exptEmail}</a>
                  </div>
                )}
                {decl.exptTel1 && (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Phone className="w-3 h-3 text-[#929292]" />
                    <a href={phoneHref(decl.exptTel1, decl.exptTel1Prefix)} className="text-xs text-[#000091] hover:underline">{formatPhone(decl.exptTel1, decl.exptTel1Prefix)}</a>
                  </div>
                )}
              </div>
            )}

            {(decl.exptVoie || decl.exptCp) && (
              <div className="mt-3 pt-3 border-t border-[#E5E5E5]">
                <p className="text-xs font-medium text-[#929292] mb-1">Adresse</p>
                {decl.exptVoie && (
                  <p className="text-xs text-[#3A3A3A]">
                    {[decl.exptNum, decl.exptVoie].filter(Boolean).join(" ")}
                  </p>
                )}
                {(decl.exptCp || decl.exptCom) && (
                  <p className="text-xs text-[#3A3A3A]">
                    {[decl.exptCp, decl.exptCom].filter(Boolean).join(" ")}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Column 2: Site */}
          <div className="rounded-md border border-[#E5E5E5] p-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-[#000091]" />
              <span className="text-xs font-semibold text-[#000091] uppercase tracking-wide">
                Site d'implantation
              </span>
            </div>
            {decl.nomEtablissement && (
              <p className="text-sm font-semibold text-[#3A3A3A]">
                {decl.nomEtablissement}
              </p>
            )}
            <p className="text-xs text-[#929292] mt-0.5">
              {TYPE_ERP_LABELS[decl.typeERP || ""] || decl.typeERP || "—"}
            </p>

            <div className="mt-3 pt-3 border-t border-[#E5E5E5]">
              <p className="text-xs font-medium text-[#929292] mb-1">Adresse</p>
              <p className="text-xs text-[#3A3A3A]">
                {[decl.adrNum, decl.adrVoie].filter(Boolean).join(" ") || "—"}
              </p>
              <p className="text-xs text-[#3A3A3A]">
                {[decl.codePostal, decl.ville].filter(Boolean).join(" ")}
              </p>
              {decl.latCoor1 != null && decl.longCoor1 != null && (
                <p className="text-[10px] text-[#929292] mt-0.5">
                  GPS {decl.latCoor1.toFixed(5)}, {decl.longCoor1.toFixed(5)}
                </p>
              )}
            </div>

            {(decl.tel1 || decl.tel2 || decl.siteEmail) && (
              <div className="mt-3 pt-3 border-t border-[#E5E5E5]">
                <p className="text-xs font-medium text-[#929292] mb-1">Contact site</p>
                {decl.tel1 && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-[#929292]" />
                    <a href={phoneHref(decl.tel1, decl.tel1Prefix)} className="text-xs text-[#000091] hover:underline">{formatPhone(decl.tel1, decl.tel1Prefix)}</a>
                  </div>
                )}
                {decl.tel2 && (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Phone className="w-3 h-3 text-[#929292]" />
                    <a href={phoneHref(decl.tel2, decl.tel2Prefix)} className="text-xs text-[#000091] hover:underline">{formatPhone(decl.tel2, decl.tel2Prefix)}</a>
                  </div>
                )}
                {decl.siteEmail && (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Mail className="w-3 h-3 text-[#929292]" />
                    <a href={`mailto:${decl.siteEmail}`} className="text-xs text-[#000091] hover:underline">{decl.siteEmail}</a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Column 3: DAE cards */}
          <div className="rounded-md border border-[#E5E5E5] p-4">
            <div className="flex items-center gap-2 mb-3">
              <Cpu className="w-4 h-4 text-[#000091]" />
              <span className="text-xs font-semibold text-[#000091] uppercase tracking-wide">
                {decl.daeDevices.length} Défibrillateur{decl.daeDevices.length > 1 ? "s" : ""}
              </span>
            </div>
            {decl.daeDevices.length === 0 ? (
              <p className="text-xs text-[#929292] italic">Aucun DAE déclaré</p>
            ) : (
              <div className="space-y-2">
                {decl.daeDevices.map((device, i) => (
                  <div
                    key={device.id}
                    className="rounded border border-[#E5E5E5] bg-[#F6F6F6] px-3 py-2"
                  >
                    <p className="text-sm font-semibold text-[#3A3A3A]">
                      {device.nom || `DAE ${i + 1}`}
                    </p>
                    <p className="text-xs text-[#929292] mt-0.5">
                      {[device.fabRais, device.modele].filter(Boolean).join(" — ") || "—"}
                    </p>
                    {device.numSerie && (
                      <p className="text-xs text-[#929292]">
                        S/N {device.numSerie}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {device.etatFonct && (
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          device.etatFonct === "En fonctionnement"
                            ? "bg-green-100 text-green-700"
                            : device.etatFonct === "Hors service"
                              ? "bg-red-100 text-red-700"
                              : "bg-[#F6F6F6] text-[#3A3A3A] border border-[#E5E5E5]"
                        }`}>
                          {device.etatFonct}
                        </span>
                      )}
                      {device.acc && (
                        <span className="text-[10px] text-[#929292]">
                          {device.acc === "interieur" ? "Int." : "Ext."}
                          {device.accLib === "OUI" && " · Libre"}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Column 4: Notes */}
          <div className="rounded-md border border-[#E5E5E5] p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-[#000091]" />
                <span className="text-xs font-semibold text-[#000091] uppercase tracking-wide">
                  Notes
                </span>
              </div>
              {!editingNotes && (
                <button
                  type="button"
                  onClick={() => setEditingNotes(true)}
                  className="text-[#929292] hover:text-[#3A3A3A] transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {editingNotes ? (
              <div className="flex flex-col flex-1 gap-2">
                <textarea
                  value={notesValue}
                  onChange={(e) => setNotesValue(e.target.value)}
                  className="flex-1 min-h-[120px] w-full rounded-md border border-[#E5E5E5] bg-white px-3 py-2 text-xs resize-none focus:outline-none focus:border-[#000091] focus:ring-1 focus:ring-[#000091]"
                  placeholder="Ajouter des notes..."
                />
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={handleNotesSave} disabled={saving} className="bg-[#000091] hover:bg-[#000091]/90 text-white text-xs h-7 px-2.5">
                    {saving ? "..." : "Enregistrer"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setEditingNotes(false); setNotesValue(decl.notes || ""); }}
                    disabled={saving}
                    className="text-[#929292] text-xs h-7 px-2.5"
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            ) : (
              <p
                className="text-xs text-[#3A3A3A] whitespace-pre-wrap flex-1 cursor-pointer hover:bg-[#F6F6F6] rounded p-1.5 -m-1.5 transition-colors"
                onClick={() => setEditingNotes(true)}
              >
                {decl.notes || <span className="text-[#929292] italic">Cliquez pour ajouter une note...</span>}
              </p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-4 mt-4 border-t border-[#E5E5E5]">
          {decl.status === "DRAFT" && (
            <>
              <Button
                size="sm"
                onClick={() => setShowUserAttachment(true)}
                className="bg-[#18753C] hover:bg-[#18753C]/90 text-white"
              >
                <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                Passer en Complète
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCancelConfirm(true)}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <XCircle className="h-3.5 w-3.5 mr-1.5" />
                Annuler
              </Button>
            </>
          )}
          {decl.status === "COMPLETE" && (
            <>
              <Button
                size="sm"
                onClick={() => setShowValidateConfirm(true)}
                className="bg-[#18753C] hover:bg-[#18753C]/90 text-white"
              >
                <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
                Valider la déclaration
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCancelConfirm(true)}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <XCircle className="h-3.5 w-3.5 mr-1.5" />
                Annuler
              </Button>
            </>
          )}
          {decl.status === "VALIDATED" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCancelConfirm(true)}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <XCircle className="h-3.5 w-3.5 mr-1.5" />
              Annuler
            </Button>
          )}
          {decl.status === "CANCELLED" && (
            <Button
              size="sm"
              onClick={() => handleStatusTransition("COMPLETE")}
              disabled={transitioning}
              className="bg-[#000091] hover:bg-[#000091]/90 text-white"
            >
              <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
              {transitioning ? "Réactivation..." : "Réactiver la déclaration"}
            </Button>
          )}
        </div>
      </div>

      {/* GéoDAE sync card */}
      {(decl.status === "VALIDATED" || decl.status === "COMPLETE") && (
        <AdminDeclGeodae
          devices={decl.daeDevices}
          needsResync={needsResync}
          onShowDetail={handleShowGeodaeDetail}
          onOpenSyncManager={() => setShowGeodaeSyncManager(true)}
        />
      )}

      {/* Detail sections */}
      <div className="max-w-[960px]">
        {/* Section nav */}
        <div className="flex gap-2 mb-4">
          {[
            { key: "exploitant", icon: Building2, label: "Exploitant" },
            { key: "site", icon: MapPin, label: "Site" },
            { key: "dae", icon: Cpu, label: `DAE (${decl.daeDevices.length})` },
            { key: "history", icon: Clock, label: "Historique" },
          ].map(({ key, icon: Icon, label }) => {
            const active = (activeTab || "exploitant") === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-[#000091] text-white shadow-sm"
                    : "bg-white text-[#3A3A3A] border border-[#E5E5E5] hover:border-[#000091]/40 hover:text-[#000091]"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            );
          })}
        </div>

        {/* Section : Exploitant */}
        {(activeTab || "exploitant") === "exploitant" && (
          <AdminEditableSection
            title="Exploitant"
            icon={<Building2 className="w-4 h-4" />}
            isEditing={editingSection === "exploitant"}
            onStartEdit={() =>
              startEdit("exploitant", {
                exptRais: decl.exptRais,
                exptSiren: decl.exptSiren,
                exptSiret: decl.exptSiret,
                exptNom: decl.exptNom,
                exptPrenom: decl.exptPrenom,
                exptEmail: decl.exptEmail,
                exptTel1: decl.exptTel1,
                exptTel1Prefix: decl.exptTel1Prefix,
                exptNum: decl.exptNum,
                exptVoie: decl.exptVoie,
                exptCp: decl.exptCp,
                exptCom: decl.exptCom,
              })
            }
            onCancel={cancelEdit}
            onSave={() => handleSectionSave("exploitant")}
            saving={saving}
            editContent={
              <ExploitantEditForm data={editData} onChange={handleEditChange} />
            }
          >
            <InfoRow label="Raison sociale" value={decl.exptRais} />
            <InfoRow label="SIREN" value={decl.exptSiren} />
            <InfoRow label="SIRET" value={decl.exptSiret} />
            <InfoRow label="Nom" value={decl.exptNom} />
            <InfoRow label="Prénom" value={decl.exptPrenom} />
            <InfoRow label="Email" value={decl.exptEmail} href={decl.exptEmail ? `mailto:${decl.exptEmail}` : undefined} />
            <InfoRow label="Téléphone" value={formatPhone(decl.exptTel1, decl.exptTel1Prefix)} href={phoneHref(decl.exptTel1, decl.exptTel1Prefix)} />
            {decl.exptVoie && (
              <InfoRow
                label="Adresse"
                value={[decl.exptNum, decl.exptVoie, decl.exptCp, decl.exptCom]
                  .filter(Boolean)
                  .join(" ")}
              />
            )}
            <InfoRow label="Adresse IP" value={decl.ip} />
          </AdminEditableSection>
        )}

        {/* Section : Site */}
        {activeTab === "site" && (
          <AdminEditableSection
            title="Site d'implantation"
            icon={<MapPin className="w-4 h-4" />}
            isEditing={editingSection === "site"}
            onStartEdit={() =>
              startEdit("site", {
                nomEtablissement: decl.nomEtablissement,
                typeERP: decl.typeERP,
                adrNum: decl.adrNum,
                adrVoie: decl.adrVoie,
                adrComplement: (decl as any).adrComplement || "",
                codePostal: decl.codePostal,
                codeInsee: (decl as any).codeInsee || "",
                ville: decl.ville,
                latCoor1: decl.latCoor1,
                longCoor1: decl.longCoor1,
                xyPrecis: (decl as any).xyPrecis,
                tel1: decl.tel1,
                tel1Prefix: decl.tel1Prefix,
                tel2: decl.tel2,
                tel2Prefix: decl.tel2Prefix,
                siteEmail: decl.siteEmail,
              })
            }
            onCancel={cancelEdit}
            onSave={() => handleSectionSave("site")}
            saving={saving}
            editContent={
              <SiteEditForm data={editData} onChange={handleEditChange} onBatchChange={handleBatchChange} />
            }
          >
            <InfoRow label="Établissement" value={decl.nomEtablissement} />
            <InfoRow
              label="Type"
              value={TYPE_ERP_LABELS[decl.typeERP || ""] || decl.typeERP}
            />
            <InfoRow
              label="Adresse"
              value={[decl.adrNum, decl.adrVoie].filter(Boolean).join(" ")}
            />
            <InfoRow label="Code postal" value={decl.codePostal} />
            <InfoRow label="Ville" value={decl.ville} />
            {decl.latCoor1 != null && decl.longCoor1 != null && (
              <InfoRow
                label="Coordonnées GPS"
                value={`${decl.latCoor1.toFixed(6)}, ${decl.longCoor1.toFixed(6)}`}
              />
            )}
            <InfoRow label="Tél. site" value={formatPhone(decl.tel1, decl.tel1Prefix)} href={phoneHref(decl.tel1, decl.tel1Prefix)} />
            {decl.tel2 && <InfoRow label="Tél. 2" value={formatPhone(decl.tel2, decl.tel2Prefix)} href={phoneHref(decl.tel2, decl.tel2Prefix)} />}
            {decl.siteEmail && (
              <InfoRow label="Email site" value={decl.siteEmail} href={`mailto:${decl.siteEmail}`} />
            )}
          </AdminEditableSection>
        )}

        {/* Section : DAE */}
        {activeTab === "dae" && (
          decl.daeDevices.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-sm text-[#929292]">
                Aucun défibrillateur déclaré
              </CardContent>
            </Card>
          ) : (
            <div>
              {/* Device selector cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                {decl.daeDevices.map((device, i) => {
                  const selected = (activeDeviceId || decl.daeDevices[0]?.id) === device.id;
                  return (
                    <button
                      key={device.id}
                      type="button"
                      onClick={() => setActiveDeviceId(device.id)}
                      className={`text-left rounded-lg border-2 p-3 transition-all ${
                        selected
                          ? "border-[#000091] bg-[#F5F5FE] shadow-sm"
                          : "border-[#E5E5E5] bg-white hover:border-[#000091]/30"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          selected ? "bg-[#000091] text-white" : "bg-[#F6F6F6] text-[#929292]"
                        }`}>
                          {i + 1}
                        </div>
                        <span className="text-sm font-semibold text-[#3A3A3A] truncate">
                          {device.nom || `DAE ${i + 1}`}
                        </span>
                      </div>
                      <p className="text-xs text-[#929292] truncate">
                        {[device.fabRais, device.modele].filter(Boolean).join(" - ") || "Non renseigne"}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        {device.etatFonct && (
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            device.etatFonct === "En fonctionnement"
                              ? "bg-green-100 text-green-700"
                              : device.etatFonct === "Hors service"
                                ? "bg-red-100 text-red-700"
                                : "bg-[#F6F6F6] text-[#3A3A3A]"
                          }`}>
                            {device.etatFonct}
                          </span>
                        )}
                        {device.numSerie && (
                          <span className="text-[10px] text-[#929292]">S/N {device.numSerie}</span>
                        )}
                        {device.geodaeStatus === "SENT" && device.geodaeGid && (
                          <a
                            href={`https://geodae.atlasante.fr/form/8777a504-6c3e-4abe-8100-60bb58767faa/${device.geodaeGid}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                          >
                            <Globe className="h-2.5 w-2.5" /> #{device.geodaeGid}
                          </a>
                        )}
                        {device.geodaeStatus === "UPDATED" && device.geodaeGid && (
                          <a
                            href={`https://geodae.atlasante.fr/form/8777a504-6c3e-4abe-8100-60bb58767faa/${device.geodaeGid}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-sky-100 text-sky-700 hover:bg-sky-200 transition-colors"
                          >
                            <Globe className="h-2.5 w-2.5" /> #{device.geodaeGid}
                          </a>
                        )}
                        {device.geodaeStatus === "FAILED" && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-700">
                            <Globe className="h-2.5 w-2.5" /> Échec
                          </span>
                        )}
                        {device.geodaeStatus === "DELETED" && device.geodaeGid && (
                          <a
                            href={`https://geodae.atlasante.fr/form/8777a504-6c3e-4abe-8100-60bb58767faa/${device.geodaeGid}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#F6F6F6] text-[#929292] line-through hover:bg-[#E5E5E5] transition-colors"
                          >
                            <Trash2 className="h-2.5 w-2.5" /> #{device.geodaeGid}
                          </a>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected device detail */}
              {decl.daeDevices.map((device, i) => {
                const selected = (activeDeviceId || decl.daeDevices[0]?.id) === device.id;
                if (!selected) return null;
                const sectionKey = `device-${device.id}`;
                const isEditingDevice = editingSection === sectionKey;

                return (
                  <AdminEditableSection
                    key={device.id}
                    title={device.nom || `DAE ${i + 1}`}
                    icon={<Cpu className="w-4 h-4" />}
                    headerExtra={undefined}
                    isEditing={isEditingDevice}
                    onStartEdit={() => {
                      const deviceData: Record<string, any> = { ...device };
                      deviceData.dispJ = parseJsonArray(device.dispJ);
                      deviceData.dispH = parseJsonArray(device.dispH);
                      startEdit(sectionKey, deviceData);
                    }}
                    onCancel={cancelEdit}
                    onSave={() => handleSectionSave(sectionKey)}
                    saving={saving}
                    editContent={
                      <DeviceEditForm data={editData} siteLat={decl.latCoor1} siteLng={decl.longCoor1} onChange={handleEditChange} />
                    }
                  >
                    <InfoRow label="Nom" value={device.nom} />
                    <InfoRow label="Fabricant" value={device.fabRais} />
                    <InfoRow label="Modele" value={device.modele} />
                    <InfoRow label="N. serie" value={device.numSerie} />
                    <InfoRow
                      label="Environnement"
                      value={
                        device.acc === "interieur"
                          ? "Interieur"
                          : device.acc === "exterieur"
                            ? "Exterieur"
                            : device.acc
                      }
                    />
                    <InfoRow label="Acces libre" value={device.accLib} />
                    <InfoRow label="DAE itinerant" value={device.daeMobile} />
                    {device.accEtg && (
                      <InfoRow label="Etage" value={device.accEtg} />
                    )}
                    {device.accComplt && (
                      <InfoRow label="Compl. acces" value={device.accComplt} />
                    )}
                    <InfoRow
                      label="Jours"
                      value={parseJsonArray(device.dispJ).join(", ")}
                    />
                    <InfoRow
                      label="Heures"
                      value={parseJsonArray(device.dispH).join(", ")}
                    />
                    {device.dispComplt && (
                      <InfoRow label="Compl. dispo." value={device.dispComplt} />
                    )}
                    <InfoRow label="Dern. maintenance" value={device.dermnt} />
                    {device.dateInstal && (
                      <InfoRow label="Installation" value={device.dateInstal} />
                    )}
                    {device.dispSurv && (
                      <InfoRow label="Surveillance" value={device.dispSurv} />
                    )}
                    {device.lcPed && (
                      <InfoRow label="Electr. pediatriques" value={device.lcPed} />
                    )}
                    {device.dtprLcad && (
                      <InfoRow label="Date de péremption des électrodes adultes" value={device.dtprLcad} />
                    )}
                    {device.dtprLcped && (
                      <InfoRow label="Date de péremption des électrodes pédiatriques" value={device.dtprLcped} />
                    )}
                    {(device.photo1 || device.photo2) && (
                      <div className="py-2 flex gap-3">
                        {device.photo1 && (
                          <Image
                            src={device.photo1}
                            alt="Photo 1"
                            width={96}
                            height={96}
                            className="w-24 h-24 object-cover rounded border"
                          />
                        )}
                        {device.photo2 && (
                          <Image
                            src={device.photo2}
                            alt="Photo 2"
                            width={96}
                            height={96}
                            className="w-24 h-24 object-cover rounded border"
                          />
                        )}
                      </div>
                    )}
                  </AdminEditableSection>
                );
              })}
            </div>
          )
        )}

        {/* Section : Historique */}
        {activeTab === "history" && (
          <AdminDeclHistory
            createdAt={decl.createdAt}
            updatedAt={decl.updatedAt}
            ip={decl.ip}
            auditLogs={auditLogs}
          />
        )}
      </div>

      {/* Dialogs */}

      <UserAttachmentDialog
        open={showUserAttachment}
        onOpenChange={setShowUserAttachment}
        declaration={decl}
        onSuccess={(updatedDecl) => {
          setDecl(updatedDecl);
          setNotesValue(updatedDecl.notes || "");
          setShowUserAttachment(false);
        }}
      />

      <AdminCancelDialog
        open={showCancelConfirm}
        onOpenChange={setShowCancelConfirm}
        declNumber={decl.number}
        declExptRais={decl.exptRais}
        recipientEmail={decl.user?.email || decl.exptEmail || ""}
        transitioning={transitioning}
        onConfirm={(reason, body) =>
          handleStatusTransition("CANCELLED", { cancelReason: reason, cancelEmailBody: body })
        }
      />

      <Dialog open={showValidateConfirm} onOpenChange={setShowValidateConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Valider la déclaration</DialogTitle>
            <DialogDescription>
              Confirmez-vous la validation de cette déclaration ? Elle sera
              marquée comme validée. Aucun email ne sera envoyé pour l'instant.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowValidateConfirm(false)}
              disabled={transitioning}
            >
              Annuler
            </Button>
            <Button
              onClick={() => handleStatusTransition("VALIDATED")}
              disabled={transitioning}
              className="bg-[#18753C] hover:bg-[#18753C]/90 text-white"
            >
              {transitioning ? "Validation..." : "Valider"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* GéoDAE sync manager (shared component) */}
      <GeodaeSyncManager
        open={showGeodaeSyncManager}
        onOpenChange={setShowGeodaeSyncManager}
        decl={decl}
        onDone={async (allSucceeded) => {
          if (allSucceeded !== false) setNeedsResync(false);
          await reloadDeclAndLogs();
        }}
        onDiffsFound={(hasDiffs) => { if (hasDiffs) setNeedsResync(true); }}
        onAllDeleted={async () => {
          reloadDeclAndLogs();
        }}
        api={{
          fetchDeviceData: (deviceId) => apiFetch(`/api/admin/geodae/fetch/${deviceId}`),
          sendDevices: (deviceIds) => apiFetch(`/api/admin/geodae/send/${id}`, {
            method: "POST",
            body: JSON.stringify(deviceIds ? { deviceIds } : {}),
          }),
          deleteDevice: (deviceId) => apiFetch(`/api/admin/geodae/delete-device/${deviceId}`, { method: "POST" }),
        }}
      />

      {/* GéoDAE detail dialog */}
      <Dialog
        open={!!geodaeDetailDevice}
        onOpenChange={(open) => { if (!open) setGeodaeDetailDevice(null); }}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-[#000091]" />
              Fiche GéoDAE — {geodaeDetailDevice?.nom || "DAE"}
              {geodaeDetailDevice?.geodaeGid && (
                <span className="text-xs font-normal text-[#929292]">#{geodaeDetailDevice.geodaeGid}</span>
              )}
            </DialogTitle>
            <DialogDescription>
              Données actuellement enregistrées dans la base nationale GéoDAE
            </DialogDescription>
          </DialogHeader>

          {geodaeDetailLoading && (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-[#000091]" />
            </div>
          )}

          {geodaeDetailError && (
            <div className="alert-danger rounded text-sm">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-[#E1000F] shrink-0" />
                <span>{geodaeDetailError}</span>
              </div>
            </div>
          )}

          {geodaeDetailData && geodaeDetailDevice && decl && (
            <GeodaeDetailContent
              geodaeData={geodaeDetailData}
              device={geodaeDetailDevice}
              decl={decl}
              onResync={() => {
                setGeodaeDetailDevice(null);
                setShowGeodaeSyncManager(true);
              }}
              onDelete={() => handleDeleteDevice(geodaeDetailDevice.id)}
              deleting={deletingDevice}
            />
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setGeodaeDetailDevice(null)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* (Legacy GéoDAE dialogs replaced by GeodaeSyncManager + GeodaeDetailContent above) */}
    </div>
  );
}

