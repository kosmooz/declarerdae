"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  ClipboardList,
  Building2,
  MapPin,
  Cpu,
  ChevronRight,
  Plus,
} from "lucide-react";

interface DeclarationItem {
  id: string;
  exptRais: string | null;
  exptNom: string | null;
  exptPrenom: string | null;
  ville: string | null;
  step: number;
  status: string;
  deviceCount: number;
  createdAt: string;
  updatedAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Brouillon",
  COMPLETE: "Soumise",
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
  { key: "COMPLETE", label: "Soumises" },
  { key: "VALIDATED", label: "Validées" },
  { key: "CANCELLED", label: "Annulées" },
];

export default function MesDeclarationsPage() {
  const router = useRouter();
  const [declarations, setDeclarations] = useState<DeclarationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchDeclarations = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (statusFilter) params.set("status", statusFilter);

    const res = await apiFetch(`/api/declarations/my?${params}`);
    if (res.ok) {
      const data = await res.json();
      setDeclarations(data.declarations);
      setTotal(data.total);
    }
    setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => {
    fetchDeclarations();
  }, [fetchDeclarations]);

  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#161616] font-heading">
            Mes déclarations
          </h1>
          <p className="text-sm text-[#666] mt-1">
            Suivez l'avancement de vos déclarations de défibrillateurs
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

      {/* Filters */}
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
      {loading ? (
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
                  onClick={() =>
                    router.push(`/dashboard/mes-declarations/${d.id}`)
                  }
                  className="w-full text-left bg-white border border-[#E5E5E5] rounded-sm p-4 hover:border-[#000091]/30 hover:shadow-sm transition-all group"
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
