"use client";

import { forwardRef } from "react";
import { UseFormReturn } from "react-hook-form";
import { Step2Data } from "@/lib/schemas/subscribe";
import SiretSearch from "./SiretSearch";
import { SiretResult } from "@/lib/siret-api";
import { ArrowLeft, ArrowRight, Building2, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step2Props {
  form: UseFormReturn<Step2Data>;
  onNext: () => void;
  onBack: () => void;
}

const Field = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    error?: string;
    className?: string;
  }
>(({ label, error, className, ...props }, ref) => (
  <div className={className}>
    <label className="text-[13px] font-medium text-gray-700 mb-1.5 block">{label}</label>
    <input
      ref={ref}
      {...props}
      className={cn(
        "w-full h-10 px-3 rounded-lg border border-gray-300 bg-gray-50/50 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-colors",
        error && "border-destructive",
      )}
    />
    {error && <p className="text-[11px] text-destructive mt-0.5">{error}</p>}
  </div>
));
Field.displayName = "Field";

export default function Step2Informations({ form, onNext, onBack }: Step2Props) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;
  const entityType = watch("entityType");

  function handleSiretSelect(result: SiretResult) {
    setValue("companyName", result.nom_complet || result.nom_raison_sociale, { shouldDirty: true });
    setValue("siret", result.siege?.siret || result.siren, { shouldDirty: true });
    setValue("companyAddress", result.siege?.geo_adresse || result.siege?.adresse || "", { shouldDirty: true });
    setValue("companyPostalCode", result.siege?.code_postal || "", { shouldDirty: true });
    setValue("companyCity", result.siege?.libelle_commune || "", { shouldDirty: true });
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Vos informations</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Souscripteur et lieu d&apos;installation</p>
      </div>

      {/* Entity type toggle */}
      <div className="flex gap-2">
        {[
          { value: "organisation" as const, label: "Organisation", icon: Building2 },
          { value: "particulier" as const, label: "Particulier", icon: User },
        ].map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setValue("entityType", value)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all",
              entityType === value
                ? "border-[#d92d20] bg-[#d92d20]/5 text-[#d92d20]"
                : "border-muted text-muted-foreground hover:border-muted-foreground/30",
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Organisation — SIRET search + auto-fill */}
      {entityType === "organisation" && (
        <div className="rounded-xl border border-gray-200 p-5 space-y-4 bg-gray-50/60 shadow-sm">
          <SiretSearch onSelect={handleSiretSelect} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Raison sociale" {...register("companyName")} error={errors.companyName?.message} />
            <Field label="SIRET" {...register("siret")} error={errors.siret?.message} />
          </div>
          <Field label="Adresse siège" {...register("companyAddress")} />
          <div className="grid grid-cols-[120px_1fr] gap-3">
            <Field label="Code postal" {...register("companyPostalCode")} />
            <Field label="Ville" {...register("companyCity")} />
          </div>
        </div>
      )}

      {/* Signataire */}
      <div className="rounded-xl border border-gray-200 p-5 space-y-4 shadow-sm">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          {entityType === "organisation" ? "Signataire" : "Vos coordonnées"}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Prénom" {...register("firstName")} error={errors.firstName?.message} />
          <Field label="Nom" {...register("lastName")} error={errors.lastName?.message} />
        </div>
        {entityType === "organisation" && (
          <Field label="Fonction" {...register("fonction")} />
        )}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Mobile" type="tel" placeholder="+262 692 XX XX XX" {...register("mobile")} error={errors.mobile?.message} />
          <Field label="Email" type="email" {...register("email")} error={errors.email?.message} />
        </div>
      </div>

      {/* Installation */}
      <div className="rounded-xl border border-gray-200 p-5 space-y-4 shadow-sm">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Lieu d&apos;installation
        </p>
        <Field label="Adresse" {...register("installAddress")} error={errors.installAddress?.message} />
        <Field label="Complément d'adresse" placeholder="Bâtiment, étage, porte..." {...register("installAddressComplement")} />
        <div className="grid grid-cols-[120px_1fr] gap-3">
          <Field label="Code postal" {...register("installPostalCode")} error={errors.installPostalCode?.message} />
          <Field label="Ville" {...register("installCity")} error={errors.installCity?.message} />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onBack}
          className="h-10 px-5 rounded-lg border text-sm font-medium flex items-center gap-1.5 hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Retour
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-1 h-10 bg-[#d92d20] hover:bg-[#b91c1c] text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          Continuer
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
