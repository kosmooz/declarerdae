"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { Search, UserPlus, AlertCircle } from "lucide-react";

interface UserAttachmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  declaration: {
    id: string;
    exptEmail: string | null;
    exptRais: string | null;
    exptSiren: string | null;
    exptNom: string | null;
    exptPrenom: string | null;
    exptTel1: string | null;
    adrVoie: string | null;
    codePostal: string | null;
    ville: string | null;
    tel1: string | null;
    daeDevices: Array<{
      nom: string | null;
      acc: string | null;
      accLib: string | null;
      daeMobile: string | null;
      dispJ: string | null;
      dispH: string | null;
      etatFonct: string | null;
      fabRais: string | null;
      modele: string | null;
      numSerie: string | null;
    }>;
  };
  onSuccess: (updatedDecl: any) => void;
}

interface UserResult {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

function isNonEmptyJsonArray(val: string | null): boolean {
  if (!val) return false;
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) && parsed.length > 0;
  } catch {
    return false;
  }
}

function validateDeclaration(declaration: UserAttachmentDialogProps["declaration"]): string[] {
  const missing: string[] = [];

  // Exploitant fields
  if (!declaration.exptRais) missing.push("Raison sociale (exploitant)");
  if (!declaration.exptSiren) missing.push("SIREN (exploitant)");
  if (!declaration.exptEmail) missing.push("Email (exploitant)");
  if (!declaration.exptTel1) missing.push("Téléphone (exploitant)");
  if (!declaration.exptNom) missing.push("Nom (exploitant)");
  if (!declaration.exptPrenom) missing.push("Prénom (exploitant)");

  // Site fields
  if (!declaration.adrVoie) missing.push("Adresse (site)");
  if (!declaration.codePostal) missing.push("Code postal (site)");
  if (!declaration.ville) missing.push("Ville (site)");
  if (!declaration.tel1) missing.push("Téléphone (site)");

  // At least one complete device
  const hasCompleteDevice = declaration.daeDevices.some((device) => {
    return (
      device.nom &&
      device.acc &&
      device.accLib &&
      device.daeMobile &&
      isNonEmptyJsonArray(device.dispJ) &&
      isNonEmptyJsonArray(device.dispH) &&
      device.etatFonct &&
      device.fabRais &&
      device.modele &&
      device.numSerie
    );
  });

  if (!hasCompleteDevice) {
    missing.push("Au moins 1 DAE complet (nom, accès, disponibilité, fabricant, modèle, n° série)");
  }

  return missing;
}

export default function UserAttachmentDialog({
  open,
  onOpenChange,
  declaration,
  onSuccess,
}: UserAttachmentDialogProps) {
  const [tab, setTab] = useState<string>("search");
  const [submitting, setSubmitting] = useState(false);

  // Search tab state
  const [searchQuery, setSearchQuery] = useState(declaration.exptEmail || "");
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Create tab state
  const [createEmail, setCreateEmail] = useState(declaration.exptEmail || "");
  const [createPassword, setCreatePassword] = useState("");

  // Validation
  const missingFields = validateDeclaration(declaration);
  const isValid = missingFields.length === 0;

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setTab("search");
      setSearchQuery(declaration.exptEmail || "");
      setSelectedUserId(null);
      setCreateEmail(declaration.exptEmail || "");
      setCreatePassword("");
      setSearchResults([]);
    }
  }, [open, declaration.exptEmail]);

  // Debounced search
  const searchUsers = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await apiFetch(
        `/api/admin/users?search=${encodeURIComponent(query)}&limit=10`,
        { silent: true },
      );
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.users || []);
      } else {
        setSearchResults([]);
      }
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchUsers]);

  // Trigger initial search when dialog opens with pre-filled email
  useEffect(() => {
    if (open && declaration.exptEmail) {
      searchUsers(declaration.exptEmail);
    }
  }, [open, declaration.exptEmail, searchUsers]);

  const canSubmit = (() => {
    if (!isValid) return false;
    if (submitting) return false;
    if (tab === "search" && !selectedUserId) return false;
    if (tab === "create" && createPassword.length < 12) return false;
    return true;
  })();

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);

    try {
      let body: Record<string, any>;

      if (tab === "search") {
        body = { status: "COMPLETE", userId: selectedUserId };
      } else {
        body = {
          status: "COMPLETE",
          createUser: { email: createEmail, password: createPassword },
        };
      }

      const res = await apiFetch(`/api/admin/declarations/${declaration.id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
        silent: true,
      });

      if (res.ok) {
        const data = await res.json();
        toast.success("Déclaration passée en Complète");
        onSuccess(data);
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Erreur");
      }
    } catch {
      toast.error("Erreur");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Passer en Complète</DialogTitle>
          <DialogDescription>
            Rattachez un utilisateur pour finaliser cette déclaration.
          </DialogDescription>
        </DialogHeader>

        {/* Validation errors */}
        {!isValid && (
          <div className="flex gap-3 rounded-md border border-red-200 bg-red-50 p-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-red-800 mb-1">
                Champs manquants pour passer en Complète :
              </p>
              <ul className="list-disc list-inside text-red-700 space-y-0.5">
                {missingFields.map((field) => (
                  <li key={field}>{field}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full">
            <TabsTrigger value="search" className="flex-1 gap-1.5">
              <Search className="h-3.5 w-3.5" />
              Utilisateur existant
            </TabsTrigger>
            <TabsTrigger value="create" className="flex-1 gap-1.5">
              <UserPlus className="h-3.5 w-3.5" />
              Nouveau compte
            </TabsTrigger>
          </TabsList>

          {/* Search existing user */}
          <TabsContent value="search" className="space-y-3 mt-3">
            <div>
              <Label htmlFor="user-search">Rechercher un utilisateur</Label>
              <div className="relative mt-1.5">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#929292]" />
                <Input
                  id="user-search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedUserId(null);
                  }}
                  placeholder="Email ou nom..."
                  className="pl-9"
                />
              </div>
            </div>

            <div className="border rounded-md divide-y max-h-48 overflow-y-auto">
              {searching && (
                <div className="p-3 text-sm text-[#929292] text-center">
                  Recherche...
                </div>
              )}
              {!searching && searchResults.length === 0 && searchQuery.length >= 2 && (
                <div className="p-3 text-sm text-[#929292] text-center">
                  Aucun utilisateur trouvé
                </div>
              )}
              {!searching && searchQuery.length < 2 && (
                <div className="p-3 text-sm text-[#929292] text-center">
                  Saisissez au moins 2 caractères
                </div>
              )}
              {searchResults.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => setSelectedUserId(user.id)}
                  className={`w-full text-left px-3 py-2.5 text-sm transition-colors hover:bg-[#F6F6F6] ${
                    selectedUserId === user.id
                      ? "bg-[#000091]/5 border-l-2 border-l-[#000091]"
                      : ""
                  }`}
                >
                  <div className="font-medium text-[#3A3A3A]">{user.email}</div>
                  {(user.firstName || user.lastName) && (
                    <div className="text-[#929292] text-xs mt-0.5">
                      {[user.firstName, user.lastName].filter(Boolean).join(" ")}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </TabsContent>

          {/* Create new account */}
          <TabsContent value="create" className="space-y-3 mt-3">
            <div>
              <Label htmlFor="create-email">Email</Label>
              <Input
                id="create-email"
                type="email"
                value={createEmail}
                onChange={(e) => setCreateEmail(e.target.value)}
                placeholder="email@exemple.fr"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="create-password">Mot de passe</Label>
              <Input
                id="create-password"
                type="password"
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
                placeholder="Mot de passe"
                className="mt-1.5"
              />
              <p className="text-xs text-[#929292] mt-1">
                Minimum 12 caractères
                {createPassword.length > 0 && createPassword.length < 12 && (
                  <span className="text-red-500 ml-1">
                    ({createPassword.length}/12)
                  </span>
                )}
                {createPassword.length >= 12 && (
                  <span className="text-green-600 ml-1">OK</span>
                )}
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {submitting ? "Traitement..." : "Passer en Complète"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
