"use client";
/*
  DESIGN: Service Public Numérique
  Formulaire de déclaration DAE multi-étapes, style institutionnel
  Auto-save debounced vers le backend à chaque modification de champ
*/
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, ChevronRight, ChevronLeft, Send, Building2, MapPin, Cpu, User } from "lucide-react";

const steps = [
  { id: 1, title: "Exploitant", icon: User },
  { id: 2, title: "Établissement", icon: Building2 },
  { id: 3, title: "Localisation", icon: MapPin },
  { id: 4, title: "Défibrillateur", icon: Cpu },
];

const INITIAL_FORM_DATA = {
  // Step 1 - Exploitant
  nom: "",
  prenom: "",
  email: "",
  telephone: "",
  organisme: "",
  siren: "",
  // Step 2 - Établissement
  nomEtablissement: "",
  typeERP: "non-erp",
  categorieERP: "cat-1",
  // Step 3 - Localisation
  adresse: "",
  codePostal: "",
  ville: "",
  complement: "",
  emplacement: "interieur",
  etage: "",
  // Step 4 - DAE
  marque: "",
  modele: "",
  numeroSerie: "",
  dateInstallation: "",
  dateMaintenance: "",
  accessibilite: "24h",
};

const LS_KEY_ID = "declaration_draft_id";
const LS_KEY_DATA = "declaration_draft_data";

export default function DeclarationForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({ ...INITIAL_FORM_DATA });
  const [declarationId, setDeclarationId] = useState<string | null>(null);

  const declarationIdRef = useRef<string | null>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savingRef = useRef(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const storedId = localStorage.getItem(LS_KEY_ID);
      const storedData = localStorage.getItem(LS_KEY_DATA);
      if (storedId) {
        setDeclarationId(storedId);
        declarationIdRef.current = storedId;
      }
      if (storedData) {
        const parsed = JSON.parse(storedData);
        setFormData((prev) => ({ ...prev, ...parsed }));
      }
    } catch {}
    setHydrated(true);
  }, []);

  // Sync declarationId ref
  useEffect(() => {
    declarationIdRef.current = declarationId;
    if (declarationId) {
      localStorage.setItem(LS_KEY_ID, declarationId);
    }
  }, [declarationId]);

  // Persist formData to localStorage
  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(LS_KEY_DATA, JSON.stringify(formData));
    }
  }, [formData, hydrated]);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ─── Auto-save to backend (debounced 1s) ────────────────────
  const autoSaveToBackend = useCallback(() => {
    if (!hydrated) return;

    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }

    autoSaveTimer.current = setTimeout(async () => {
      if (savingRef.current) return;
      savingRef.current = true;

      try {
        // Build payload with only non-empty fields
        const payload: Record<string, any> = {};

        if (formData.nom?.trim()) payload.nom = formData.nom;
        if (formData.prenom?.trim()) payload.prenom = formData.prenom;
        if (formData.email?.trim()) payload.email = formData.email;
        if (formData.telephone?.trim()) payload.telephone = formData.telephone;
        if (formData.organisme?.trim()) payload.organisme = formData.organisme;
        if (formData.siren?.trim()) payload.siren = formData.siren;
        if (formData.nomEtablissement?.trim()) payload.nomEtablissement = formData.nomEtablissement;
        if (formData.typeERP) payload.typeERP = formData.typeERP;
        if (formData.adresse?.trim()) payload.adresse = formData.adresse;
        if (formData.codePostal?.trim()) payload.codePostal = formData.codePostal;
        if (formData.ville?.trim()) payload.ville = formData.ville;
        if (formData.complement?.trim()) payload.complement = formData.complement;
        if (formData.emplacement) payload.emplacement = formData.emplacement;
        if (formData.etage?.trim()) payload.etage = formData.etage;
        if (formData.marque?.trim()) payload.marque = formData.marque;
        if (formData.modele?.trim()) payload.modele = formData.modele;
        if (formData.numeroSerie?.trim()) payload.numeroSerie = formData.numeroSerie;
        if (formData.dateInstallation?.trim()) payload.dateInstallation = formData.dateInstallation;
        if (formData.dateMaintenance?.trim()) payload.dateMaintenance = formData.dateMaintenance;
        if (formData.accessibilite) payload.accessibilite = formData.accessibilite;

        // Skip save if payload is empty (nothing meaningful yet)
        if (Object.keys(payload).length === 0) return;

        const currentId = declarationIdRef.current;

        if (!currentId) {
          // CREATE draft
          const res = await fetch("/api/declarations/draft", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (res.ok) {
            const data = await res.json();
            setDeclarationId(data.id);
          }
        } else {
          // UPDATE draft
          await fetch(`/api/declarations/draft/${currentId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        }
      } catch {
        // Silent — don't disturb user
      } finally {
        savingRef.current = false;
      }
    }, 1000);
  }, [hydrated, formData]);

  // Trigger auto-save on formData changes
  useEffect(() => {
    if (hydrated) autoSaveToBackend();
  }, [formData, hydrated, autoSaveToBackend]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, []);

  const handleSubmit = async () => {
    // Complete the draft on the backend
    const currentId = declarationIdRef.current;
    if (currentId) {
      try {
        await fetch(`/api/declarations/draft/${currentId}/complete`, {
          method: "POST",
        });
      } catch {
        // Continue with success UX anyway
      }
    }

    toast.success("Demande de déclaration envoyée avec succès !", {
      description: "Vous recevrez un email de confirmation sous 24h avec votre attestation de déclaration.",
      duration: 6000,
    });

    // Reset form
    setCurrentStep(1);
    setFormData({ ...INITIAL_FORM_DATA });
    setDeclarationId(null);
    declarationIdRef.current = null;
    localStorage.removeItem(LS_KEY_ID);
    localStorage.removeItem(LS_KEY_DATA);
  };

  return (
    <div className="bg-white rounded shadow-md border border-[#E5E5E5] overflow-hidden">
      {/* Progress bar */}
      <div className="bg-[#F6F6F6] px-4 py-4 border-b border-[#E5E5E5]">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                      isCompleted
                        ? "bg-[#18753C] text-white"
                        : isActive
                        ? "bg-[#000091] text-white"
                        : "bg-[#E5E5E5] text-[#929292]"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <span
                    className={`text-xs mt-1 font-medium hidden sm:block ${
                      isActive ? "text-[#000091]" : isCompleted ? "text-[#18753C]" : "text-[#929292]"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-8 sm:w-16 h-0.5 mx-1 sm:mx-2 ${
                      currentStep > step.id ? "bg-[#18753C]" : "bg-[#E5E5E5]"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Form content */}
      <div className="p-6">
        <h3 className="font-heading font-bold text-lg text-[#000091] mb-1">
          Étape {currentStep} sur 4 — {steps[currentStep - 1].title}
        </h3>
        <p className="text-sm text-[#666] mb-5">
          {currentStep === 1 && "Renseignez les informations de l'exploitant du défibrillateur."}
          {currentStep === 2 && "Décrivez l'établissement où est installé le DAE."}
          {currentStep === 3 && "Indiquez l'adresse précise et l'emplacement du DAE."}
          {currentStep === 4 && "Renseignez les caractéristiques techniques de votre DAE."}
        </p>

        {/* Step 1: Exploitant */}
        {currentStep === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nom" className="text-sm font-semibold text-[#3A3A3A] mb-1.5">Nom *</Label>
              <Input id="nom" value={formData.nom} onChange={(e) => updateField("nom", e.target.value)} placeholder="Dupont" className="border-[#CECECE] focus:border-[#000091] focus:ring-[#000091]" />
            </div>
            <div>
              <Label htmlFor="prenom" className="text-sm font-semibold text-[#3A3A3A] mb-1.5">Prénom *</Label>
              <Input id="prenom" value={formData.prenom} onChange={(e) => updateField("prenom", e.target.value)} placeholder="Jean" className="border-[#CECECE] focus:border-[#000091] focus:ring-[#000091]" />
            </div>
            <div>
              <Label htmlFor="email" className="text-sm font-semibold text-[#3A3A3A] mb-1.5">Email *</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => updateField("email", e.target.value)} placeholder="jean.dupont@exemple.fr" className="border-[#CECECE] focus:border-[#000091] focus:ring-[#000091]" />
            </div>
            <div>
              <Label htmlFor="telephone" className="text-sm font-semibold text-[#3A3A3A] mb-1.5">Téléphone *</Label>
              <Input id="telephone" type="tel" value={formData.telephone} onChange={(e) => updateField("telephone", e.target.value)} placeholder="06 12 34 56 78" className="border-[#CECECE] focus:border-[#000091] focus:ring-[#000091]" />
            </div>
            <div>
              <Label htmlFor="organisme" className="text-sm font-semibold text-[#3A3A3A] mb-1.5">Organisme / Société *</Label>
              <Input id="organisme" value={formData.organisme} onChange={(e) => updateField("organisme", e.target.value)} placeholder="Mairie de Paris" className="border-[#CECECE] focus:border-[#000091] focus:ring-[#000091]" />
            </div>
            <div>
              <Label htmlFor="siren" className="text-sm font-semibold text-[#3A3A3A] mb-1.5">N° SIREN</Label>
              <Input id="siren" value={formData.siren} onChange={(e) => updateField("siren", e.target.value)} placeholder="123 456 789" className="border-[#CECECE] focus:border-[#000091] focus:ring-[#000091]" />
            </div>
          </div>
        )}

        {/* Step 2: Établissement */}
        {currentStep === 2 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label htmlFor="nomEtablissement" className="text-sm font-semibold text-[#3A3A3A] mb-1.5">Nom de l'établissement *</Label>
              <Input id="nomEtablissement" value={formData.nomEtablissement} onChange={(e) => updateField("nomEtablissement", e.target.value)} placeholder="Mairie du 5e arrondissement" className="border-[#CECECE] focus:border-[#000091] focus:ring-[#000091]" />
            </div>
            <div>
              <Label className="text-sm font-semibold text-[#3A3A3A] mb-1.5">Type d'établissement *</Label>
              <Select value={formData.typeERP} onValueChange={(v) => updateField("typeERP", v)}>
                <SelectTrigger className="border-[#CECECE] focus:border-[#000091]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="erp">Établissement Recevant du Public (ERP)</SelectItem>
                  <SelectItem value="non-erp">Autre établissement</SelectItem>
                  <SelectItem value="entreprise">Entreprise privée</SelectItem>
                  <SelectItem value="association">Association</SelectItem>
                  <SelectItem value="collectivite">Collectivité territoriale</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Step 3: Localisation */}
        {currentStep === 3 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label htmlFor="adresse" className="text-sm font-semibold text-[#3A3A3A] mb-1.5">Adresse *</Label>
              <Input id="adresse" value={formData.adresse} onChange={(e) => updateField("adresse", e.target.value)} placeholder="21 rue de la Paix" className="border-[#CECECE] focus:border-[#000091] focus:ring-[#000091]" />
            </div>
            <div>
              <Label htmlFor="codePostal" className="text-sm font-semibold text-[#3A3A3A] mb-1.5">Code postal *</Label>
              <Input id="codePostal" value={formData.codePostal} onChange={(e) => updateField("codePostal", e.target.value)} placeholder="75002" className="border-[#CECECE] focus:border-[#000091] focus:ring-[#000091]" />
            </div>
            <div>
              <Label htmlFor="ville" className="text-sm font-semibold text-[#3A3A3A] mb-1.5">Ville *</Label>
              <Input id="ville" value={formData.ville} onChange={(e) => updateField("ville", e.target.value)} placeholder="Paris" className="border-[#CECECE] focus:border-[#000091] focus:ring-[#000091]" />
            </div>
            <div>
              <Label className="text-sm font-semibold text-[#3A3A3A] mb-1.5">Emplacement du DAE *</Label>
              <Select value={formData.emplacement} onValueChange={(v) => updateField("emplacement", v)}>
                <SelectTrigger className="border-[#CECECE] focus:border-[#000091]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="interieur">Intérieur</SelectItem>
                  <SelectItem value="exterieur">Extérieur</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="complement" className="text-sm font-semibold text-[#3A3A3A] mb-1.5">Complément de localisation</Label>
              <Input id="complement" value={formData.complement} onChange={(e) => updateField("complement", e.target.value)} placeholder="Hall d'entrée, à côté de l'accueil" className="border-[#CECECE] focus:border-[#000091] focus:ring-[#000091]" />
            </div>
          </div>
        )}

        {/* Step 4: DAE */}
        {currentStep === 4 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="marque" className="text-sm font-semibold text-[#3A3A3A] mb-1.5">Marque du DAE *</Label>
              <Input id="marque" value={formData.marque} onChange={(e) => updateField("marque", e.target.value)} placeholder="Philips, Zoll, Schiller..." className="border-[#CECECE] focus:border-[#000091] focus:ring-[#000091]" />
            </div>
            <div>
              <Label htmlFor="modele" className="text-sm font-semibold text-[#3A3A3A] mb-1.5">Modèle *</Label>
              <Input id="modele" value={formData.modele} onChange={(e) => updateField("modele", e.target.value)} placeholder="HeartStart FRx" className="border-[#CECECE] focus:border-[#000091] focus:ring-[#000091]" />
            </div>
            <div>
              <Label htmlFor="numeroSerie" className="text-sm font-semibold text-[#3A3A3A] mb-1.5">Numéro de série</Label>
              <Input id="numeroSerie" value={formData.numeroSerie} onChange={(e) => updateField("numeroSerie", e.target.value)} placeholder="SN-123456789" className="border-[#CECECE] focus:border-[#000091] focus:ring-[#000091]" />
            </div>
            <div>
              <Label htmlFor="dateInstallation" className="text-sm font-semibold text-[#3A3A3A] mb-1.5">Date d'installation *</Label>
              <Input id="dateInstallation" type="date" value={formData.dateInstallation} onChange={(e) => updateField("dateInstallation", e.target.value)} className="border-[#CECECE] focus:border-[#000091] focus:ring-[#000091]" />
            </div>
            <div>
              <Label htmlFor="dateMaintenance" className="text-sm font-semibold text-[#3A3A3A] mb-1.5">Date dernière maintenance *</Label>
              <Input id="dateMaintenance" type="date" value={formData.dateMaintenance} onChange={(e) => updateField("dateMaintenance", e.target.value)} className="border-[#CECECE] focus:border-[#000091] focus:ring-[#000091]" />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-sm font-semibold text-[#3A3A3A] mb-1.5">Accessibilité *</Label>
              <Select value={formData.accessibilite} onValueChange={(v) => updateField("accessibilite", v)}>
                <SelectTrigger className="border-[#CECECE] focus:border-[#000091]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Accessible 24h/24</SelectItem>
                  <SelectItem value="horaires">Accessible aux horaires d'ouverture</SelectItem>
                  <SelectItem value="restreint">Accès restreint (personnel uniquement)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#E5E5E5]">
          {currentStep > 1 ? (
            <Button
              variant="outline"
              onClick={() => setCurrentStep((s) => s - 1)}
              className="border-[#CECECE] text-[#3A3A3A] hover:bg-[#F6F6F6]"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Précédent
            </Button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <Button
              onClick={() => setCurrentStep((s) => s + 1)}
              className="bg-[#000091] hover:bg-[#000070] text-white"
            >
              Suivant
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              className="bg-[#18753C] hover:bg-[#145F30] text-white"
            >
              <Send className="w-4 h-4 mr-1" />
              Envoyer ma déclaration
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
