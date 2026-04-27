import { describe, it, expect } from "vitest";
import {
  validateStepFields,
  validateDevice,
  formatDeviceErrors,
} from "@/lib/validation";
import { createEmptyDevice, INITIAL_FORM_DATA } from "@/lib/declaration-types";

describe("validateStepFields — step 1 complete", () => {
  it("returns no errors for valid step 1 data", () => {
    const data = {
      ...INITIAL_FORM_DATA,
      exptRais: "Ma Société",
      exptSiren: "123456789",
      exptEmail: "test@example.com",
      exptTel1: "0612345678",
      exptTel1Prefix: "fr",
    };
    const errors = validateStepFields(1, data);
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it("rejects non-French prefix on step 1", () => {
    const data = {
      ...INITIAL_FORM_DATA,
      exptRais: "Test",
      exptSiren: "123456789",
      exptEmail: "a@b.com",
      exptTel1: "0612345678",
      exptTel1Prefix: "us",
    };
    const errors = validateStepFields(1, data);
    expect(errors.exptTel1).toMatch(/indicatif/i);
  });
});

describe("validateStepFields — step 2 with tel2", () => {
  const baseStep2 = {
    ...INITIAL_FORM_DATA,
    adrVoie: "1 rue de la Paix",
    codePostal: "75001",
    ville: "Paris",
    tel1: "0612345678",
    tel1Prefix: "fr",
    latCoor1: 48.86,
    longCoor1: 2.34,
  };

  it("accepts valid step 2 without tel2", () => {
    const errors = validateStepFields(2, { ...baseStep2, tel2: "" });
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it("validates tel2 format when provided", () => {
    const errors = validateStepFields(2, { ...baseStep2, tel2: "123" });
    expect(errors.tel2).toMatch(/9 chiffres/);
  });

  it("validates tel2 prefix when provided", () => {
    const errors = validateStepFields(2, {
      ...baseStep2,
      tel2: "0698765432",
      tel2Prefix: "de",
    });
    expect(errors.tel2).toMatch(/indicatif/i);
  });

  it("accepts valid tel2 with French prefix", () => {
    const errors = validateStepFields(2, {
      ...baseStep2,
      tel2: "0698765432",
      tel2Prefix: "re",
    });
    expect(errors.tel2).toBeUndefined();
  });
});

describe("validateStepFields — step 3 with multiple devices", () => {
  it("reports errors for each incomplete device", () => {
    const d1 = createEmptyDevice(0);
    d1.nom = "DAE Accueil";
    // missing fabRais, modele, etc.

    const d2 = createEmptyDevice(1);
    d2.nom = "DAE Etage";
    d2.fabRais = "Philips";
    // missing modele, numSerie, etc.

    const data = { ...INITIAL_FORM_DATA, daeDevices: [d1, d2] };
    const errors = validateStepFields(3, data);

    expect(errors._device_0).toMatch(/DAE 1 \(DAE Accueil\)/);
    expect(errors._device_0).toMatch(/fabricant/);
    expect(errors._device_1).toMatch(/DAE 2 \(DAE Etage\)/);
    expect(errors._device_1).toMatch(/modèle/);
    expect(errors._device_1).not.toMatch(/fabricant/); // Philips is set
  });

  it("passes step 3 with fully valid devices", () => {
    const d = createEmptyDevice(0);
    d.nom = "DAE-1";
    d.fabRais = "Philips";
    d.modele = "FRx";
    d.numSerie = "SN001";
    d.etatFonct = "En fonctionnement";
    d.acc = "interieur";
    d.accLib = "OUI";
    d.daeMobile = "NON";
    d.dermnt = "2024-06-01";

    const data = { ...INITIAL_FORM_DATA, daeDevices: [d] };
    const errors = validateStepFields(3, data);
    expect(Object.keys(errors)).toHaveLength(0);
  });
});

describe("formatDeviceErrors — edge cases", () => {
  it("uses 'sans nom' for unnamed devices", () => {
    const d = createEmptyDevice(0);
    d.nom = "";
    d.dispJ = [];
    const errors = formatDeviceErrors([d]);
    expect(errors[0]).toMatch(/sans nom/);
  });

  it("handles multiple devices correctly", () => {
    const d1 = createEmptyDevice(0);
    d1.nom = "A";
    const d2 = createEmptyDevice(1);
    d2.nom = "B";
    d2.fabRais = "X";
    d2.modele = "Y";
    d2.numSerie = "Z";
    d2.dermnt = "2024-01-01";
    // d2 is still missing etatFonct? No, default is "En fonctionnement"
    // What about acc/accLib/daeMobile? Defaults set

    const errors = formatDeviceErrors([d1, d2]);
    // d1 has many missing, d2 has none (all defaults + filled)
    expect(errors.length).toBe(1);
    expect(errors[0]).toMatch(/DAE 1/);
  });
});
