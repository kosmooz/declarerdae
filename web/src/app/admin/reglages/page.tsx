"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useDevMode } from "@/lib/useDevMode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, Send, Settings, Building2, Mail, AlertTriangle, Globe, CheckCircle, XCircle, Shield, ExternalLink, CircleAlert, Trash2 } from "lucide-react";
import Link from "next/link";

interface ComplianceStats {
  dpo: { name: string | null; email: string | null; address: string | null; configured: boolean };
  company: { configured: boolean };
  smtp: { configured: boolean };
  consents: { total: number; declarations: number };
  users: { total: number; deleted: number };
  retention: { staleDrafts: number; oldAuthLogs: number };
  declarations: { total: number };
}

interface CheckItem {
  id: string;
  article: string;
  label: string;
  description: string;
  status: "ok" | "warning" | "error";
  detail: string;
  category: string;
}

function buildChecklist(stats: ComplianceStats | null, form: Record<string, any>): CheckItem[] {
  const s = stats;
  return [
    // -- Gouvernance
    {
      id: "dpo",
      article: "Art. 37-39",
      label: "Delegue a la protection des donnees (DPO)",
      description: "Un DPO doit etre designe et ses coordonnees communiquees a la CNIL et aux personnes concernees.",
      status: s?.dpo.configured ? "ok" : "error",
      detail: s?.dpo.configured
        ? `${s.dpo.name} — ${s.dpo.email}`
        : "Non renseigne. Completez les champs DPO ci-dessous.",
      category: "Gouvernance",
    },
    {
      id: "registre",
      article: "Art. 30",
      label: "Registre des traitements",
      description: "Le responsable de traitement tient un registre ecrit de l'ensemble des traitements.",
      status: "ok",
      detail: "Registre disponible dans cette page (7 traitements documentes). Exportable en CSV.",
      category: "Gouvernance",
    },
    {
      id: "societe",
      article: "Art. 13",
      label: "Identification du responsable de traitement",
      description: "L'identite et les coordonnees du responsable doivent figurer dans la politique de confidentialite.",
      status: s?.company.configured ? "ok" : "warning",
      detail: s?.company.configured
        ? "Raison sociale et adresse renseignees dans l'onglet Societe."
        : "Completez les informations societe dans l'onglet Societe.",
      category: "Gouvernance",
    },
    // -- Information & consentement
    {
      id: "politique",
      article: "Art. 13-14",
      label: "Politique de confidentialite",
      description: "Information claire et accessible sur les traitements : finalites, base legale, destinataires, durees, droits.",
      status: "ok",
      detail: "Page /politique-de-confidentialite en ligne — 11 sections couvrant toutes les obligations d'information. DPO affiche dynamiquement.",
      category: "Information & Consentement",
    },
    {
      id: "bandeau-cookies",
      article: "Art. 7 + ePrivacy",
      label: "Bandeau de consentement cookies",
      description: "Consentement prealable requis avant tout depot de cookie non essentiel. Possibilite de refuser et de modifier son choix.",
      status: "ok",
      detail: "Bandeau custom actif — 2 categories (essentiels + cartographie). Boutons accepter/refuser/personnaliser. Lien \"Gerer mes cookies\" dans le footer.",
      category: "Information & Consentement",
    },
    {
      id: "blocage-cartes",
      article: "Art. 7",
      label: "Blocage effectif des services tiers sans consentement",
      description: "Les services tiers (Mapbox, CartoDB) ne doivent pas etre charges avant que l'utilisateur ait consenti.",
      status: "ok",
      detail: "MapConsentGate bloque le rendu des composants Leaflet/Mapbox/CartoDB. Aucune requete reseau sans consentement. Verification par event listener reactif.",
      category: "Information & Consentement",
    },
    {
      id: "consent-formulaires",
      article: "Art. 7",
      label: "Consentement trace dans les formulaires",
      description: "Preuve du consentement : case a cocher, horodatage, version du texte, IP, user-agent.",
      status: s ? (s.consents.total > 0 ? "ok" : "warning") : "warning",
      detail: s
        ? `${s.consents.total} consentement(s) enregistre(s) dont ${s.consents.declarations} pour les declarations. Chaque consentement est horodate avec IP et user-agent.`
        : "Systeme en place — en attente des premiers consentements.",
      category: "Information & Consentement",
    },
    {
      id: "fonts-selfhost",
      article: "Art. 44-49",
      label: "Polices auto-hebergees (pas de Google Fonts)",
      description: "Les polices sont servies localement pour eviter tout transfert de donnees vers Google (IP, user-agent).",
      status: "ok",
      detail: "Libre Franklin et Source Sans 3 en WOFF2 depuis /fonts/. Aucune requete vers fonts.googleapis.com ou fonts.gstatic.com.",
      category: "Information & Consentement",
    },
    // -- Droits des personnes
    {
      id: "droit-acces",
      article: "Art. 15",
      label: "Droit d'acces et de portabilite",
      description: "Les personnes peuvent obtenir une copie de toutes leurs donnees dans un format structure.",
      status: "ok",
      detail: "Endpoint GET /api/gdpr/export — exporte profil, adresses, declarations, consentements, logs en JSON. Page \"Mes donnees\" dans le dashboard utilisateur.",
      category: "Droits des personnes",
    },
    {
      id: "droit-effacement",
      article: "Art. 17",
      label: "Droit a l'effacement",
      description: "Les personnes peuvent demander la suppression de leur compte et l'anonymisation de leurs donnees.",
      status: "ok",
      detail: s
        ? `Endpoint DELETE /api/gdpr/delete-account — anonymise les PII, conserve les declarations (obligation legale). ${s.users.deleted} compte(s) supprime(s) a ce jour.`
        : "Endpoint DELETE /api/gdpr/delete-account en place. Page \"Mes donnees\" avec confirmation \"SUPPRIMER\".",
      category: "Droits des personnes",
    },
    {
      id: "droit-rectification",
      article: "Art. 16",
      label: "Droit de rectification",
      description: "Les personnes peuvent modifier leurs donnees personnelles.",
      status: "ok",
      detail: "Page \"Modifier\" dans le dashboard utilisateur — modification du profil (nom, email, telephone). L'admin peut modifier les declarations via les formulaires d'edition.",
      category: "Droits des personnes",
    },
    // -- Securite
    {
      id: "chiffrement",
      article: "Art. 32",
      label: "Chiffrement des communications",
      description: "Les echanges de donnees sont chiffres via HTTPS/TLS.",
      status: "ok",
      detail: "HTTPS/TLS en production. Mots de passe hashes en argon2id. Tokens de refresh hashes en SHA-256. Cookies httpOnly + secure + sameSite.",
      category: "Securite",
    },
    {
      id: "acces-controle",
      article: "Art. 32",
      label: "Controle d'acces",
      description: "Acces aux donnees restreint par authentification et par roles.",
      status: "ok",
      detail: "JWT (access 15 min + refresh 30 jours). RolesGuard admin. OptionalJwtGuard pour les routes publiques. Rate limiting (30 req/min).",
      category: "Securite",
    },
    {
      id: "audit-trail",
      article: "Art. 5(2)",
      label: "Tracabilite des modifications (audit trail)",
      description: "Chaque modification de donnees personnelles est journalisee avec avant/apres, admin, horodatage.",
      status: "ok",
      detail: "DeclarationAuditLog : action, fieldName, oldValue, newValue, adminId, deviceId. AuthLog : connexions, echecs, reinitialisation.",
      category: "Securite",
    },
    // -- Conservation
    {
      id: "retention",
      article: "Art. 5(1)(e)",
      label: "Politique de retention des donnees",
      description: "Les donnees ne sont conservees que le temps necessaire. Purge automatique des donnees expirees.",
      status: s ? (s.retention.staleDrafts === 0 && s.retention.oldAuthLogs === 0 ? "ok" : "warning") : "warning",
      detail: s
        ? `CRON hebdomadaire actif (dimanche 3h). ${s.retention.staleDrafts} brouillon(s) > 6 mois a purger. ${s.retention.oldAuthLogs} log(s) d'auth > 13 mois a purger.`
        : "CRON hebdomadaire programme. Purge brouillons > 6 mois, AuthLogs > 13 mois, tokens expires, anonymisation audit > 3 ans.",
      category: "Conservation",
    },
    // -- Transferts
    {
      id: "transferts",
      article: "Art. 44-49",
      label: "Transferts hors UE",
      description: "Les transferts de donnees hors UE doivent reposer sur des garanties appropriees ou le consentement.",
      status: "ok",
      detail: "Mapbox et CartoDB (USA) : soumis a consentement cookies, bloques par defaut. API BAN et GeoDAE : France. Yousign : France.",
      category: "Conservation",
    },
  ];
}

function CheckItemCard({ item }: { item: CheckItem }) {
  const StatusIcon = item.status === "ok" ? CheckCircle : item.status === "warning" ? CircleAlert : XCircle;
  const statusColor = item.status === "ok" ? "text-[#18753C]" : item.status === "warning" ? "text-[#B45309]" : "text-[#E1000F]";
  const bgColor = item.status === "ok" ? "bg-[#F0FDF4]" : item.status === "warning" ? "bg-[#FFFBEB]" : "bg-[#FEF2F2]";
  const borderColor = item.status === "ok" ? "border-[#BBF7D0]" : item.status === "warning" ? "border-[#FDE68A]" : "border-[#FECACA]";

  return (
    <div className={`rounded border ${borderColor} ${bgColor} p-3`}>
      <div className="flex items-start gap-2.5">
        <StatusIcon className={`w-4 h-4 ${statusColor} mt-0.5 shrink-0`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-[#161616]">{item.label}</span>
            <span className="text-[10px] font-mono bg-white/70 border border-black/10 rounded px-1.5 py-0.5 text-[#666] shrink-0">
              {item.article}
            </span>
          </div>
          <p className="text-xs text-[#666] mt-0.5">{item.description}</p>
          <p className={`text-xs mt-1.5 font-medium ${statusColor}`}>{item.detail}</p>
        </div>
      </div>
    </div>
  );
}
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const dev = useDevMode();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [testingGeodae, setTestingGeodae] = useState(false);
  const [geodaeTestResult, setGeodaeTestResult] = useState<{ success: boolean; error?: string } | null>(null);
  const [tab, setTab] = useState<"general" | "company" | "email" | "maintenance" | "geodae" | "rgpd">("general");
  const [form, setForm] = useState<Record<string, any>>({});
  const [complianceStats, setComplianceStats] = useState<ComplianceStats | null>(null);
  const [runningRetention, setRunningRetention] = useState(false);

  useEffect(() => {
    const ctrl = new AbortController();
    apiFetch("/api/admin/shop-settings", { signal: ctrl.signal }).then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        setForm(data);
      }
      if (!ctrl.signal.aborted) setLoading(false);
    }).catch((err: unknown) => { if ((err as Error).name !== "AbortError") console.error("[shop-settings]", err); });
    return () => ctrl.abort();
  }, []);

  useEffect(() => {
    if (tab !== "rgpd") return;
    const ctrl = new AbortController();
    apiFetch("/api/gdpr/compliance-stats", { signal: ctrl.signal }).then(async (res) => {
      if (res.ok) setComplianceStats(await res.json());
    }).catch((err: unknown) => { if ((err as Error).name !== "AbortError") console.error("[compliance-stats]", err); });
    return () => ctrl.abort();
  }, [tab]);

  const handleSave = async () => {
    setSubmitting(true);
    try {
      // Strip read-only / non-DTO fields before sending
      const { id, deleted, createdAt, updatedAt, ...payload } = form;
      // images comes as objects from API, extract URLs only
      if (payload.images && Array.isArray(payload.images)) {
        payload.images = payload.images.map((img: any) =>
          typeof img === "string" ? img : img.url,
        );
      }
      const res = await apiFetch("/api/admin/shop-settings", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        setForm(data);
        toast.success("Réglages mis à jour");
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Erreur lors de la sauvegarde");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleTestSmtp = async () => {
    setTestingSmtp(true);
    try {
      const res = await apiFetch("/api/admin/shop-settings/test-smtp", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast.success("Email de test envoyé !");
      } else {
        toast.error(data.error || "Échec de l'envoi");
      }
    } finally {
      setTestingSmtp(false);
    }
  };

  const handleTestGeodae = async () => {
    setTestingGeodae(true);
    setGeodaeTestResult(null);
    try {
      // Save credentials first
      await apiFetch("/api/admin/shop-settings", {
        method: "PATCH",
        body: JSON.stringify({
          geodaeUsername: form.geodaeUsername,
          geodaePassword: form.geodaePassword,
          geodaeEnabled: form.geodaeEnabled,
          geodaeTestMode: form.geodaeTestMode,
          geodaeMntSiren: form.geodaeMntSiren,
          geodaeMntRais: form.geodaeMntRais,
        }),
      });
      const res = await apiFetch("/api/admin/geodae/test-connection", { method: "POST" });
      const data = await res.json();
      setGeodaeTestResult(data);
      if (data.success) {
        toast.success("Connexion GéoDAE réussie !");
      } else {
        toast.error(data.error || "Échec de connexion");
      }
    } catch {
      setGeodaeTestResult({ success: false, error: "Erreur réseau" });
      toast.error("Erreur réseau");
    } finally {
      setTestingGeodae(false);
    }
  };

  const set = (key: string, value: any) => setForm({ ...form, [key]: value });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${dev.borderSpinner}`} />
      </div>
    );
  }

  const tabs = [
    { id: "general" as const, label: "Général", icon: Settings },
    { id: "company" as const, label: "Société", icon: Building2 },
    { id: "email" as const, label: "Email", icon: Mail },
    { id: "maintenance" as const, label: "Maintenance", icon: AlertTriangle },
    { id: "geodae" as const, label: "GéoDAE", icon: Globe },
    { id: "rgpd" as const, label: "RGPD / DPO", icon: Shield },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#3A3A3A]">Réglages</h1>
          <p className="text-[#929292] text-sm mt-1">Configuration de l&apos;application</p>
        </div>
        <Button onClick={handleSave} disabled={submitting} className="gap-2">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Enregistrer
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                tab === t.id
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-[#929292] hover:text-[#3A3A3A] hover:bg-[#F6F6F6]"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          );
        })}
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          {tab === "general" && (
            <>
              <div className="space-y-2">
                <Label>Nom du site</Label>
                <Input value={form.name || ""} onChange={(e) => set("name", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Slogan</Label>
                <Input value={form.slogan || ""} onChange={(e) => set("slogan", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={form.description || ""} onChange={(e) => set("description", e.target.value)} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Adresse</Label>
                <Input value={form.address || ""} onChange={(e) => set("address", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Fuseau horaire</Label>
                <Input value={form.timezone || ""} onChange={(e) => set("timezone", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email admin (notifications)</Label>
                <Input type="email" value={form.adminEmail || ""} onChange={(e) => set("adminEmail", e.target.value)} />
              </div>

              <div className="border-t border-[#E5E5E5] pt-4 mt-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#929292] mb-3">Authentification</h3>
                <div className="space-y-3">
                  <div>
                    <label className="flex items-center gap-2.5 py-1 text-sm font-medium cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={form.skipEmailVerification || false}
                        onChange={(e) => set("skipEmailVerification", e.target.checked)}
                        className="cursor-pointer"
                      />
                      Ignorer la vérification email
                    </label>
                    <p className="text-xs text-[#929292] ml-6">
                      Si activé, les utilisateurs peuvent se connecter sans avoir vérifié leur adresse email.
                    </p>
                  </div>
                  <div>
                    <label className="flex items-center gap-2.5 py-1 text-sm font-medium cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={form.skip2FA || false}
                        onChange={(e) => set("skip2FA", e.target.checked)}
                        className="cursor-pointer"
                      />
                      Ignorer la double authentification (2FA)
                    </label>
                    <p className="text-xs text-[#929292] ml-6">
                      Si activé, les utilisateurs ne reçoivent pas de code de vérification par email lors de la connexion.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {tab === "company" && (
            <>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#929292]">Informations légales</h3>
              <div className="space-y-2">
                <Label>Raison sociale</Label>
                <Input value={form.companyName || ""} onChange={(e) => set("companyName", e.target.value)} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>SIRET</Label>
                  <Input value={form.siret || ""} onChange={(e) => set("siret", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>N° TVA</Label>
                  <Input value={form.tvaNumber || ""} onChange={(e) => set("tvaNumber", e.target.value)} />
                </div>
              </div>

              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#929292] pt-2">Adresse</h3>
              <div className="space-y-2">
                <Input value={form.companyStreet || ""} onChange={(e) => set("companyStreet", e.target.value)} placeholder="Rue" />
                <Input value={form.companyStreet2 || ""} onChange={(e) => set("companyStreet2", e.target.value)} placeholder="Complément" />
                <div className="grid grid-cols-2 gap-4">
                  <Input value={form.companyPostalCode || ""} onChange={(e) => set("companyPostalCode", e.target.value)} placeholder="Code postal" />
                  <Input value={form.companyCity || ""} onChange={(e) => set("companyCity", e.target.value)} placeholder="Ville" />
                </div>
              </div>

              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#929292] pt-2">Représentant légal</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prénom</Label>
                  <Input value={form.legalFirstName || ""} onChange={(e) => set("legalFirstName", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Nom</Label>
                  <Input value={form.legalLastName || ""} onChange={(e) => set("legalLastName", e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email légal</Label>
                <Input type="email" value={form.legalEmail || ""} onChange={(e) => set("legalEmail", e.target.value)} />
              </div>
            </>
          )}

          {tab === "email" && (
            <>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#929292]">Serveur SMTP</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Serveur SMTP</Label>
                  <Input value={form.smtpHost || ""} onChange={(e) => set("smtpHost", e.target.value)} placeholder="smtp.example.com" />
                </div>
                <div className="space-y-2">
                  <Label>Port SMTP</Label>
                  <Input type="number" value={form.smtpPort || ""} onChange={(e) => set("smtpPort", parseInt(e.target.value) || null)} placeholder="465" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Utilisateur SMTP</Label>
                  <Input value={form.smtpUser || ""} onChange={(e) => set("smtpUser", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Mot de passe SMTP</Label>
                  <Input type="password" value={form.smtpPass || ""} onChange={(e) => set("smtpPass", e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email expéditeur (From)</Label>
                <Input type="email" value={form.smtpFrom || ""} onChange={(e) => set("smtpFrom", e.target.value)} />
              </div>
              <div className="pt-2">
                <Button variant="outline" onClick={handleTestSmtp} disabled={testingSmtp} className="gap-2">
                  {testingSmtp ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Envoyer un email de test
                </Button>
              </div>
            </>
          )}

          {tab === "maintenance" && (
            <>
              <label className="flex items-center gap-2.5 py-1 text-sm font-medium cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.maintenanceEnabled || false}
                  onChange={(e) => set("maintenanceEnabled", e.target.checked)}
                  className="cursor-pointer"
                />
                Mode maintenance activé
              </label>
              <div className="space-y-2">
                <Label>Mode</Label>
                <select
                  value={form.maintenanceMode || "FULL_BLOCK"}
                  onChange={(e) => set("maintenanceMode", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="FULL_BLOCK">Blocage complet</option>
                  <option value="ORDERS_BLOCKED">Commandes bloquées</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Titre maintenance</Label>
                <Input value={form.maintenanceTitle || ""} onChange={(e) => set("maintenanceTitle", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Description maintenance</Label>
                <Textarea value={form.maintenanceDescription || ""} onChange={(e) => set("maintenanceDescription", e.target.value)} rows={3} />
              </div>
            </>
          )}

          {tab === "geodae" && (
            <>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#929292]">Intégration GéoDAE</h3>
              <p className="text-sm text-[#929292]">
                Configurez la connexion à l&apos;API GéoDAE pour envoyer les déclarations automatiquement.
              </p>
              <label className="flex items-center gap-2.5 py-1 text-sm font-medium cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.geodaeEnabled || false}
                  onChange={(e) => set("geodaeEnabled", e.target.checked)}
                  className="cursor-pointer"
                />
                Activer l&apos;intégration GéoDAE
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Identifiant GéoDAE</Label>
                  <Input
                    value={form.geodaeUsername || ""}
                    onChange={(e) => set("geodaeUsername", e.target.value)}
                    placeholder="sthomas"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mot de passe GéoDAE</Label>
                  <Input
                    type="password"
                    value={form.geodaePassword || ""}
                    onChange={(e) => set("geodaePassword", e.target.value)}
                  />
                </div>
              </div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#929292] pt-2">Compte mainteneur</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>SIREN mainteneur</Label>
                  <Input
                    value={form.geodaeMntSiren || ""}
                    onChange={(e) => set("geodaeMntSiren", e.target.value)}
                    placeholder="908037971"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Raison sociale mainteneur</Label>
                  <Input
                    value={form.geodaeMntRais || ""}
                    onChange={(e) => set("geodaeMntRais", e.target.value)}
                    placeholder="STAR MAINTENANCE"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2.5 py-1 text-sm font-medium cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.geodaeTestMode ?? true}
                  onChange={(e) => set("geodaeTestMode", e.target.checked)}
                  className="cursor-pointer"
                />
                Mode test (ajoute le préfixe « test » aux noms des DAE)
              </label>
              <div className="flex items-center gap-3 pt-2">
                <Button variant="outline" onClick={handleTestGeodae} disabled={testingGeodae} className="gap-2">
                  {testingGeodae ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
                  Tester la connexion
                </Button>
                {geodaeTestResult && (
                  <span className={`flex items-center gap-1.5 text-sm font-medium ${geodaeTestResult.success ? "text-[#18753C]" : "text-red-600"}`}>
                    {geodaeTestResult.success ? (
                      <><CheckCircle className="h-4 w-4" /> Connexion réussie</>
                    ) : (
                      <><XCircle className="h-4 w-4" /> {geodaeTestResult.error}</>
                    )}
                  </span>
                )}
              </div>
            </>
          )}

          {tab === "rgpd" && (
            <>
              {/* Score global */}
              {(() => {
                const checks = buildChecklist(complianceStats, form);
                const ok = checks.filter((c) => c.status === "ok").length;
                const total = checks.length;
                const allOk = ok === total;
                return (
                  <div className={`rounded-lg border-2 p-4 flex items-center justify-between ${allOk ? "border-[#18753C] bg-[#F0FDF4]" : "border-[#B45309] bg-[#FFFBEB]"}`}>
                    <div className="flex items-center gap-3">
                      {allOk
                        ? <CheckCircle className="w-6 h-6 text-[#18753C]" />
                        : <CircleAlert className="w-6 h-6 text-[#B45309]" />}
                      <div>
                        <p className="text-sm font-bold text-[#161616]">
                          {allOk ? "Conformite RGPD complete" : "Points a verifier"}
                        </p>
                        <p className="text-xs text-[#666]">
                          {ok}/{total} regles conformes
                        </p>
                      </div>
                    </div>
                    <div className={`text-2xl font-bold ${allOk ? "text-[#18753C]" : "text-[#B45309]"}`}>
                      {Math.round((ok / total) * 100)}%
                    </div>
                  </div>
                );
              })()}

              {/* Checklist par categorie */}
              {(() => {
                const checks = buildChecklist(complianceStats, form);
                const categories = [...new Set(checks.map((c) => c.category))];
                return categories.map((cat) => (
                  <div key={cat} className="space-y-2 pt-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#929292]">{cat}</h3>
                    {checks
                      .filter((c) => c.category === cat)
                      .map((item) => (
                        <CheckItemCard key={item.id} item={item} />
                      ))}
                  </div>
                ));
              })()}

              {/* Actions rapides */}
              <div className="pt-4 border-t border-[#E5E5E5] space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#929292]">Actions</h3>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/admin/reglages/registre-traitements"
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#000091] border border-[#000091]/30 rounded hover:bg-[#F5F5FE] transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Registre des traitements
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      setRunningRetention(true);
                      try {
                        const res = await apiFetch("/api/gdpr/run-retention", { method: "POST" });
                        if (res.ok) {
                          const data = await res.json();
                          toast.success(`Retention executee : ${data.draftsDeleted} brouillons, ${data.authLogsDeleted} logs, ${data.tokensDeleted} tokens purges.`);
                          // Refresh stats
                          const statsRes = await apiFetch("/api/gdpr/compliance-stats");
                          if (statsRes.ok) setComplianceStats(await statsRes.json());
                        } else {
                          toast.error("Erreur lors de la retention.");
                        }
                      } finally {
                        setRunningRetention(false);
                      }
                    }}
                    disabled={runningRetention}
                    className="gap-2"
                  >
                    {runningRetention ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    Executer la retention maintenant
                  </Button>
                </div>
              </div>

              {/* DPO form */}
              <div className="pt-4 border-t border-[#E5E5E5] space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#929292]">Coordonnees du DPO</h3>
                <p className="text-xs text-[#929292]">
                  Affichees dans la politique de confidentialite ({" "}
                  <code className="bg-[#F6F6F6] px-1 py-0.5 rounded text-[10px]">/politique-de-confidentialite</code>
                  {" "}).
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nom du DPO</Label>
                    <Input
                      value={form.dpoName || ""}
                      onChange={(e) => set("dpoName", e.target.value)}
                      placeholder="Jean Dupont"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email du DPO</Label>
                    <Input
                      type="email"
                      value={form.dpoEmail || ""}
                      onChange={(e) => set("dpoEmail", e.target.value)}
                      placeholder="dpo@declarerdefibrillateur.fr"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Adresse postale du DPO</Label>
                  <Input
                    value={form.dpoAddress || ""}
                    onChange={(e) => set("dpoAddress", e.target.value)}
                    placeholder="10 rue de la Paix, 75002 Paris"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telephone du DPO</Label>
                  <Input
                    type="tel"
                    value={form.dpoPhone || ""}
                    onChange={(e) => set("dpoPhone", e.target.value)}
                    placeholder="01 23 45 67 89"
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
