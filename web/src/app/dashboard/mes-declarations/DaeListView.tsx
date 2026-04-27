"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Cpu,
  Building2,
  MapPin,
  ChevronRight,
  Plus,
  Globe,
  CheckCircle,
  Trash2,
  AlertTriangle,
  XCircle,
} from "lucide-react";

interface DeviceItem {
  id: string;
  nom: string | null;
  fabRais: string | null;
  modele: string | null;
  numSerie: string | null;
  etatFonct: string | null;
  geodaeGid: number | null;
  geodaeStatus: string | null;
  geodaeLastSync: string | null;
  geodaeLastError: string | null;
  declaration: {
    id: string;
    exptRais: string | null;
    ville: string | null;
    status: string;
    updatedAt: string;
  };
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

const GEODAE_FILTERS = [
  { key: "", label: "Tous" },
  { key: "synced", label: "Synchronisés" },
  { key: "not_sent", label: "Non envoyés" },
  { key: "needs_update", label: "Mise à jour requise" },
  { key: "failed", label: "En échec" },
];

function getGeodaeBadge(device: DeviceItem) {
  const { geodaeStatus, geodaeLastSync, declaration } = device;
  const needsUpdate =
    (geodaeStatus === "SENT" || geodaeStatus === "UPDATED") &&
    geodaeLastSync &&
    new Date(declaration.updatedAt).getTime() > new Date(geodaeLastSync).getTime();

  if (geodaeStatus === "DELETED") {
    return { label: "Supprimé", bg: "bg-[#F6F6F6]", text: "text-[#929292]", icon: Trash2 };
  }
  if (geodaeStatus === "FAILED") {
    return { label: "En échec", bg: "bg-red-50", text: "text-[#E1000F]", icon: XCircle };
  }
  if (needsUpdate) {
    return { label: "Mise à jour requise", bg: "bg-amber-50", text: "text-[#92400E]", icon: AlertTriangle };
  }
  if (geodaeStatus === "SENT" || geodaeStatus === "UPDATED") {
    return { label: "Synchronisé", bg: "bg-green-50", text: "text-[#18753C]", icon: CheckCircle };
  }
  return { label: "Non envoyé", bg: "bg-[#F5F5FE]", text: "text-[#000091]", icon: Globe };
}

interface DaeListViewProps {
  statusFilter: string;
}

export default function DaeListView({ statusFilter }: DaeListViewProps) {
  const router = useRouter();
  const [devices, setDevices] = useState<DeviceItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [geodaeFilter, setGeodaeFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchDevices = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (statusFilter) params.set("status", statusFilter);
      if (geodaeFilter) params.set("geodae", geodaeFilter);

      const res = await apiFetch(`/api/declarations/my/devices?${params}`, { signal });
      if (res.ok) {
        const data = await res.json();
        setDevices(data.devices);
        setTotal(data.total);
      }
      if (!signal?.aborted) setLoading(false);
    },
    [page, statusFilter, geodaeFilter],
  );

  useEffect(() => {
    setPage(1);
  }, [statusFilter, geodaeFilter]);

  useEffect(() => {
    const ctrl = new AbortController();
    fetchDevices(ctrl.signal).catch((err: unknown) => {
      if ((err as Error).name !== "AbortError") console.error("[my-devices]", err);
    });
    return () => ctrl.abort();
  }, [fetchDevices]);

  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      {/* GéoDAE filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        {GEODAE_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setGeodaeFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              geodaeFilter === f.key
                ? "bg-[#000091] text-white border-[#000091]"
                : "bg-white text-[#666] border-[#E5E5E5] hover:border-[#000091]/30"
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
      ) : devices.length === 0 ? (
        <div className="text-center py-16 bg-[#F6F6F6] rounded-sm">
          <div className="w-14 h-14 rounded-full bg-[#000091]/10 flex items-center justify-center mx-auto mb-4">
            <Cpu className="w-7 h-7 text-[#000091]" />
          </div>
          <h3 className="font-heading font-bold text-lg text-[#161616] mb-2">
            Aucun défibrillateur
          </h3>
          <p className="text-sm text-[#666] mb-6 max-w-sm mx-auto">
            {geodaeFilter
              ? "Aucun DAE ne correspond à ce filtre."
              : "Vous n'avez pas encore déclaré de défibrillateur."}
          </p>
          {!geodaeFilter && (
            <a
              href="/declaration"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm bg-[#000091] hover:bg-[#000091]/90 text-white text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Déclarer un défibrillateur
            </a>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {devices.map((d) => {
              const badge = getGeodaeBadge(d);
              const BadgeIcon = badge.icon;
              const declCfg = STATUS_CONFIG[d.declaration.status] || STATUS_CONFIG.DRAFT;
              const isDeleted = d.geodaeStatus === "DELETED";
              const showGeodaeBtn =
                d.declaration.status === "COMPLETE" || d.declaration.status === "VALIDATED";

              return (
                <div
                  key={d.id}
                  className={`bg-white border rounded-sm overflow-hidden transition-all ${
                    isDeleted
                      ? "opacity-50 border-[#E5E5E5]"
                      : "border-[#E5E5E5] hover:border-[#000091]/30 hover:shadow-sm cursor-pointer"
                  }`}
                  onClick={() => {
                    if (!isDeleted)
                      router.push(`/dashboard/mes-declarations/${d.declaration.id}?tab=dae`);
                  }}
                >
                  <div className="flex items-start gap-3 p-4">
                    {/* DAE icon */}
                    <div className="w-10 h-10 rounded-full bg-[#000091]/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Cpu className="w-5 h-5 text-[#000091]" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      {/* Line 1: name + GéoDAE badge */}
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-[#161616] text-sm truncate">
                          {d.nom || "DAE sans nom"}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${badge.bg} ${badge.text}`}
                        >
                          <BadgeIcon className="w-3 h-3" />
                          {badge.label}
                        </span>
                      </div>

                      {/* Line 2: fabricant - modele | serie */}
                      {(d.fabRais || d.numSerie) && (
                        <div className="text-xs text-[#666] truncate mb-1.5">
                          {d.fabRais && d.modele
                            ? `${d.fabRais} — ${d.modele}`
                            : d.fabRais || d.modele || ""}
                          {d.numSerie && (
                            <span className="text-[#929292]"> | S/N {d.numSerie}</span>
                          )}
                        </div>
                      )}

                      {/* Line 3: declaration info */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F6F6F6] text-xs text-[#3A3A3A]">
                          <Building2 className="w-3 h-3 text-[#000091]" />
                          <span className="font-medium truncate max-w-[200px]">
                            {d.declaration.exptRais || "Déclaration"}
                          </span>
                          {d.declaration.ville && (
                            <>
                              <span className="text-[#929292]">·</span>
                              <MapPin className="w-3 h-3 text-[#929292]" />
                              <span className="text-[#929292]">{d.declaration.ville}</span>
                            </>
                          )}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${declCfg.bg} ${declCfg.text}`}
                        >
                          <span className={`w-1 h-1 rounded-full ${declCfg.dot}`} />
                          {STATUS_LABELS[d.declaration.status] || d.declaration.status}
                        </span>
                      </div>
                    </div>

                    {/* Right: GéoDAE button — opens the sync popup */}
                    <div className="shrink-0 flex items-center gap-2">
                      {showGeodaeBtn && !isDeleted && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(
                              `/dashboard/mes-declarations/${d.declaration.id}?action=geodae`,
                            );
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-[#000091]/20 text-[#000091] hover:bg-[#F5F5FE] transition-colors"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          Base nationale GéoDAE
                        </button>
                      )}
                      <ChevronRight className="w-5 h-5 text-[#929292] shrink-0" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-[#929292]">
                {total} défibrillateur{total > 1 ? "s" : ""}
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
