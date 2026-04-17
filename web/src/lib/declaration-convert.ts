import type { DeclarationFormState } from "./declaration-types";
import { deserializeDevice } from "./declaration-types";

/**
 * Convert a server Declaration (nullable strings, JSON-stringified arrays)
 * into a DeclarationFormState suitable for the Step form components.
 */
export function serverToFormState(decl: Record<string, any>): DeclarationFormState {
  return {
    // Exploitant
    exptNom: decl.exptNom || "",
    exptPrenom: decl.exptPrenom || "",
    exptRais: decl.exptRais || "",
    exptSiren: decl.exptSiren || "",
    exptSiret: decl.exptSiret || "",
    exptTel1: decl.exptTel1 || "",
    exptTel1Prefix: decl.exptTel1Prefix || "fr",
    exptEmail: decl.exptEmail || "",
    exptNum: decl.exptNum || "",
    exptVoie: decl.exptVoie || "",
    exptCp: decl.exptCp || "",
    exptCom: decl.exptCom || "",
    exptComplement: "",
    exptType: decl.exptType || "",
    exptInsee: decl.exptInsee || "",
    // Site
    nomEtablissement: decl.nomEtablissement || "",
    typeERP: decl.typeERP || "non-erp",
    categorieERP: decl.categorieERP || "cat-1",
    // Adresse site
    adrNum: decl.adrNum || "",
    adrVoie: decl.adrVoie || "",
    adrComplement: decl.adrComplement || "",
    codePostal: decl.codePostal || "",
    codeInsee: decl.codeInsee || "",
    ville: decl.ville || "",
    latCoor1: decl.latCoor1 ?? null,
    longCoor1: decl.longCoor1 ?? null,
    xyPrecis: decl.xyPrecis ?? null,
    // Contact site
    tel1: decl.tel1 || "",
    tel1Prefix: decl.tel1Prefix || "fr",
    tel2: decl.tel2 || "",
    tel2Prefix: decl.tel2Prefix || "fr",
    siteEmail: decl.siteEmail || "",
    // Devices
    daeDevices: (decl.daeDevices || []).map((d: any) => deserializeDevice(d)),
  };
}
