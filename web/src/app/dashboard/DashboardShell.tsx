"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { User, KeyRound, Pencil, ClipboardList, Shield } from "lucide-react";

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

  if (loading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
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
