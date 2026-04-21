"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { User, KeyRound, Pencil, ClipboardList, Shield, Mail } from "lucide-react";

const tabs = [
  { href: "/dashboard/mes-declarations", label: "Mes déclarations", icon: ClipboardList },
  { href: "/dashboard/profile", label: "Profil", icon: User },
  { href: "/dashboard/edit-profile", label: "Modifier", icon: Pencil },
  { href: "/dashboard/change-password", label: "Mot de passe", icon: KeyRound },
  { href: "/dashboard/mes-donnees", label: "Mes données", icon: Shield },
];

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(() => {
    if (typeof window === "undefined") return 0;
    const until = parseInt(localStorage.getItem("resend_verify_until") || "0", 10);
    return Math.max(0, Math.ceil((until - Date.now()) / 1000));
  });

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  if (loading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user.emailVerified) {
    return (
      <div className="bg-slate-50 min-h-[60vh]">
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-lg border border-[#E5E5E5] p-8">
            <div className="w-16 h-16 bg-[#000091] rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-xl font-bold text-[#3A3A3A] mb-2 font-heading">
              Plus qu'une étape !
            </h2>
            <p className="text-[#666] text-sm mb-2">
              Un email de vérification a été envoyé à :
            </p>
            <p className="text-[#000091] font-semibold text-sm mb-4">{user.email}</p>
            <p className="text-[#666] text-sm mb-6">
              Confirmez votre adresse email pour accéder à vos déclarations et recevoir votre attestation de conformité.
            </p>
            <Button
              onClick={async () => {
                if (resendCooldown > 0) return;
                setResending(true);
                try {
                  await fetch("/api/auth/resend-verification", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: user.email }),
                  });
                  toast.success("Email de vérification renvoyé !");
                  localStorage.setItem("resend_verify_until", String(Date.now() + 60_000));
                  setResendCooldown(60);
                } catch {
                  toast.error("Erreur lors du renvoi.");
                } finally {
                  setResending(false);
                }
              }}
              disabled={resending || resendCooldown > 0}
              className="bg-[#000091] hover:bg-[#000091]/90 text-white w-full"
            >
              {resending
                ? "Envoi en cours..."
                : resendCooldown > 0
                  ? `Renvoyer dans ${resendCooldown}s`
                  : "Renvoyer l'email de vérification"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Sub-navigation full-width, aligned left */}
      <div className="bg-white border-b border-[#E5E5E5]">
        <div className="container">
          <nav className="flex gap-1 overflow-x-auto" aria-label="Navigation dashboard">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = pathname === tab.href;
              return (
                <button
                  key={tab.href}
                  onClick={() => router.push(tab.href)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    active
                      ? "border-[#000091] text-[#000091]"
                      : "border-transparent text-[#666] hover:text-[#000091] hover:border-[#000091]/30"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Page content */}
      <div className="bg-slate-50 min-h-[60vh]">
        <div className="max-w-5xl mx-auto px-4 py-6">
          {children}
        </div>
      </div>
    </>
  );
}
