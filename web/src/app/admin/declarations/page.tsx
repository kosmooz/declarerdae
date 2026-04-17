"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Search, ClipboardList, Clock, CheckCircle, ShieldCheck } from "lucide-react";

interface DeclarationItem {
  id: string;
  number: number;
  exptNom: string | null;
  exptPrenom: string | null;
  exptEmail: string | null;
  exptRais: string | null;
  ville: string | null;
  ip: string | null;
  step: number;
  status: string;
  deviceCount: number;
  createdAt: string;
}

interface Stats {
  total: number;
  draft: number;
  complete: number;
  validated: number;
  cancelled: number;
  totalDevices: number;
}

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

const STEP_COLORS: Record<number, string> = {
  1: "bg-[#F6F6F6] text-[#3A3A3A]",
  2: "bg-[#000091]/10 text-[#000091]",
  3: "bg-amber-100 text-amber-700",
  4: "bg-green-100 text-green-700",
};

const QUICK_FILTERS = [
  { key: "tous", label: "Toutes", statuses: "" },
  { key: "brouillons", label: "Brouillons", statuses: "DRAFT" },
  { key: "completes", label: "Complètes", statuses: "COMPLETE" },
  { key: "validees", label: "Validées", statuses: "VALIDATED" },
  { key: "annulees", label: "Annulées", statuses: "CANCELLED" },
];

export default function AdminDeclarationsPage() {
  const router = useRouter();
  const [declarations, setDeclarations] = useState<DeclarationItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [quickFilter, setQuickFilter] = useState("tous");
  const [statusFilter, setStatusFilter] = useState("");
  const [stepFilter, setStepFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    const res = await apiFetch("/api/admin/declarations/stats");
    if (res.ok) {
      setStats(await res.json());
    }
  }, []);

  const fetchDeclarations = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: "20",
    });
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    if (stepFilter) params.set("step", stepFilter);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);

    const res = await apiFetch(`/api/admin/declarations?${params}`);
    if (res.ok) {
      const data = await res.json();
      setDeclarations(data.declarations);
      setTotal(data.total);
    }
    setLoading(false);
  }, [page, search, statusFilter, stepFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchDeclarations();
  }, [fetchDeclarations]);

  const totalPages = Math.ceil(total / 20);

  const formatExploitant = (d: DeclarationItem) => {
    const name = [d.exptPrenom, d.exptNom].filter(Boolean).join(" ") || "---";
    if (d.exptRais) {
      return (
        <>
          <span className="font-medium">{name}</span>
          <span className="text-[#929292] text-xs block">{d.exptRais}</span>
        </>
      );
    }
    return <span className="font-medium">{name}</span>;
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1200px]">
      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#F6F6F6] flex items-center justify-center">
                  <ClipboardList className="h-5 w-5 text-[#3A3A3A]" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-[#929292]">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#F6F6F6] flex items-center justify-center">
                  <Clock className="h-5 w-5 text-[#929292]" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.draft}</p>
                  <p className="text-xs text-[#929292]">Brouillons</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.complete}</p>
                  <p className="text-xs text-[#929292]">Complètes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.validated}</p>
                  <p className="text-xs text-[#929292]">Validées</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                  <ClipboardList className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.cancelled}</p>
                  <p className="text-xs text-[#929292]">Annulées</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {QUICK_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => { setQuickFilter(f.key); setStatusFilter(f.statuses); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              quickFilter === f.key
                ? "bg-[#000091] text-white"
                : "bg-[#F6F6F6] text-[#3A3A3A] hover:bg-[#E5E5E5]"
            }`}
          >
            {f.label}
            {stats && f.key === "tous" && (
              <span className="ml-1.5 text-xs opacity-70">({stats.total})</span>
            )}
            {stats && f.key === "brouillons" && (
              <span className="ml-1.5 text-xs opacity-70">({stats.draft})</span>
            )}
            {stats && f.key === "completes" && (
              <span className="ml-1.5 text-xs opacity-70">({stats.complete})</span>
            )}
            {stats && f.key === "validees" && (
              <span className="ml-1.5 text-xs opacity-70">({stats.validated})</span>
            )}
            {stats && f.key === "annulees" && (
              <span className="ml-1.5 text-xs opacity-70">({stats.cancelled})</span>
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#929292]" />
                <Input
                  placeholder="Rechercher par nom, email, organisme, ville..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="pl-9"
                />
              </div>
              <select
                value={stepFilter}
                onChange={(e) => { setStepFilter(e.target.value); setPage(1); }}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Toutes les étapes</option>
                <option value="1">Étape 1 — Exploitant</option>
                <option value="2">Étape 2 — Site</option>
                <option value="3">Étape 3 — DAE</option>
                <option value="4">Étape 4 — Complète</option>
              </select>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#929292] whitespace-nowrap">Du</span>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                  className="w-auto"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#929292] whitespace-nowrap">Au</span>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                  className="w-auto"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#000091]" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-2 font-medium text-[#929292]">N°</th>
                      <th className="pb-2 font-medium text-[#929292]">Date</th>
                      <th className="pb-2 font-medium text-[#929292]">Exploitant</th>
                      <th className="pb-2 font-medium text-[#929292]">Email</th>
                      <th className="pb-2 font-medium text-[#929292]">Ville</th>
                      <th className="pb-2 font-medium text-[#929292]">DAE</th>
                      <th className="pb-2 font-medium text-[#929292]">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {declarations.map((d) => (
                      <tr
                        key={d.id}
                        className="border-b last:border-0 hover:bg-[#F6F6F6] cursor-pointer transition-colors"
                        onClick={() => router.push(`/admin/declarations/${d.id}`)}
                      >
                        <td className="py-2.5 text-xs font-medium text-[#000091]">
                          #{d.number}
                        </td>
                        <td className="py-2.5 text-xs text-[#929292]">
                          {new Date(d.createdAt).toLocaleDateString("fr-FR")}
                        </td>
                        <td className="py-2.5">{formatExploitant(d)}</td>
                        <td className="py-2.5 text-[#3A3A3A]">{d.exptEmail || "---"}</td>
                        <td className="py-2.5 text-[#3A3A3A]">{d.ville || "---"}</td>
                        <td className="py-2.5 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#000091]/10 text-[#000091]">
                            {d.deviceCount}
                          </span>
                        </td>
                        <td className="py-2.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[d.status] || ""}`}>
                            {STATUS_LABELS[d.status] || d.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {declarations.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-[#929292]">
                          Aucune déclaration trouvée
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-[#929292]">{total} déclaration(s)</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                      Précédent
                    </Button>
                    <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                      Suivant
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
