"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useDevMode } from "@/lib/useDevMode";
import Link from "next/link";
import {
  Users,
  UserCheck,
  Shield,
  TrendingUp,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  ClipboardList,
  BookOpen,
  Settings,
  ArrowRight,
} from "lucide-react";

interface DashboardData {
  totalUsers: number;
  newUsersMonth: number;
  newUsersWeek: number;
}

interface StatsData {
  totalUsers: number;
  verifiedUsers: number;
  adminUsers: number;
  deletedUsers: number;
}

interface DeclStats {
  total: number;
  draft: number;
  complete: number;
  validated: number;
  cancelled: number;
  totalDevices: number;
}

function KpiItem({
  icon: Icon,
  label,
  value,
  color,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: string;
  sub?: string;
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-[#929292] leading-none">{label}</p>
        <div className="flex items-baseline gap-1.5 mt-0.5">
          <span className="text-lg font-bold text-[#3A3A3A] leading-none">{value}</span>
          {sub && <span className="text-[11px] text-[#929292]">{sub}</span>}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [declStats, setDeclStats] = useState<DeclStats | null>(null);
  const dev = useDevMode();

  useEffect(() => {
    const ctrl = new AbortController();
    const sig = ctrl.signal;
    Promise.all([
      apiFetch("/api/admin/dashboard", { signal: sig }).then((r) => (r.ok ? r.json() : null)),
      apiFetch("/api/admin/stats", { signal: sig }).then((r) => (r.ok ? r.json() : null)),
      apiFetch("/api/admin/declarations/stats", { signal: sig }).then((r) => (r.ok ? r.json() : null)),
    ]).then(([d, s, ds]) => {
      setDashboard(d);
      setStats(s);
      setDeclStats(ds);
    }).catch((err: unknown) => { if ((err as Error).name !== "AbortError") console.error("[admin-dashboard]", err); });
    return () => ctrl.abort();
  }, []);

  const loading = !stats || !dashboard;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1200px]">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#3A3A3A]">Tableau de bord</h1>
        <p className="text-sm text-[#929292] mt-0.5">Vue d&apos;ensemble</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${dev.borderSpinner}`} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Users card */}
          <div className="bg-white rounded-lg border border-[#E5E5E5] p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#000091]" />
              <h2 className="text-xs font-semibold text-[#929292] uppercase tracking-wider">Utilisateurs</h2>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1">
              <KpiItem icon={Users} label="Total" value={stats.totalUsers} color="bg-[#000091]/8 text-[#000091]" />
              <KpiItem icon={UserCheck} label="Vérifiés" value={stats.verifiedUsers} color="bg-[#18753C]/10 text-[#18753C]" />
              <KpiItem icon={Shield} label="Admins" value={stats.adminUsers} color="bg-[#E1000F]/10 text-[#E1000F]" />
              <KpiItem icon={TrendingUp} label="Nouveaux (7j)" value={dashboard.newUsersWeek} color="bg-[#000091]/8 text-[#000091]" sub={`${dashboard.newUsersMonth} ce mois`} />
            </div>
          </div>

          {/* Declarations card */}
          <div className="bg-white rounded-lg border border-[#E5E5E5] p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#18753C]" />
              <h2 className="text-xs font-semibold text-[#929292] uppercase tracking-wider">Déclarations</h2>
            </div>
            {declStats ? (
              <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                <KpiItem icon={FileText} label="Total" value={declStats.total} color="bg-[#000091]/8 text-[#000091]" sub={`${declStats.totalDevices} DAE`} />
                <KpiItem icon={Clock} label="Brouillons" value={declStats.draft} color="bg-[#F6F6F6] text-[#929292]" />
                <KpiItem icon={CheckCircle} label="Validées" value={declStats.validated} color="bg-[#18753C]/10 text-[#18753C]" />
                <KpiItem icon={XCircle} label="Annulées" value={declStats.cancelled} color="bg-[#E1000F]/10 text-[#E1000F]" />
              </div>
            ) : (
              <p className="text-sm text-[#929292]">Chargement…</p>
            )}
          </div>

          {/* Quick access */}
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { href: "/admin/declarations", icon: ClipboardList, label: "Déclarations", color: "text-[#000091]" },
              { href: "/admin/users", icon: Users, label: "Utilisateurs", color: "text-[#000091]" },
              { href: "/admin/blog", icon: BookOpen, label: "Blog", color: "text-[#000091]" },
              { href: "/admin/reglages", icon: Settings, label: "Réglages", color: "text-[#000091]" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-3 bg-white rounded-lg border border-[#E5E5E5] px-4 py-3 hover:border-[#000091]/30 hover:shadow-sm transition-all"
              >
                <item.icon className={`h-4 w-4 ${item.color} shrink-0`} />
                <span className="text-sm font-medium text-[#3A3A3A]">{item.label}</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#929292] ml-auto opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
