"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useDevMode } from "@/lib/useDevMode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Trash2, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface UserItem {
  id: string;
  email: string;
  emailVerified: boolean;
  role: string;
  deleted: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const dev = useDevMode();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: "20",
      includeDeleted: String(includeDeleted),
    });
    if (search) params.set("search", search);

    const res = await apiFetch(`/api/admin/users?${params}`, { signal });
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users);
      setTotal(data.total);
    }
    if (!signal?.aborted) setLoading(false);
  }, [page, search, includeDeleted]);

  useEffect(() => {
    const ctrl = new AbortController();
    fetchUsers(ctrl.signal).catch((err: unknown) => { if ((err as Error).name !== "AbortError") console.error("[admin-users]", err); });
    return () => ctrl.abort();
  }, [fetchUsers]);

  const handleDelete = async (id: string) => {
    if (!confirm("Désactiver cet utilisateur ?")) return;
    const res = await apiFetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Utilisateur désactivé");
      fetchUsers();
    }
  };

  const handleRestore = async (id: string) => {
    const res = await apiFetch(`/api/admin/users/${id}/restore`, { method: "PATCH" });
    if (res.ok) {
      toast.success("Utilisateur réactivé");
      fetchUsers();
    }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1200px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#3A3A3A]">Utilisateurs</h1>
          <p className="text-[#929292] text-sm mt-1">{total} utilisateur(s) au total</p>
        </div>
        <Button onClick={() => router.push("/admin/users/new")} className="gap-2">
          <Plus className="h-4 w-4" /> Nouveau
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#929292]" />
              <Input
                placeholder="Rechercher par email, nom..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-[#3A3A3A] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeDeleted}
                onChange={(e) => { setIncludeDeleted(e.target.checked); setPage(1); }}
                className="cursor-pointer"
              />
              Inclure désactivés
            </label>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className={`animate-spin rounded-full h-6 w-6 border-b-2 ${dev.borderSpinner}`} />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left bg-[#F6F6F6]">
                      <th className="pl-3 pr-3 py-2.5 font-medium text-[#929292]">Email</th>
                      <th className="pl-3 pr-3 py-2.5 font-medium text-[#929292]">Rôle</th>
                      <th className="pl-3 pr-3 py-2.5 font-medium text-[#929292]">Vérifié</th>
                      <th className="pl-3 pr-3 py-2.5 font-medium text-[#929292]">Date</th>
                      <th className="pl-3 pr-3 py-2.5 font-medium text-[#929292]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className={`border-b last:border-0 hover:bg-[#F6F6F6] transition-colors ${u.deleted ? "opacity-50" : ""}`}>
                        <td className="pl-3 pr-3 py-2.5">
                          <button
                            onClick={() => router.push(`/admin/users/${u.id}`)}
                            className="text-primary hover:underline font-medium"
                          >
                            {u.email}
                          </button>
                        </td>
                        <td className="pl-3 pr-3 py-2.5">
                          <Badge variant={u.role === "ADMIN" ? "default" : "secondary"}>
                            {u.role}
                          </Badge>
                        </td>
                        <td className="pl-3 pr-3 py-2.5">
                          {u.emailVerified ? (
                            <span className="text-green-600">Oui</span>
                          ) : (
                            <span className="text-[#929292]">Non</span>
                          )}
                        </td>
                        <td className="pl-3 pr-3 py-2.5 text-xs text-[#929292]">
                          {new Date(u.createdAt).toLocaleDateString("fr-FR")}
                        </td>
                        <td className="pl-3 pr-3 py-2.5">
                          {u.deleted ? (
                            <Button size="sm" variant="ghost" onClick={() => handleRestore(u.id)}>
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button size="sm" variant="ghost" onClick={() => handleDelete(u.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-[#929292]">
                          Aucun utilisateur trouvé
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 border-t pt-4">
                  <p className="text-sm text-[#929292]">{total} utilisateur(s)</p>
                  <div className="flex items-center gap-3">
                    <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                      Précédent
                    </Button>
                    <span className="text-sm text-[#3A3A3A]">Page {page} sur {totalPages}</span>
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
