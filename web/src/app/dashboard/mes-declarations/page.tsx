"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  ClipboardList,
  Building2,
  MapPin,
  Cpu,
  ChevronRight,
  Plus,
  Globe,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import DaeListView from "./DaeListView";

interface DeclarationItem {
  id: string;
  exptRais: string | null;
  exptNom: string | null;
  exptPrenom: string | null;
  ville: string | null;
  step: number;
  status: string;
  deviceCount: number;
  geodaeSyncedCount: number;
  geodaeTotalCount: number;
  needsResync: boolean;
  createdAt: string;
  updatedAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Brouillon",
  COMPLETE: "Finaliser l'envoi",
  VALIDATED: "Validée",
  CANCELLED: "Annulée",
};

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  DRAFT: { bg: "bg-[#F6F6F6]", text: "text-[#666]", dot: "bg-[#929292]" },
  COMPLETE: { bg: "bg-[#FEF3C7]", text: "text-[#92400E]", dot: "bg-[#92400E]" },
  VALIDATED: { bg: "bg-[#D1FAE5]", text: "text-[#18753C]", dot: "bg-[#18753C]" },
  CANCELLED: { bg: "bg-[#FEE2E2]", text: "text-[#E1000F]", dot: "bg-[#E1000F]" },
};

const QUICK_FILTERS = [
  { key: "", label: "Toutes" },
  { key: "DRAFT", label: "Brouillon" },
  { key: "COMPLETE", label: "En attente d'envoi" },
  { key: "VALIDATED", label: "Validées" },
  { key: "CANCELLED", label: "Annulées" },
];

export default function MesDeclarationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const linkedId = searchParams.get("linked");
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const highlightRef = useRef<HTMLButtonElement>(null);
  const [declarations, setDeclarations] = useState<DeclarationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"declarations" | "dae">(() => {
    if (typeof window === "undefined") return "declarations";
    return (sessionStorage.getItem("decl-viewMode") as "declarations" | "dae") || "declarations";
  });
  const [statusFilter, setStatusFilter] = useState(() => {
    if (typeof window === "undefined") return "";
    return sessionStorage.getItem("decl-statusFilter") || "";
  });
  const [loading, setLoading] = useState(true);

  // Persist viewMode and statusFilter in sessionStorage
  useEffect(() => { sessionStorage.setItem("decl-viewMode", viewMode); }, [viewMode]);
  useEffect(() => { sessionStorage.setItem("decl-statusFilter", statusFilter); }, [statusFilter]);

  // Highlight linked draft after login redirect
  useEffect(() => {
    if (linkedId) {
      setHighlightId(linkedId);
      // Clean URL without triggering navigation
      window.history.replaceState(null, "", "/dashboard/mes-declarations");
      // Remove highlight after animation
      const timer = setTimeout(() => setHighlightId(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [linkedId]);

  // Scroll to highlighted card once loaded
  useEffect(() => {
    if (highlightId && !loading && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightId, loading]);

  const fetchDeclarations = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (statusFilter) params.set("status", statusFilter);

    const res = await apiFetch(`/api/declarations/my?${params}`, { signal });
    if (res.ok) {
      const data = await res.json();
      setDeclarations(data.declarations);
      setTotal(data.total);
    }
    if (!signal?.aborted) setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => {
    const ctrl = new AbortController();
    fetchDeclarations(ctrl.signal).catch((err: unknown) => { if ((err as Error).name !== "AbortError") console.error("[my-declarations]", err); });
    return () => ctrl.abort();
  }, [fetchDeclarations]);

  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#161616] font-heading">
            {viewMode === "declarations" ? "Mes déclarations" : "Mes défibrillateurs"}
          </h1>
          <p className="text-sm text-[#666] mt-1">
            {viewMode === "declarations"
              ? "Suivez l'avancement de vos déclarations de défibrillateurs"
              : "Vue individuelle de tous vos DAE et leur statut GéoDAE"}
          </p>
        </div>
        <a
          href="/declaration"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-sm bg-[#000091] hover:bg-[#000091]/90 text-white text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouvelle déclaration
        </a>
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-1 p-1 bg-[#F6F6F6] rounded-lg w-fit mb-5">
        <button
          onClick={() => { setViewMode("declarations"); setPage(1); }}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            viewMode === "declarations"
              ? "bg-white text-[#000091] shadow-sm"
              : "text-[#666] hover:text-[#3A3A3A]"
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          Déclarations
        </button>
        <button
          onClick={() => { setViewMode("dae"); setPage(1); }}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            viewMode === "dae"
              ? "bg-white text-[#000091] shadow-sm"
              : "text-[#666] hover:text-[#3A3A3A]"
          }`}
        >
          <Cpu className="w-4 h-4" />
          Défibrillateurs
        </button>
      </div>

      {/* Status filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        {QUICK_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => {
              setStatusFilter(f.key);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-sm text-sm font-medium transition-colors ${
              statusFilter === f.key
                ? "bg-[#000091] text-white"
                : "bg-[#F6F6F6] text-[#666] hover:bg-[#E5E5E5]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {viewMode === "dae" ? (
        <DaeListView statusFilter={statusFilter} />
      ) : loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-[#000091]" />
        </div>
      ) : declarations.length === 0 ? (
        <div className="text-center py-16 bg-[#F6F6F6] rounded-sm">
          <div className="w-14 h-14 rounded-full bg-[#000091]/10 flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-7 h-7 text-[#000091]" />
          </div>
          <h3 className="font-heading font-bold text-lg text-[#161616] mb-2">
            Aucune déclaration
          </h3>
          <p className="text-sm text-[#666] mb-6 max-w-sm mx-auto">
            Vous n'avez pas encore soumis de déclaration de défibrillateur.
            Commencez dès maintenant.
          </p>
          <a
            href="/declaration"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm bg-[#000091] hover:bg-[#000091]/90 text-white text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Déclarer un défibrillateur
          </a>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {declarations.map((d) => {
              const cfg = STATUS_CONFIG[d.status] || STATUS_CONFIG.DRAFT;
              return (
                <button
                  key={d.id}
                  ref={d.id === highlightId ? highlightRef : undefined}
                  onClick={() =>
                    router.push(`/dashboard/mes-declarations/${d.id}`)
                  }
                  className={`w-full text-left bg-white border rounded-sm p-4 hover:border-[#000091]/30 hover:shadow-sm transition-all group ${
                    d.id === highlightId
                      ? "border-[#000091] ring-2 ring-[#000091]/20 animate-pulse"
                      : "border-[#E5E5E5]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Title + status */}
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="font-semibold text-[#161616] text-sm truncate">
                          {d.exptRais || "Déclaration"}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}
                          />
                          {STATUS_LABELS[d.status] || d.status}
                        </span>
                      </div>

                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#666]">
                        <span>
                          {new Date(d.createdAt).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                        {d.ville && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {d.ville}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Cpu className="w-3 h-3" />
                          {d.deviceCount} DAE
                        </span>
                      </div>

                      {/* GéoDAE indicator */}
                      {d.status === "COMPLETE" && d.geodaeSyncedCount === 0 && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700">
                            <Globe className="w-3 h-3" />
                            Envoi GéoDAE requis
                          </span>
                        </div>
                      )}
                      {d.status === "COMPLETE" &&
                        d.geodaeSyncedCount > 0 &&
                        d.geodaeSyncedCount < d.geodaeTotalCount && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F5F5FE] text-[#000091]">
                            <Globe className="w-3 h-3" />
                            Partiellement synchronisé ({d.geodaeSyncedCount}/{d.geodaeTotalCount})
                          </span>
                        </div>
                      )}
                      {d.status === "VALIDATED" &&
                        d.geodaeSyncedCount === d.geodaeTotalCount &&
                        d.geodaeTotalCount > 0 &&
                        d.needsResync && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-800">
                            <AlertTriangle className="w-3 h-3" />
                            Mise à jour requise
                          </span>
                        </div>
                      )}
                      {d.status === "VALIDATED" &&
                        d.geodaeSyncedCount === d.geodaeTotalCount &&
                        d.geodaeTotalCount > 0 &&
                        !d.needsResync && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-[#18753C]">
                            <CheckCircle className="w-3 h-3" />
                            GéoDAE synchronisé
                          </span>
                        </div>
                      )}
                    </div>

                    <ChevronRight className="w-5 h-5 text-[#929292] group-hover:text-[#000091] transition-colors shrink-0 mt-1" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-[#929292]">
                {total} déclaration{total > 1 ? "s" : ""}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="text-[#000091] border-[#000091]"
                >
                  Précédent
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="text-[#000091] border-[#000091]"
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
