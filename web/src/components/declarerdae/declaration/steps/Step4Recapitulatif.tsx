"use client";

import { useState } from "react";
import type { DeclarationFormState, DaeDeviceFormState } from "@/lib/declaration-types";
import { useAuth } from "@/lib/auth";
import { CheckCircle2, AlertCircle, Cpu, User, Building2, Lock, LogOut, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Step4Props {
  data: DeclarationFormState;
  email: string;
  password: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onOpenAuth: () => void;
}

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: any;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-[#CECECE] rounded-sm overflow-hidden">
      <div className="bg-[#F6F6F6] px-4 py-2 flex items-center gap-2 border-b border-[#CECECE]">
        <Icon className="w-4 h-4 text-[#000091]" />
        <h4 className="text-sm font-semibold text-[#161616]">{title}</h4>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value?.trim()) return null;
  return (
    <div className="flex justify-between text-sm py-1">
      <span className="text-[#666]">{label}</span>
      <span className="font-medium text-[#161616] text-right max-w-[60%] break-words">
        {value}
      </span>
    </div>
  );
}

function DeviceRecap({
  device,
  index,
}: {
  device: DaeDeviceFormState;
  index: number;
}) {
  return (
    <div className="border border-[#E5E5E5] rounded-sm p-3 space-y-1">
      <div className="flex items-center gap-2 mb-2">
        <Cpu className="w-4 h-4 text-[#000091]" />
        <span className="text-sm font-semibold">
          {device.nom || `DAE ${index + 1}`}
        </span>
      </div>
      <Field label="Fabricant" value={device.fabRais} />
      <Field label="Modèle" value={device.modele} />
      <Field label="N° série" value={device.numSerie} />
      <Field label="Type" value={device.typeDAE === "automatique" ? "DEA" : "DSA"} />
      <Field label="État" value={device.etatFonct} />
      <Field
        label="Accès"
        value={`${device.acc === "interieur" ? "Intérieur" : "Extérieur"} — ${device.accLib === "OUI" ? "Libre" : "Restreint"}`}
      />
      <Field label="Jours" value={device.dispJ.join(", ")} />
      <Field label="Heures" value={device.dispH.join(", ")} />
      <Field label="Dernière maintenance" value={device.dermnt} />
      {device.dateInstal && (
        <Field label="Installation" value={device.dateInstal} />
      )}
      {device.mntRais && (
        <Field label="Mainteneur" value={device.mntRais} />
      )}
    </div>
  );
}

function AccountSection({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onOpenAuth,
}: {
  email: string;
  password: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onOpenAuth: () => void;
}) {
  const { user, logout } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  if (user) {
    return (
      <div className="border border-[#18753C]/30 rounded-sm bg-[#F0FDF4] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#18753C] text-white flex items-center justify-center text-sm font-semibold">
              {(user.email?.[0] || "U").toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-[#161616]">
                Connecté en tant que
              </p>
              <p className="text-sm text-[#666]">{user.email}</p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={logout}
            className="text-[#666] border-[#CECECE] hover:bg-white"
          >
            <LogOut className="w-3.5 h-3.5 mr-1.5" />
            Se déconnecter
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-[#000091]/20 rounded-sm bg-[#F5F5FE] p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Lock className="w-4 h-4 text-[#000091]" />
        <span className="text-sm font-semibold text-[#000091]">
          Accédez à votre demande à tout moment
        </span>
      </div>
      <p className="text-xs text-[#666]">
        Renseignez un email et un mot de passe pour retrouver votre
        déclaration, suivre son avancement et recevoir votre attestation
        de conformité.
      </p>

      <div>
        <Label className="text-xs text-[#666] mb-1 block">
          Email <span className="text-[#E1000F]">*</span>
        </Label>
        <Input
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="votre@email.fr"
          className="bg-white border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091] text-sm"
        />
      </div>

      <div>
        <Label className="text-xs text-[#666] mb-1 block">
          Définir un mot de passe <span className="text-[#E1000F]">*</span>
        </Label>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder="Minimum 12 caractères"
            className="bg-white border-[#CECECE] focus:border-[#000091] focus:ring-1 focus:ring-[#000091] text-sm pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#929292] hover:text-[#666] transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {password.length > 0 && password.length < 12 && (
          <p className="text-[10px] text-[#E1000F] mt-1">
            Le mot de passe doit contenir au moins 12 caractères
          </p>
        )}
      </div>

      <div className="pt-1">
        <button
          type="button"
          onClick={onOpenAuth}
          className="text-sm text-[#000091] font-medium hover:underline"
        >
          J'ai déjà un compte
        </button>
        <p className="text-[10px] text-[#929292] mt-0.5">
          Vos informations de déclaration seront conservées.
        </p>
      </div>
    </div>
  );
}

export default function Step4Recapitulatif({
  data,
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onOpenAuth,
}: Step4Props) {
  // Check completeness
  const missingFields: string[] = [];
  if (!data.exptRais?.trim()) missingFields.push("Raison sociale");
  if (!data.exptSiren?.trim()) missingFields.push("SIREN");
  if (!data.exptEmail?.trim()) missingFields.push("Email");
  if (!data.exptTel1?.trim()) missingFields.push("Téléphone");
  if (!data.adrVoie?.trim()) missingFields.push("Adresse du site");
  if (!data.codePostal?.trim()) missingFields.push("Code postal");
  if (!data.ville?.trim()) missingFields.push("Ville");
  if (!data.tel1?.trim()) missingFields.push("Téléphone sur site");

  // Check at least 1 device with all 10 required fields (must match backend)
  const hasCompleteDevice = data.daeDevices.some(
    (d) =>
      d.nom?.trim() &&
      d.fabRais?.trim() &&
      d.modele?.trim() &&
      d.numSerie?.trim() &&
      d.etatFonct?.trim() &&
      d.acc?.trim() &&
      d.accLib?.trim() &&
      d.daeMobile?.trim() &&
      d.dispJ?.length > 0 &&
      d.dispH?.length > 0,
  );
  if (!hasCompleteDevice) {
    missingFields.push("Au moins 1 DAE avec les champs obligatoires");
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-heading font-semibold text-lg text-[#161616] mb-1">
          Récapitulatif de votre déclaration
        </h3>
        <p className="text-sm text-[#666]">
          Vérifiez les informations avant de soumettre votre déclaration.
        </p>
      </div>

      {missingFields.length > 0 && (
        <div className="alert-warning rounded text-sm">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-[#92400E] mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-[#92400E]">
                Champs manquants
              </p>
              <ul className="list-disc list-inside text-[#92400E]/80 text-xs mt-1">
                {missingFields.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {missingFields.length === 0 && (
        <div className="alert-success rounded text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#18753C]" />
            <span className="text-[#166534] font-medium">
              Votre déclaration est complète et prête à être soumise.
            </span>
          </div>
        </div>
      )}

      {/* Exploitant */}
      <SectionCard icon={User} title="Exploitant">
        <div className="space-y-1">
          <Field label="Raison sociale" value={data.exptRais} />
          <Field label="SIREN" value={data.exptSiren} />
          {data.exptSiret && <Field label="SIRET" value={data.exptSiret} />}
          <Field
            label="Contact"
            value={
              data.exptPrenom || data.exptNom
                ? `${data.exptPrenom} ${data.exptNom}`.trim()
                : undefined
            }
          />
          <Field label="Email" value={data.exptEmail} />
          <Field label="Téléphone" value={data.exptTel1} />
          {(data.exptVoie || data.exptCp) && (
            <Field
              label="Adresse"
              value={[data.exptNum, data.exptVoie, data.exptComplement]
                .filter(Boolean)
                .join(" ")}
            />
          )}
          {(data.exptCp || data.exptCom) && (
            <Field
              label="Commune"
              value={[data.exptCp, data.exptCom].filter(Boolean).join(" ")}
            />
          )}
        </div>
      </SectionCard>

      {/* Site */}
      <SectionCard icon={Building2} title="Site d'implantation">
        <div className="space-y-1">
          {data.nomEtablissement && (
            <Field label="Établissement" value={data.nomEtablissement} />
          )}
          <Field
            label="Adresse"
            value={
              [data.adrNum, data.adrVoie].filter(Boolean).join(" ") || undefined
            }
          />
          <Field
            label="Commune"
            value={
              data.codePostal && data.ville
                ? `${data.codePostal} ${data.ville}`
                : undefined
            }
          />
          <Field label="Téléphone site" value={data.tel1} />
          {data.latCoor1 != null && data.longCoor1 != null && (
            <Field
              label="GPS"
              value={`${data.latCoor1.toFixed(6)}, ${data.longCoor1.toFixed(6)}`}
            />
          )}
        </div>
      </SectionCard>

      {/* Devices */}
      <SectionCard icon={Cpu} title={`Défibrillateur(s) — ${data.daeDevices.length}`}>
        <div className="space-y-3">
          {data.daeDevices.map((device, i) => (
            <DeviceRecap key={device.localId} device={device} index={i} />
          ))}
        </div>
      </SectionCard>

      {/* Account */}
      <AccountSection
        email={email}
        password={password}
        onEmailChange={onEmailChange}
        onPasswordChange={onPasswordChange}
        onOpenAuth={onOpenAuth}
      />
    </div>
  );
}
