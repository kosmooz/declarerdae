"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  KeyRound,
  Shield,
  Eye,
  EyeOff,
  Lock,
  Info,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const requirements = [
    {
      label: "Au moins 12 caract\u00e8res",
      met: form.newPassword.length >= 12,
    },
    {
      label: "Au moins une lettre majuscule",
      met: /[A-Z]/.test(form.newPassword),
    },
    {
      label: "Au moins une lettre minuscule",
      met: /[a-z]/.test(form.newPassword),
    },
    {
      label: "Au moins un chiffre",
      met: /[0-9]/.test(form.newPassword),
    },
    {
      label: "Au moins un caract\u00e8re sp\u00e9cial (!@#$...)",
      met: /[^A-Za-z0-9]/.test(form.newPassword),
    },
  ];

  const passwordsMatch =
    form.confirmPassword.length > 0 &&
    form.newPassword === form.confirmPassword;
  const passwordsMismatch =
    form.confirmPassword.length > 0 &&
    form.newPassword !== form.confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiFetch("/api/auth/change-password", {
        method: "PATCH",
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Mot de passe modifi\u00e9");
        setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
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
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-[#000091]/10 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-[#000091]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#161616] font-heading">
              Changer le mot de passe
            </h1>
            <p className="text-sm text-[#666] mt-0.5">
              {"Mettez \u00e0 jour votre mot de passe pour s\u00e9curiser votre compte"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Section: Current password */}
        <section className="bg-white border border-[#E5E5E5] rounded-sm overflow-hidden mb-4">
          <div className="flex items-center gap-2 px-5 py-3 bg-[#F6F6F6] border-b border-[#E5E5E5]">
            <Lock className="w-4 h-4 text-[#000091]" />
            <span className="text-sm font-semibold text-[#161616]">
              Mot de passe actuel
            </span>
          </div>
          <div className="p-5">
            <div className="space-y-1.5 max-w-md">
              <Label className="text-sm font-medium text-[#3A3A3A]">
                Saisissez votre mot de passe actuel
              </Label>
              <div className="relative">
                <Input
                  type={showCurrent ? "text" : "password"}
                  value={form.currentPassword}
                  onChange={(e) =>
                    setForm({ ...form, currentPassword: e.target.value })
                  }
                  required
                  autoComplete="current-password"
                  className="rounded-sm border-[#E5E5E5] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#929292] hover:text-[#3A3A3A] transition-colors"
                  tabIndex={-1}
                >
                  {showCurrent ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Section: New password */}
        <section className="bg-white border border-[#E5E5E5] rounded-sm overflow-hidden mb-4">
          <div className="flex items-center gap-2 px-5 py-3 bg-[#F6F6F6] border-b border-[#E5E5E5]">
            <KeyRound className="w-4 h-4 text-[#000091]" />
            <span className="text-sm font-semibold text-[#161616]">
              Nouveau mot de passe
            </span>
          </div>
          <div className="p-5 space-y-4">
            {/* New password field */}
            <div className="space-y-1.5 max-w-md">
              <Label className="text-sm font-medium text-[#3A3A3A]">
                Nouveau mot de passe
              </Label>
              <div className="relative">
                <Input
                  type={showNew ? "text" : "password"}
                  value={form.newPassword}
                  onChange={(e) =>
                    setForm({ ...form, newPassword: e.target.value })
                  }
                  required
                  minLength={12}
                  autoComplete="new-password"
                  className="rounded-sm border-[#E5E5E5] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#929292] hover:text-[#3A3A3A] transition-colors"
                  tabIndex={-1}
                >
                  {showNew ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Requirements checklist */}
            {form.newPassword.length > 0 && (
              <div className="bg-[#F6F6F6] rounded-sm p-3 max-w-md">
                <p className="text-xs font-medium text-[#3A3A3A] mb-2">
                  Exigences du mot de passe :
                </p>
                <ul className="space-y-1">
                  {requirements.map((req) => (
                    <li
                      key={req.label}
                      className="flex items-center gap-2 text-xs"
                    >
                      {req.met ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#18753C] shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-[#929292] shrink-0" />
                      )}
                      <span
                        className={
                          req.met ? "text-[#18753C]" : "text-[#929292]"
                        }
                      >
                        {req.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Confirm password field */}
            <div className="space-y-1.5 max-w-md">
              <Label className="text-sm font-medium text-[#3A3A3A]">
                Confirmer le nouveau mot de passe
              </Label>
              <div className="relative">
                <Input
                  type={showConfirm ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm({ ...form, confirmPassword: e.target.value })
                  }
                  required
                  autoComplete="new-password"
                  className="rounded-sm border-[#E5E5E5] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#929292] hover:text-[#3A3A3A] transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {passwordsMismatch && (
                <p className="flex items-center gap-1.5 text-xs text-[#E1000F] mt-1">
                  <XCircle className="w-3 h-3 shrink-0" />
                  Les mots de passe ne correspondent pas
                </p>
              )}
              {passwordsMatch && (
                <p className="flex items-center gap-1.5 text-xs text-[#18753C] mt-1">
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                  Les mots de passe correspondent
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Security tips */}
        <div className="alert-info rounded-sm mb-6">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-[#000091] mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-[#000091] text-sm">
                {"Conseils de s\u00e9curit\u00e9"}
              </p>
              <ul className="text-xs text-[#3A3A3A] mt-1.5 space-y-1 list-disc list-inside">
                <li>
                  {"Utilisez un mot de passe unique pour chaque service"}
                </li>
                <li>
                  {"Évitez les informations personnelles (nom, date de naissance)"}
                </li>
                <li>
                  {"Privil\u00e9giez une phrase de passe longue et m\u00e9morable"}
                </li>
                <li>
                  {"Envisagez l\u2019utilisation d\u2019un gestionnaire de mots de passe"}
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => router.push("/dashboard/profile")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-sm text-sm font-medium text-[#3A3A3A] hover:bg-[#F6F6F6] transition-colors"
          >
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
              <KeyRound className="h-4 w-4" />
            )}
            Changer le mot de passe
          </button>
        </div>
      </form>
    </div>
  );
}
