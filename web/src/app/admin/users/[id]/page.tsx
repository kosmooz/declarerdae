"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useDevMode } from "@/lib/useDevMode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export default function AdminEditUserPage() {
  const params = useParams();
  const router = useRouter();
  const dev = useDevMode();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: "",
    role: "USER",
    emailVerified: false,
    firstName: "",
    lastName: "",
    phone: "",
    company: "",
    siret: "",
    tvaNumber: "",
  });

  useEffect(() => {
    apiFetch(`/api/admin/users/${params.id}`).then(async (res) => {
      if (res.ok) {
        const user = await res.json();
        setForm({
          email: user.email || "",
          role: user.role || "USER",
          emailVerified: user.emailVerified || false,
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          phone: user.phone || "",
          company: user.company || "",
          siret: user.siret || "",
          tvaNumber: user.tvaNumber || "",
        });
      }
      setLoading(false);
    });
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiFetch(`/api/admin/users/${params.id}`, {
        method: "PATCH",
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Utilisateur mis à jour");
      } else {
        const data = await res.json();
        toast.error(data.message || "Erreur");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${dev.borderSpinner}`} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-2xl">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-[#929292] hover:text-[#3A3A3A] mb-4 transition-colors duration-150"
      >
        <ArrowLeft className="h-4 w-4" /> Retour
      </button>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Modifier l&apos;utilisateur</CardTitle>
              <CardDescription>{form.email}</CardDescription>
            </div>
            <Badge variant={form.role === "ADMIN" ? "default" : "secondary"}>{form.role}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prénom</Label>
                <Input
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Nom</Label>
                <Input
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Rôle</Label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Téléphone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Société</Label>
                <Input
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>SIRET</Label>
                <Input
                  value={form.siret}
                  onChange={(e) => setForm({ ...form, siret: e.target.value })}
                />
              </div>
            </div>
            <label className="flex items-center gap-2.5 py-1 text-sm cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.emailVerified}
                onChange={(e) => setForm({ ...form, emailVerified: e.target.checked })}
                className="cursor-pointer"
              />
              Email vérifié
            </label>
            <Button type="submit" disabled={submitting} className="gap-2">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Enregistrer
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
