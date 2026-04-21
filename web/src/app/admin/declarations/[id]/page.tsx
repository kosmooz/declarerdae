"use client";

import { useEffect, useState, useCallback } from "react";
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

interface DaeDevice {
  id: string;
  position: number;
  nom: string | null;
  acc: string | null;
  accLib: string | null;
  accEtg: string | null;
  accComplt: string | null;
  daeMobile: string | null;
  dispJ: string | null;
  dispH: string | null;
  dispComplt: string | null;
  etatFonct: string | null;
  fabRais: string | null;
  modele: string | null;
  numSerie: string | null;
  typeDAE: string | null;
  dateInstal: string | null;
  dermnt: string | null;
  dispSurv: string | null;
  lcPed: string | null;
  dtprLcped: string | null;
  dtprLcad: string | null;
  photo1: string | null;
  photo2: string | null;
  geodaeGid: number | null;
  geodaeStatus: string | null;
  geodaeLastSync: string | null;
  geodaeLastError: string | null;
}

interface Declaration {
  id: string;
  number: number;
  exptNom: string | null;
  exptPrenom: string | null;
  exptRais: string | null;
  exptSiren: string | null;
  exptSiret: string | null;
  exptTel1: string | null;
  exptTel1Prefix: string | null;
  exptEmail: string | null;
  exptNum: string | null;
  exptVoie: string | null;
  exptCp: string | null;
  exptCom: string | null;
  nomEtablissement: string | null;
  typeERP: string | null;
  categorieERP: string | null;
  adrNum: string | null;
  adrVoie: string | null;
  codePostal: string | null;
  ville: string | null;
  latCoor1: number | null;
  longCoor1: number | null;
  tel1: string | null;
  tel1Prefix: string | null;
  tel2: string | null;
  tel2Prefix: string | null;
  siteEmail: string | null;
  ip: string | null;
  status: string;
  step: number;
  notes: string | null;
  userId: string | null;
  user: { id: string; email: string; firstName: string | null; lastName: string | null } | null;
  createdAt: string;
  updatedAt: string;
  daeDevices: DaeDevice[];
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

const CATEGORIE_ERP_LABELS: Record<string, string> = {
  "cat-1": "Catégorie 1 (+ de 1 500 personnes)",
  "cat-2": "Catégorie 2 (701 à 1 500)",
  "cat-3": "Catégorie 3 (301 à 700)",
  "cat-4": "Catégorie 4 (≤ 300)",
  "cat-5": "Catégorie 5 (seuils réglementaires)",
  "non-applicable": "Non applicable",
};

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

const FIELD_LABELS: Record<string, string> = {
  exptRais: "Raison sociale", exptSiren: "SIREN", exptSiret: "SIRET",
  exptNom: "Nom contact", exptPrenom: "Prenom contact",
  exptEmail: "Email exploitant", exptTel1: "Tel. exploitant", exptTel1Prefix: "Indicatif exploitant",
  exptNum: "N. voie exploitant", exptVoie: "Voie exploitant", exptCp: "CP exploitant", exptCom: "Commune exploitant",
  nomEtablissement: "Etablissement", typeERP: "Type ERP", categorieERP: "Categorie ERP",
  adrNum: "N. voie site", adrVoie: "Adresse site", adrComplement: "Complement adresse",
  codePostal: "Code postal", codeInsee: "Code INSEE", ville: "Ville",
  latCoor1: "Latitude", longCoor1: "Longitude",
  tel1: "Tel. site", tel1Prefix: "Indicatif site", tel2: "Tel. 2 site", tel2Prefix: "Indicatif tel. 2",
  siteEmail: "Email site", notes: "Notes", status: "Statut",
  nom: "Nom DAE", acc: "Environnement", accLib: "Acces libre",
  accEtg: "Etage", accComplt: "Complement acces",
  daeMobile: "DAE itinerant", dispJ: "Jours dispo.", dispH: "Heures dispo.",
  etatFonct: "Etat fonctionnement", fabRais: "Fabricant", modele: "Modele",
  numSerie: "N. serie", typeDAE: "Type DAE",
  dateInstal: "Date installation", dermnt: "Dern. maintenance",
  photo1: "Photo 1", photo2: "Photo 2",
};

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  CREATED: { label: "Creation", color: "bg-[#18753C]" },
  FIELD_UPDATE: { label: "Modification", color: "bg-[#000091]" },
  STATUS_CHANGE: { label: "Changement de statut", color: "bg-amber-500" },
  DEVICE_UPDATE: { label: "Modification DAE", color: "bg-[#000091]" },
  USER_ATTACHED: { label: "Utilisateur rattache", color: "bg-purple-500" },
  GEODAE_SYNC: { label: "Envoi GéoDAE", color: "bg-sky-500" },
};

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
  const [cancelReason, setCancelReason] = useState("");
  const [cancelEmailBody, setCancelEmailBody] = useState("");

  // Active detail section
  const [activeTab, setActiveTab] = useState("exploitant");
  const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null);

  // Audit logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // GéoDAE sync
  const [showGeodaeDialog, setShowGeodaeDialog] = useState(false);
  const [sendingGeodae, setSendingGeodae] = useState(false);
  const [geodaeResults, setGeodaeResults] = useState<Array<{
    deviceId: string;
    deviceName: string;
    success: boolean;
    gid?: number;
    updated?: boolean;
    error?: string;
  }> | null>(null);
  const [showGeodaeConfirm, setShowGeodaeConfirm] = useState(false);
  const [showGeodaeDeleteConfirm, setShowGeodaeDeleteConfirm] = useState(false);
  const [deletingGeodae, setDeletingGeodae] = useState(false);
  const [retryingDeviceId, setRetryingDeviceId] = useState<string | null>(null);

  /* ─── Load ─────────────────────────────────────────────────────────── */

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [declRes, logsRes] = await Promise.all([
        apiFetch(`/api/admin/declarations/${id}`),
        apiFetch(`/api/admin/declarations/${id}/audit-logs`),
      ]);
      if (declRes.ok) {
        const data = await declRes.json();
        setDecl(data);
        setNotesValue(data.notes || "");
      } else {
        toast.error("Déclaration introuvable");
        router.push("/admin/declarations");
      }
      if (logsRes.ok) {
        setAuditLogs(await logsRes.json());
      }
      setLoading(false);
    }
    load();
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

  const GEODAE_PREFIXES = new Set(["fr","re","gp","gf","mq","yt","nc","pf","pm","wf","bl","mf"]);
  const checkAdminPhone = (phone: string | null | undefined) => {
    if (!phone?.trim()) return false;
    const cleaned = phone.replace(/[\s\-\.()]/g, "").replace(/^0/, "");
    return /^\d{9}$/.test(cleaned);
  };

  const handleSectionSave = useCallback(
    async (section: string) => {
      if (!decl) return;

      // Validate phone fields before saving
      if (section === "exploitant") {
        if (!editData.exptTel1?.trim()) {
          toast.error("Téléphone exploitant obligatoire");
          return;
        }
        if (!checkAdminPhone(editData.exptTel1)) {
          toast.error("Téléphone exploitant : 9 chiffres requis (hors indicatif)");
          return;
        }
        if (!editData.exptTel1Prefix || !GEODAE_PREFIXES.has(editData.exptTel1Prefix)) {
          toast.error("Indicatif exploitant : France ou DOM-TOM requis");
          return;
        }
      }
      if (section === "site") {
        if (!editData.tel1?.trim()) {
          toast.error("Téléphone du site obligatoire");
          return;
        }
        if (!checkAdminPhone(editData.tel1)) {
          toast.error("Téléphone du site : 9 chiffres requis (hors indicatif)");
          return;
        }
        if (!editData.tel1Prefix || !GEODAE_PREFIXES.has(editData.tel1Prefix)) {
          toast.error("Indicatif du site : France ou DOM-TOM requis");
          return;
        }
      }
      if (section.startsWith("device-")) {
        if (!editData.dermnt?.trim()) {
          toast.error("Date dernière maintenance obligatoire");
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

  /* ─── GéoDAE send ──────────────────────────────────────────────────── */

  const handleSendToGeodae = useCallback(async () => {
    if (!decl) return;
    setSendingGeodae(true);
    setGeodaeResults(null);
    setShowGeodaeDialog(true);

    try {
      const res = await apiFetch(`/api/admin/geodae/send/${id}`, {
        method: "POST",
        body: JSON.stringify({}),
      });
      const data = await res.json();

      if (Array.isArray(data)) {
        setGeodaeResults(data);
        const successes = data.filter((r: any) => r.success).length;
        const failures = data.filter((r: any) => !r.success).length;
        if (failures === 0) {
          toast.success(`${successes} DAE envoyé(s) vers GéoDAE`);
        } else {
          toast.error(`${failures} échec(s) sur ${data.length} DAE`);
        }
      } else {
        toast.error(data.message || "Erreur lors de l'envoi");
        setGeodaeResults([]);
      }
    } catch {
      toast.error("Erreur réseau");
      setGeodaeResults([]);
    }

    setSendingGeodae(false);

    // Reload declaration + audit logs
    const [declRes, logsRes] = await Promise.all([
      apiFetch(`/api/admin/declarations/${id}`),
      apiFetch(`/api/admin/declarations/${id}/audit-logs`),
    ]);
    if (declRes.ok) {
      const data = await declRes.json();
      setDecl(data);
      setNotesValue(data.notes || "");
    }
    if (logsRes.ok) setAuditLogs(await logsRes.json());
  }, [decl, id]);

  const handleRetryDevice = useCallback(async (deviceId: string) => {
    const res = await apiFetch(`/api/admin/geodae/retry/${deviceId}`, {
      method: "POST",
    });
    const data = await res.json();
    if (data.success) {
      toast.success(`DAE envoyé (GéoDAE #${data.gid})`);
    } else {
      toast.error(data.error || "Échec de l'envoi");
    }

    // Reload
    const [declRes, logsRes] = await Promise.all([
      apiFetch(`/api/admin/declarations/${id}`),
      apiFetch(`/api/admin/declarations/${id}/audit-logs`),
    ]);
    if (declRes.ok) {
      const d = await declRes.json();
      setDecl(d);
      setNotesValue(d.notes || "");
    }
    if (logsRes.ok) setAuditLogs(await logsRes.json());
  }, [id]);

  /* ─── GéoDAE delete ────────────────────────────────────────── */

  const handleDeleteFromGeodae = useCallback(async () => {
    if (!decl) return;
    setDeletingGeodae(true);
    setShowGeodaeDeleteConfirm(false);
    setShowGeodaeDialog(true);
    setGeodaeResults(null);

    try {
      const res = await apiFetch(`/api/admin/geodae/delete/${id}`, {
        method: "POST",
      });
      const data = await res.json();

      if (Array.isArray(data)) {
        setGeodaeResults(data);
        const successes = data.filter((r: any) => r.success).length;
        const failures = data.filter((r: any) => !r.success).length;
        if (failures === 0) {
          toast.success(`${successes} DAE supprimé(s) de GéoDAE`);
        } else {
          toast.error(`${failures} échec(s) de suppression`);
        }
      } else {
        toast.error(data.message || "Erreur lors de la suppression");
        setGeodaeResults([]);
      }
    } catch {
      toast.error("Erreur réseau");
      setGeodaeResults([]);
    }

    setDeletingGeodae(false);

    // Reload
    const [declRes, logsRes] = await Promise.all([
      apiFetch(`/api/admin/declarations/${id}`),
      apiFetch(`/api/admin/declarations/${id}/audit-logs`),
    ]);
    if (declRes.ok) {
      const data = await declRes.json();
      setDecl(data);
      setNotesValue(data.notes || "");
    }
    if (logsRes.ok) setAuditLogs(await logsRes.json());
  }, [decl, id]);

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

  // GéoDAE sync status
  const geodaeSent = decl.daeDevices.filter(d => d.geodaeStatus === "SENT" || d.geodaeStatus === "UPDATED");
  const geodaeFailed = decl.daeDevices.filter(d => d.geodaeStatus === "FAILED");
  const geodaeDeleted = decl.daeDevices.filter(d => d.geodaeStatus === "DELETED");
  const geodaeNotSent = decl.daeDevices.filter(d => !d.geodaeStatus || d.geodaeStatus === "NOT_SENT");
  const geodaeAllSynced = geodaeSent.length === decl.daeDevices.length && decl.daeDevices.length > 0;
  const geodaeNoneSynced = geodaeSent.length === 0 && geodaeFailed.length === 0 && geodaeDeleted.length === 0;
  const geodaeIsUpdate = geodaeSent.length > 0;
  const geodaeLastSync = geodaeSent.reduce((latest: string | null, d) => {
    if (!d.geodaeLastSync) return latest;
    return !latest || new Date(d.geodaeLastSync) > new Date(latest) ? d.geodaeLastSync : latest;
  }, null);

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
              <a
                href={`/admin/users/${decl.user.id}`}
                className="text-xs text-[#000091] hover:underline ml-1"
              >
                Compte : {decl.user.email}
              </a>
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
              {decl.typeERP === "erp" && decl.categorieERP && (
                <span> · {CATEGORIE_ERP_LABELS[decl.categorieERP] || decl.categorieERP}</span>
              )}
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
                      {device.typeDAE && (
                        <span className="text-[10px] text-[#929292]">
                          {device.typeDAE === "automatique" ? "DEA" : "DSA"}
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
      {decl.status === "VALIDATED" && (
        <div className={`rounded-lg border mb-6 overflow-hidden ${
          geodaeAllSynced
            ? "border-green-200"
            : geodaeFailed.length > 0
              ? "border-red-200"
              : geodaeNoneSynced
                ? "border-amber-200"
                : "border-[#000091]/20"
        }`}>
          {/* Colored top bar */}
          <div className={`h-1 ${
            geodaeAllSynced
              ? "bg-[#18753C]"
              : geodaeFailed.length > 0
                ? "bg-red-500"
                : geodaeNoneSynced
                  ? "bg-amber-400"
                  : "bg-[#000091]"
          }`} />

          <div className="bg-white p-5">
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
                geodaeAllSynced
                  ? "bg-green-100"
                  : geodaeFailed.length > 0
                    ? "bg-red-100"
                    : geodaeNoneSynced
                      ? "bg-amber-100"
                      : "bg-[#F5F5FE]"
              }`}>
                {geodaeAllSynced ? (
                  <CheckCircle className="h-5 w-5 text-[#18753C]" />
                ) : geodaeFailed.length > 0 ? (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                ) : (
                  <Globe className="h-5 w-5 text-[#000091]" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-bold text-[#3A3A3A]">
                    Base nationale GéoDAE
                  </h3>
                  {geodaeAllSynced && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-[#18753C]">
                      <CheckCircle className="h-2.5 w-2.5" />
                      Synchronisé
                    </span>
                  )}
                  {geodaeFailed.length > 0 && geodaeSent.length === 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-700">
                      Échec
                    </span>
                  )}
                  {!geodaeAllSynced && geodaeSent.length > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F5F5FE] text-[#000091]">
                      Partiellement synchronisé
                    </span>
                  )}
                  {geodaeNoneSynced && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700">
                      Non envoyé
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#929292] mb-3">
                  {geodaeAllSynced
                    ? `${geodaeSent.length} DAE enregistré${geodaeSent.length > 1 ? "s" : ""} dans la base nationale`
                    : geodaeNoneSynced
                      ? `${decl.daeDevices.length} DAE en attente d'envoi vers la base nationale`
                      : `${geodaeSent.length}/${decl.daeDevices.length} DAE synchronisé${geodaeSent.length > 1 ? "s" : ""}${geodaeFailed.length > 0 ? `, ${geodaeFailed.length} en échec` : ""}${geodaeNotSent.length > 0 ? `, ${geodaeNotSent.length} non envoyé${geodaeNotSent.length > 1 ? "s" : ""}` : ""}`
                  }
                  {geodaeLastSync && (
                    <> · Dernière sync : {new Date(geodaeLastSync).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</>
                  )}
                </p>

                {/* Device badges with individual retry */}
                <div className="flex flex-wrap gap-1.5">
                  {decl.daeDevices.map((device, i) => {
                    const status = device.geodaeStatus;
                    const isSent = status === "SENT" || status === "UPDATED";
                    const isFailed = status === "FAILED";
                    const isDeleted = status === "DELETED";
                    const hasGid = !!device.geodaeGid;
                    const isRetrying = retryingDeviceId === device.id;
                    const geodaeUrl = hasGid
                      ? `https://geodae.atlasante.fr/form/8777a504-6c3e-4abe-8100-60bb58767faa/${device.geodaeGid}`
                      : null;
                    return (
                      <div key={device.id} className="inline-flex items-center gap-0.5">
                        {geodaeUrl && (isSent || isDeleted) ? (
                          <a
                            href={geodaeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium border transition-colors ${
                              isDeleted
                                ? "bg-[#F6F6F6] border-[#E5E5E5] text-[#929292] line-through hover:bg-[#E5E5E5]"
                                : "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                            }`}
                          >
                            {isDeleted ? <Trash2 className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
                            {device.nom || `DAE ${i + 1}`}
                            <span className="text-[10px] opacity-75">#{device.geodaeGid}</span>
                            {isDeleted && <span className="text-[10px] opacity-75">Supprimé</span>}
                          </a>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium border ${
                              isFailed
                                ? "bg-red-50 border-red-200 text-red-700"
                                : "bg-[#F6F6F6] border-[#E5E5E5] text-[#929292]"
                            }`}
                          >
                            {isFailed ? <XCircle className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                            {device.nom || `DAE ${i + 1}`}
                            {isFailed && <span className="text-[10px] opacity-75">Échec</span>}
                          </span>
                        )}
                        {/* Individual retry/send button */}
                        {!isDeleted && (
                          <button
                            type="button"
                            onClick={async () => {
                              setRetryingDeviceId(device.id);
                              await handleRetryDevice(device.id);
                              setRetryingDeviceId(null);
                            }}
                            disabled={sendingGeodae || isRetrying}
                            title={isSent ? "Resynchroniser ce DAE" : isFailed ? "Réessayer l'envoi" : "Envoyer ce DAE"}
                            className="p-1 rounded text-[#929292] hover:text-[#000091] hover:bg-[#F5F5FE] transition-colors disabled:opacity-40"
                          >
                            {isRetrying ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <RotateCw className="h-3.5 w-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action button */}
              <div className="shrink-0 flex flex-col items-end gap-2">
                <Button
                  size="sm"
                  onClick={() => setShowGeodaeConfirm(true)}
                  disabled={sendingGeodae}
                  className={geodaeIsUpdate && geodaeFailed.length === 0
                    ? "bg-white text-[#000091] border border-[#000091] hover:bg-[#F5F5FE] shadow-none"
                    : "bg-gradient-to-r from-[#000091] via-[#1a0f91] to-[#4a00e0] hover:from-[#000078] hover:via-[#15087a] hover:to-[#3d00c0] text-white shadow-md hover:shadow-lg transition-all duration-200"
                  }
                >
                  {sendingGeodae ? (
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  ) : geodaeIsUpdate ? (
                    <RotateCw className="h-3.5 w-3.5 mr-1.5" />
                  ) : (
                    <Upload className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  {sendingGeodae
                    ? "Envoi en cours..."
                    : geodaeFailed.length > 0 && geodaeSent.length === 0
                      ? "Réessayer l'envoi"
                      : geodaeIsUpdate
                        ? "Mettre à jour"
                        : "Envoyer vers GéoDAE"
                  }
                </Button>
                {geodaeSent.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowGeodaeDeleteConfirm(true)}
                    disabled={deletingGeodae || sendingGeodae}
                    className="inline-flex items-center gap-1 text-[11px] text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="h-3 w-3" />
                    Retirer de GéoDAE
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
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
                categorieERP: decl.categorieERP,
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
            {decl.typeERP === "erp" && (
              <InfoRow
                label="Catégorie ERP"
                value={
                  CATEGORIE_ERP_LABELS[decl.categorieERP || ""] ||
                  decl.categorieERP
                }
              />
            )}
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
                      label="Type DAE"
                      value={
                        device.typeDAE === "automatique"
                          ? "DEA (automatique)"
                          : device.typeDAE === "semi-automatique"
                            ? "DSA (semi-auto)"
                            : device.typeDAE
                      }
                    />
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
                          <img
                            src={device.photo1}
                            alt="Photo 1"
                            className="w-24 h-24 object-cover rounded border"
                          />
                        )}
                        {device.photo2 && (
                          <img
                            src={device.photo2}
                            alt="Photo 2"
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
          <div className="space-y-4">
            {/* Meta header */}
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-[#929292] bg-[#F6F6F6] rounded-lg px-4 py-3 border border-[#E5E5E5]">
              <span>Creee le <strong className="text-[#3A3A3A]">{new Date(decl.createdAt).toLocaleString("fr-FR")}</strong></span>
              <span>Mise a jour le <strong className="text-[#3A3A3A]">{new Date(decl.updatedAt).toLocaleString("fr-FR")}</strong></span>
              {decl.ip && <span>IP <strong className="text-[#3A3A3A]">{decl.ip}</strong></span>}
            </div>

            {/* Timeline */}
            {auditLogs.length === 0 ? (
              <div className="text-center py-10 text-sm text-[#929292]">
                Aucune modification enregistree pour cette declaration.
              </div>
            ) : (
              <div className="relative">
                {/* Vertical line */}
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
                        {/* Dot */}
                        <div className={`relative z-10 mt-1 w-[10px] h-[10px] rounded-full shrink-0 ring-2 ring-white ${actionInfo.color}`} />

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-medium text-[#3A3A3A]">
                              {actionInfo.label}
                            </span>
                            {log.deviceName && (
                              <span className="text-[10px] bg-[#F6F6F6] border border-[#E5E5E5] rounded px-1.5 py-0.5 text-[#929292]">
                                {log.deviceName}
                              </span>
                            )}
                            <span className="text-[10px] text-[#929292] ml-auto shrink-0">
                              {new Date(log.createdAt).toLocaleString("fr-FR")} - {adminName}
                            </span>
                          </div>

                          {/* Field change detail */}
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

      <Dialog open={showCancelConfirm} onOpenChange={(open) => {
        setShowCancelConfirm(open);
        if (!open) { setCancelReason(""); setCancelEmailBody(""); }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Annuler la déclaration #{decl.number}</DialogTitle>
            <DialogDescription>
              Sélectionnez un motif d'annulation. Un email sera envoyé au déclarant.
            </DialogDescription>
          </DialogHeader>

          {/* Predefined reasons */}
          <div className="space-y-2 my-2">
            <label className="text-sm font-medium text-[#3A3A3A]">Motif d'annulation</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CANCEL_REASONS.map((r) => (
                <button
                  key={r.label}
                  type="button"
                  onClick={() => {
                    setCancelReason(r.reason);
                    setCancelEmailBody(r.body(decl.number, decl.exptRais || ""));
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

          {/* Email preview */}
          {cancelEmailBody && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[#3A3A3A]">Email de notification</label>
                <span className="text-xs text-[#929292]">
                  Destinataire : {decl.user?.email || decl.exptEmail || "—"}
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
              onClick={() => setShowCancelConfirm(false)}
              disabled={transitioning}
            >
              Retour
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                handleStatusTransition("CANCELLED", {
                  cancelReason: cancelReason || "Annulée sans motif",
                  cancelEmailBody,
                })
              }
              disabled={transitioning || !cancelEmailBody}
            >
              {transitioning ? "Annulation..." : "Annuler et envoyer l'email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      {/* GéoDAE delete confirmation dialog */}
      <Dialog open={showGeodaeDeleteConfirm} onOpenChange={setShowGeodaeDeleteConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full flex items-center justify-center bg-red-100">
                <Trash2 className="h-4.5 w-4.5 text-red-600" />
              </div>
              Retirer de GéoDAE
            </DialogTitle>
            <DialogDescription className="pt-1">
              Vous allez marquer {geodaeSent.length} DAE comme « Supprimé définitivement » dans la base nationale GéoDAE.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg bg-red-50 border border-red-200 p-4 my-1 space-y-2.5">
            <p className="text-xs font-semibold text-red-800 uppercase tracking-wide">Cette action va :</p>
            <div className="space-y-1.5">
              <div className="flex items-start gap-2">
                <Trash2 className="h-3.5 w-3.5 text-red-600 mt-0.5 shrink-0" />
                <p className="text-sm text-red-800">
                  Passer l'état de <span className="font-semibold">{geodaeSent.length}</span> fiche{geodaeSent.length > 1 ? "s" : ""} à <span className="font-semibold">« Supprimé définitivement »</span> dans GéoDAE
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Globe className="h-3.5 w-3.5 text-red-400 mt-0.5 shrink-0" />
                <p className="text-sm text-red-600/80">
                  Les DAE ne seront plus visibles sur la carte nationale (la fiche reste dans GéoDAE avec le statut supprimé)
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-800">
              DAE concernés : {geodaeSent.map(d => `${d.nom || "Sans nom"} (#${d.geodaeGid})`).join(", ")}
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setShowGeodaeDeleteConfirm(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={handleDeleteFromGeodae}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Confirmer le retrait
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* GéoDAE confirmation dialog */}
      <Dialog open={showGeodaeConfirm} onOpenChange={setShowGeodaeConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                geodaeIsUpdate ? "bg-[#F5F5FE]" : "bg-amber-100"
              }`}>
                {geodaeIsUpdate ? (
                  <RotateCw className="h-4.5 w-4.5 text-[#000091]" />
                ) : (
                  <Upload className="h-4.5 w-4.5 text-amber-600" />
                )}
              </div>
              {geodaeIsUpdate ? "Mettre à jour vers GéoDAE" : "Envoyer vers GéoDAE"}
            </DialogTitle>
            <DialogDescription className="pt-1">
              {geodaeIsUpdate
                ? "Vous allez synchroniser les modifications vers la base nationale des défibrillateurs."
                : "Vous allez enregistrer les DAE de cette déclaration dans la base nationale des défibrillateurs (GéoDAE)."}
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg bg-[#F6F6F6] border border-[#E5E5E5] p-4 my-1 space-y-2.5">
            <p className="text-xs font-semibold text-[#3A3A3A] uppercase tracking-wide">Cette action va :</p>
            <div className="space-y-1.5">
              {geodaeNotSent.length > 0 && (
                <div className="flex items-start gap-2">
                  <Upload className="h-3.5 w-3.5 text-[#000091] mt-0.5 shrink-0" />
                  <p className="text-sm text-[#3A3A3A]">
                    Créer <span className="font-semibold">{geodaeNotSent.length}</span> nouvelle{geodaeNotSent.length > 1 ? "s" : ""} fiche{geodaeNotSent.length > 1 ? "s" : ""} dans GéoDAE
                  </p>
                </div>
              )}
              {geodaeSent.length > 0 && (
                <div className="flex items-start gap-2">
                  <RotateCw className="h-3.5 w-3.5 text-[#000091] mt-0.5 shrink-0" />
                  <p className="text-sm text-[#3A3A3A]">
                    Mettre à jour <span className="font-semibold">{geodaeSent.length}</span> fiche{geodaeSent.length > 1 ? "s" : ""} existante{geodaeSent.length > 1 ? "s" : ""}
                  </p>
                </div>
              )}
              {geodaeFailed.length > 0 && (
                <div className="flex items-start gap-2">
                  <RefreshCw className="h-3.5 w-3.5 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-[#3A3A3A]">
                    Réessayer <span className="font-semibold">{geodaeFailed.length}</span> envoi{geodaeFailed.length > 1 ? "s" : ""} en échec
                  </p>
                </div>
              )}
              <div className="flex items-start gap-2">
                <Globe className="h-3.5 w-3.5 text-[#929292] mt-0.5 shrink-0" />
                <p className="text-sm text-[#929292]">
                  Les DAE seront visibles sur la carte nationale
                </p>
              </div>
            </div>
          </div>

          {!geodaeIsUpdate && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-800">
                Premier envoi : les DAE seront créés dans la base nationale. Vérifiez que les informations sont correctes avant de continuer.
              </p>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setShowGeodaeConfirm(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={() => {
                setShowGeodaeConfirm(false);
                handleSendToGeodae();
              }}
              className="bg-gradient-to-r from-[#000091] via-[#1a0f91] to-[#4a00e0] hover:from-[#000078] hover:via-[#15087a] hover:to-[#3d00c0] text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              {geodaeIsUpdate ? (
                <RotateCw className="h-3.5 w-3.5 mr-1.5" />
              ) : (
                <Upload className="h-3.5 w-3.5 mr-1.5" />
              )}
              {geodaeIsUpdate ? "Confirmer la mise à jour" : "Confirmer l'envoi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* GéoDAE sync result dialog */}
      <Dialog open={showGeodaeDialog} onOpenChange={setShowGeodaeDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-[#000091]" />
              Envoi vers GéoDAE
            </DialogTitle>
            <DialogDescription>
              {sendingGeodae
                ? "Envoi en cours vers la base nationale GéoDAE..."
                : geodaeResults
                  ? `${geodaeResults.filter((r) => r.success).length} succès, ${geodaeResults.filter((r) => !r.success).length} échec(s)`
                  : "Résultats de l'envoi"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 my-2">
            {sendingGeodae && !geodaeResults && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-8 w-8 animate-spin text-[#000091]" />
              </div>
            )}

            {geodaeResults?.map((result) => (
              <div
                key={result.deviceId}
                className={`rounded-lg border ${
                  result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                }`}
              >
                <div className="flex items-center gap-3 p-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#3A3A3A]">
                      {result.deviceName}
                    </p>
                    {result.success && (
                      <p className="text-xs text-green-700">
                        {result.updated ? "Mis à jour" : "Envoyé"} — GéoDAE #{result.gid}
                      </p>
                    )}
                  </div>
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleRetryDevice(result.deviceId)}
                      className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-red-700 hover:bg-red-100 transition-colors shrink-0"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Réessayer
                    </button>
                  )}
                </div>
                {!result.success && result.error && (
                  <div className="px-3 pb-3">
                    <p className="text-xs text-red-600 bg-red-100 rounded p-2 break-words whitespace-pre-wrap max-h-32 overflow-y-auto">
                      {result.error}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowGeodaeDialog(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
