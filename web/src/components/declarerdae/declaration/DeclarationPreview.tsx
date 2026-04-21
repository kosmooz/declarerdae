"use client";

import type { DeclarationFormState } from "@/lib/declaration-types";
import { User, Building2, Cpu, MapPin, Check, AlertTriangle } from "lucide-react";

interface DeclarationPreviewProps {
  data: DeclarationFormState;
  currentStep: number;
  onGoToStep?: (step: number) => void;
  warningMessage?: string | null;
  onWarningClick?: () => void;
}

function PreviewSection({
  icon: Icon,
  title,
  filled,
  onClick,
  children,
}: {
  icon: any;
  title: string;
  filled: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`border-b border-[#E5E5E5] last:border-0 pb-3 last:pb-0 rounded-sm px-2 py-1.5 -mx-2 transition-colors ${
        onClick ? "cursor-pointer hover:bg-[#F6F6F6]" : ""
      }`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } } : undefined}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <Icon
          className={`w-3.5 h-3.5 ${filled ? "text-[#18753C]" : "text-[#929292]"}`}
        />
        <span className="text-xs font-semibold text-[#161616]">{title}</span>
        {filled && <Check className="w-3 h-3 text-[#18753C] ml-auto" />}
        {onClick && !filled && (
          <span className="text-[10px] text-[#000091] ml-auto">Modifier →</span>
        )}
        {onClick && filled && (
          <span className="text-[10px] text-[#000091] ml-1">Modifier →</span>
        )}
      </div>
      <div className="text-xs text-[#666] space-y-0.5 pl-5.5">{children}</div>
    </div>
  );
}

export default function DeclarationPreview({
  data,
  currentStep,
  onGoToStep,
  warningMessage,
  onWarningClick,
}: DeclarationPreviewProps) {
  const hasExploitant = !!(data.exptRais?.trim() && data.exptEmail?.trim());
  const hasSite = !!(data.adrVoie?.trim() && data.ville?.trim());
  const deviceCount = data.daeDevices.length;
  const completedDevices = data.daeDevices.filter(
    (d) => d.nom?.trim() && d.fabRais?.trim() && d.modele?.trim(),
  ).length;

  // Progress calculation
  const stepProgress = [
    hasExploitant,
    hasSite,
    completedDevices > 0,
  ];
  const pct = Math.round(
    (stepProgress.filter(Boolean).length / 3) * 100,
  );

  return (
    <div className="rounded-sm border border-[#CECECE] bg-white overflow-hidden">
      {/* Header */}
      <div className="bg-[#000091] px-4 py-3">
        <h3 className="text-white text-sm font-semibold">
          Aperçu de la déclaration
        </h3>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-white/80 text-[10px] font-medium">
            {pct}%
          </span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Exploitant */}
        <PreviewSection icon={User} title="Exploitant" filled={hasExploitant} onClick={onGoToStep ? () => onGoToStep(1) : undefined}>
          {data.exptRais ? (
            <>
              <p className="font-medium text-[#161616]">{data.exptRais}</p>
              {data.exptSiren && <p>SIREN : {data.exptSiren}</p>}
              {(data.exptPrenom || data.exptNom) && (
                <p>
                  {data.exptPrenom} {data.exptNom}
                </p>
              )}
              {data.exptEmail && <p>{data.exptEmail}</p>}
              {data.exptVoie && (
                <p className="text-[10px] mt-0.5">
                  {[data.exptNum, data.exptVoie, data.exptCp, data.exptCom]
                    .filter(Boolean)
                    .join(" ")}
                </p>
              )}
            </>
          ) : (
            <p className="italic text-[#929292]">Non renseigné</p>
          )}
        </PreviewSection>

        {/* Site */}
        <PreviewSection icon={Building2} title="Site" filled={hasSite} onClick={onGoToStep ? () => onGoToStep(2) : undefined}>
          {data.nomEtablissement && (
            <p className="font-medium text-[#161616]">
              {data.nomEtablissement}
            </p>
          )}
          {data.adrVoie ? (
            <>
              <p>
                {[data.adrNum, data.adrVoie].filter(Boolean).join(" ")}
              </p>
              <p>
                {data.codePostal} {data.ville}
              </p>
              {data.latCoor1 != null && (
                <p className="flex items-center gap-1 text-[#18753C]">
                  <MapPin className="w-3 h-3" />
                  GPS OK
                </p>
              )}
            </>
          ) : (
            <p className="italic text-[#929292]">Non renseigné</p>
          )}
        </PreviewSection>

        {/* Devices */}
        <PreviewSection
          icon={Cpu}
          title={`DAE (${deviceCount})`}
          filled={completedDevices > 0}
          onClick={onGoToStep ? () => onGoToStep(3) : undefined}
        >
          {data.daeDevices.map((d, i) => (
            <div
              key={d.localId}
              className="flex items-center gap-1.5 py-0.5"
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  d.nom?.trim() && d.fabRais?.trim()
                    ? "bg-[#18753C]"
                    : "bg-[#E5E5E5]"
                }`}
              />
              <span className={d.nom?.trim() ? "text-[#161616]" : "italic text-[#929292]"}>
                {d.nom?.trim() || `DAE ${i + 1}`}
              </span>
              {d.fabRais?.trim() && (
                <span className="text-[#929292]">
                  — {d.fabRais}
                </span>
              )}
            </div>
          ))}
        </PreviewSection>

        {/* Warning message */}
        {warningMessage && (
          <div className="pt-3 border-t border-[#E5E5E5]">
            <div
              className={`flex items-start gap-1.5 px-1 py-1.5 rounded bg-amber-50 border border-amber-200 ${onWarningClick ? "cursor-pointer hover:bg-amber-100 transition-colors" : ""}`}
              onClick={onWarningClick}
              role={onWarningClick ? "button" : undefined}
            >
              <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-700 leading-tight">
                {warningMessage}
              </p>
            </div>
          </div>
        )}

        {/* Step indicator */}
        <div className="pt-3">
          <p className="text-[10px] text-[#929292] text-center">
            Étape {currentStep} sur 4
          </p>
        </div>
      </div>
    </div>
  );
}
