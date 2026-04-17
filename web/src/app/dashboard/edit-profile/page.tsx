"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Save,
  User,
  Mail,
  Building2,
  ArrowLeft,
  Info,
} from "lucide-react";
import { toast } from "sonner";

export default function EditProfilePage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: user?.email || "",
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
    company: user?.company || "",
    siret: user?.siret || "",
    tvaNumber: user?.tvaNumber || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiFetch("/api/auth/profile", {
        method: "PATCH",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(
          data.emailChanged
            ? "Profil mis \u00e0 jour. V\u00e9rifiez votre nouvelle adresse email."
            : "Profil mis \u00e0 jour"
        );
        await refreshUser();
      } else {
        toast.error(data.message || "Erreur");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#161616] font-heading">
          Modifier mon profil
        </h1>
        <p className="text-sm text-[#666] mt-1">
          {"Mettez \u00e0 jour vos informations personnelles et professionnelles"}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Section: Identite */}
        <section className="bg-white border border-[#E5E5E5] rounded-sm overflow-hidden mb-4">
          <div className="px-5 py-4 bg-[#F6F6F6] border-b border-[#E5E5E5]">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#000091]" />
              <h2 className="text-sm font-semibold text-[#161616]">
                {"Identit\u00e9"}
              </h2>
            </div>
            <p className="text-xs text-[#929292] mt-1 ml-6">
              {"Votre pr\u00e9nom et nom tels qu\u2019ils appara\u00eetront sur vos d\u00e9clarations"}
            </p>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-[#3A3A3A]">
                  {"Pr\u00e9nom"}
                </Label>
                <Input
                  value={form.firstName}
                  onChange={(e) =>
                    setForm({ ...form, firstName: e.target.value })
                  }
                  placeholder="ex : Jean"
                  className="rounded-sm border-[#E5E5E5]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-[#3A3A3A]">
                  Nom
                </Label>
                <Input
                  value={form.lastName}
                  onChange={(e) =>
                    setForm({ ...form, lastName: e.target.value })
                  }
                  placeholder="ex : Dupont"
                  className="rounded-sm border-[#E5E5E5]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section: Coordonnees */}
        <section className="bg-white border border-[#E5E5E5] rounded-sm overflow-hidden mb-4">
          <div className="px-5 py-4 bg-[#F6F6F6] border-b border-[#E5E5E5]">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#000091]" />
              <h2 className="text-sm font-semibold text-[#161616]">
                {"Coordonn\u00e9es"}
              </h2>
            </div>
            <p className="text-xs text-[#929292] mt-1 ml-6">
              {"Votre adresse email et t\u00e9l\u00e9phone de contact"}
            </p>
          </div>
          <div className="p-5 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-[#3A3A3A]">
                Adresse email
              </Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="nom@exemple.fr"
                className="rounded-sm border-[#E5E5E5]"
              />
              <div className="alert-info rounded-sm mt-2">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-[#000091] mt-0.5 shrink-0" />
                  <p className="text-xs text-[#3A3A3A]">
                    {"Si vous modifiez votre adresse email, un lien de v\u00e9rification sera envoy\u00e9 \u00e0 la nouvelle adresse. Votre email actuel restera actif jusqu\u2019\u00e0 la confirmation."}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-[#3A3A3A]">
                {"T\u00e9l\u00e9phone"}
              </Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="06 12 34 56 78"
                className="rounded-sm border-[#E5E5E5]"
              />
            </div>
          </div>
        </section>

        {/* Section: Entreprise */}
        <section className="bg-white border border-[#E5E5E5] rounded-sm overflow-hidden mb-4">
          <div className="px-5 py-4 bg-[#F6F6F6] border-b border-[#E5E5E5]">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#000091]" />
              <h2 className="text-sm font-semibold text-[#161616]">
                Informations entreprise
              </h2>
            </div>
            <p className="text-xs text-[#929292] mt-1 ml-6">
              {"Ces informations seront pr\u00e9-remplies dans vos futures d\u00e9clarations"}
            </p>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-[#3A3A3A]">
                  {"Soci\u00e9t\u00e9"}
                </Label>
                <Input
                  value={form.company}
                  onChange={(e) =>
                    setForm({ ...form, company: e.target.value })
                  }
                  placeholder={"ex : Ma Soci\u00e9t\u00e9 SAS"}
                  className="rounded-sm border-[#E5E5E5]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-[#3A3A3A]">
                  SIRET
                </Label>
                <Input
                  value={form.siret}
                  onChange={(e) =>
                    setForm({ ...form, siret: e.target.value })
                  }
                  placeholder="ex : 123 456 789 00010"
                  className="rounded-sm border-[#E5E5E5]"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-[#3A3A3A]">
                {"N\u00b0 TVA intracommunautaire"}
              </Label>
              <Input
                value={form.tvaNumber}
                onChange={(e) =>
                  setForm({ ...form, tvaNumber: e.target.value })
                }
                placeholder="ex : FR12345678901"
                className="rounded-sm border-[#E5E5E5]"
              />
            </div>
          </div>
        </section>

        {/* Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => router.push("/dashboard/profile")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-sm text-sm font-medium text-[#3A3A3A] hover:bg-[#F6F6F6] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Annuler
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm bg-[#000091] hover:bg-[#000091]/90 text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </div>
  );
}
