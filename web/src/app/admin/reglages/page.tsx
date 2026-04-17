"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useDevMode } from "@/lib/useDevMode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, Send, Settings, Building2, Mail, AlertTriangle, Globe, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const dev = useDevMode();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [testingGeodae, setTestingGeodae] = useState(false);
  const [geodaeTestResult, setGeodaeTestResult] = useState<{ success: boolean; error?: string } | null>(null);
  const [tab, setTab] = useState<"general" | "company" | "email" | "maintenance" | "geodae">("general");
  const [form, setForm] = useState<Record<string, any>>({});

  useEffect(() => {
    apiFetch("/api/admin/shop-settings").then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        setForm(data);
      }
      setLoading(false);
    });
  }, []);

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
        </CardContent>
      </Card>
    </div>
  );
}
