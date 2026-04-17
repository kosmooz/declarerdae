"use client";

import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Building2,
  Phone,
  Hash,
  FileText,
  Pencil,
  CheckCircle2,
  AlertCircle,
  Calendar,
} from "lucide-react";

function ProfileInfoRow({
  icon: Icon,
  label,
  value,
  last,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | null | undefined;
  last?: boolean;
}) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center py-2.5 ${
        last ? "" : "border-b border-[#F6F6F6]"
      }`}
    >
      <div className="flex items-center gap-2 text-xs text-[#929292] sm:w-48 shrink-0 mb-0.5 sm:mb-0">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
      {value ? (
        <span className="text-sm text-[#161616]">{value}</span>
      ) : (
        <span className="text-sm italic text-[#929292]">{"Non renseign\u00e9"}</span>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const initials =
    user.firstName && user.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
      : user.email?.[0]?.toUpperCase() || "?";

  const fullName =
    user.firstName || user.lastName
      ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
      : null;

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#161616] font-heading">
            Mon profil
          </h1>
          <p className="text-sm text-[#666] mt-1">
            {"Consultez et g\u00e9rez vos informations personnelles"}
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard/edit-profile")}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-sm bg-[#000091] hover:bg-[#000091]/90 text-white text-sm font-medium transition-colors"
        >
          <Pencil className="w-4 h-4" />
          Modifier
        </button>
      </div>

      {/* Identity card */}
      <div className="bg-white border border-[#E5E5E5] rounded-sm overflow-hidden mb-4">
        <div className="px-6 py-5 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-[#000091] flex items-center justify-center shrink-0">
            <span className="text-white text-xl font-bold font-heading">
              {initials}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-[#161616] font-heading">
              {fullName || "Utilisateur"}
            </h2>
            <p className="text-sm text-[#666] mt-0.5">{user.email}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F5F5FE] text-[#000091]">
                <User className="w-3 h-3" />
                {user.role === "ADMIN" ? "Administrateur" : "Utilisateur"}
              </span>
              {user.emailVerified ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#D1FAE5] text-[#18753C]">
                  <CheckCircle2 className="w-3 h-3" />
                  {"Email v\u00e9rifi\u00e9"}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FEF3C7] text-[#92400E]">
                  <AlertCircle className="w-3 h-3" />
                  {"Email non v\u00e9rifi\u00e9"}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section: Coordonnees */}
      <section className="bg-white border border-[#E5E5E5] rounded-sm overflow-hidden mb-4">
        <div className="flex items-center gap-2 px-5 py-3 bg-[#F6F6F6] border-b border-[#E5E5E5]">
          <Mail className="w-4 h-4 text-[#000091]" />
          <span className="text-sm font-semibold text-[#161616]">
            {"Coordonn\u00e9es"}
          </span>
        </div>
        <div className="px-5 py-3">
          <ProfileInfoRow icon={Mail} label="Adresse email" value={user.email} />
          <ProfileInfoRow
            icon={Phone}
            label={"T\u00e9l\u00e9phone"}
            value={user.phone}
            last
          />
        </div>
      </section>

      {/* Section: Entreprise */}
      <section className="bg-white border border-[#E5E5E5] rounded-sm overflow-hidden mb-4">
        <div className="flex items-center gap-2 px-5 py-3 bg-[#F6F6F6] border-b border-[#E5E5E5]">
          <Building2 className="w-4 h-4 text-[#000091]" />
          <span className="text-sm font-semibold text-[#161616]">
            Entreprise
          </span>
        </div>
        <div className="px-5 py-3">
          <ProfileInfoRow
            icon={Building2}
            label={"Soci\u00e9t\u00e9"}
            value={user.company}
          />
          <ProfileInfoRow icon={Hash} label="SIRET" value={user.siret} />
          <ProfileInfoRow
            icon={FileText}
            label={"N\u00b0 TVA intracommunautaire"}
            value={user.tvaNumber}
            last
          />
        </div>
      </section>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2 text-xs text-[#929292]">
          <Calendar className="w-3.5 h-3.5" />
          <span>
            Inscrit le{" "}
            {new Date(user.createdAt).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
        <button
          onClick={() => router.push("/dashboard/edit-profile")}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#000091] hover:underline"
        >
          Modifier mes informations
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
