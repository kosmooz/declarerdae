import { describe, it, expect } from "vitest";
import {
  isPhoneValid,
  isPrefixValid,
  GEODAE_PREFIXES,
  validateDevice,
  formatDeviceErrors,
  validateStepFields,
} from "@/lib/validation";
import { createEmptyDevice } from "@/lib/declaration-types";

describe("isPhoneValid", () => {
  it("accepts 9-digit phone after stripping leading 0", () => {
    expect(isPhoneValid("0612345678")).toBe(true);
    expect(isPhoneValid("612345678")).toBe(true);
  });

  it("accepts phone with spaces/dashes/dots", () => {
    expect(isPhoneValid("06 12 34 56 78")).toBe(true);
    expect(isPhoneValid("06-12-34-56-78")).toBe(true);
    expect(isPhoneValid("06.12.34.56.78")).toBe(true);
  });

  it("rejects too short or too long", () => {
    expect(isPhoneValid("06123")).toBe(false);
    expect(isPhoneValid("06123456789999")).toBe(false);
  });

  it("rejects empty/null/undefined", () => {
    expect(isPhoneValid("")).toBe(false);
    expect(isPhoneValid(null)).toBe(false);
    expect(isPhoneValid(undefined)).toBe(false);
    expect(isPhoneValid("   ")).toBe(false);
  });
});

describe("isPrefixValid", () => {
  it("accepts French territory codes", () => {
    expect(isPrefixValid("fr")).toBe(true);
    expect(isPrefixValid("FR")).toBe(true);
    expect(isPrefixValid("re")).toBe(true);
    expect(isPrefixValid("gp")).toBe(true);
  });

  it("rejects non-French codes", () => {
    expect(isPrefixValid("us")).toBe(false);
    expect(isPrefixValid("de")).toBe(false);
  });

  it("rejects empty/null", () => {
    expect(isPrefixValid("")).toBe(false);
    expect(isPrefixValid(null)).toBe(false);
  });
});

describe("GEODAE_PREFIXES", () => {
  it("contains all French territories", () => {
    expect(GEODAE_PREFIXES.has("fr")).toBe(true);
    expect(GEODAE_PREFIXES.has("re")).toBe(true); // La Reunion
    expect(GEODAE_PREFIXES.has("gp")).toBe(true); // Guadeloupe
    expect(GEODAE_PREFIXES.has("mq")).toBe(true); // Martinique
    expect(GEODAE_PREFIXES.has("yt")).toBe(true); // Mayotte
    expect(GEODAE_PREFIXES.has("nc")).toBe(true); // Nouvelle-Caledonie
  });
});

describe("validateDevice", () => {
  it("returns missing fields for empty device (nom, fabricant, etc.)", () => {
    const device = createEmptyDevice(0);
    device.dispJ = [];
    device.dispH = [];
    const missing = validateDevice(device);
    expect(missing).toContain("nom");
    expect(missing).toContain("fabricant");
    expect(missing).toContain("n\u00b0 s\u00e9rie");
    // acc, accLib, daeMobile have defaults ("interieur", "OUI", "NON") so not missing
    expect(missing).not.toContain("environnement");
    expect(missing).toContain("jours de disponibilit\u00e9");
    expect(missing).toContain("heures de disponibilit\u00e9");
  });

  it("returns empty array for complete device", () => {
    const device = createEmptyDevice(0);
    device.nom = "DAE-1";
    device.fabRais = "Philips";
    device.modele = "FRx";
    device.numSerie = "SN123";
    device.etatFonct = "En fonctionnement";
    device.acc = "interieur";
    device.accLib = "OUI";
    device.daeMobile = "NON";
    device.dermnt = "2024-01-15";
    device.dispJ = ["7j/7"];
    device.dispH = ["24h/24"];
    const missing = validateDevice(device);
    expect(missing).toEqual([]);
  });

  it("returns 'date de maintenance' when hadMaintenance is OUI and dermnt empty", () => {
    const device = createEmptyDevice(0);
    device.nom = "D";
    device.fabRais = "F";
    device.modele = "M";
    device.numSerie = "S";
    device.acc = "i";
    device.accLib = "O";
    device.daeMobile = "N";
    device.hadMaintenance = "OUI";
    device.dermnt = "";
    const missing = validateDevice(device);
    expect(missing).toContain("date de maintenance");
    expect(missing).not.toContain("date d'installation");
  });

  it("returns 'date d'installation' when hadMaintenance is NON and dermnt empty", () => {
    const device = createEmptyDevice(0);
    device.nom = "D";
    device.fabRais = "F";
    device.modele = "M";
    device.numSerie = "S";
    device.acc = "i";
    device.accLib = "O";
    device.daeMobile = "N";
    device.hadMaintenance = "NON";
    device.dermnt = "";
    const missing = validateDevice(device);
    expect(missing).toContain("date d'installation");
    expect(missing).not.toContain("date de maintenance");
  });
});

describe("formatDeviceErrors", () => {
  it("formats errors with device name and index", () => {
    const device = createEmptyDevice(0);
    device.nom = "Mon DAE";
    device.dispJ = [];
    device.dispH = [];
    const errors = formatDeviceErrors([device]);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/DAE 1 \(Mon DAE\)/);
  });

  it("returns empty for valid devices", () => {
    const device = createEmptyDevice(0);
    device.nom = "D";
    device.fabRais = "F";
    device.modele = "M";
    device.numSerie = "S";
    device.etatFonct = "En fonctionnement";
    device.acc = "i";
    device.accLib = "O";
    device.daeMobile = "N";
    device.dermnt = "2024-01-01";
    const errors = formatDeviceErrors([device]);
    expect(errors).toEqual([]);
  });
});

describe("validateStepFields", () => {
  it("requires raison sociale on step 1", () => {
    const data = {
      exptRais: "",
      exptSiren: "123456789",
      exptEmail: "a@b.com",
      exptTel1: "0612345678",
      daeDevices: [],
    } as any;
    const errors = validateStepFields(1, data);
    expect(errors.exptRais).toBeTruthy();
  });

  it("validates phone format on step 1", () => {
    const data = {
      exptRais: "Test",
      exptSiren: "123456789",
      exptEmail: "a@b.com",
      exptTel1: "123",
      daeDevices: [],
    } as any;
    const errors = validateStepFields(1, data);
    expect(errors.exptTel1).toMatch(/9 chiffres/);
  });

  it("requires GPS on step 2", () => {
    const data = {
      adrVoie: "1 rue",
      codePostal: "75001",
      ville: "Paris",
      tel1: "0612345678",
      tel1Prefix: "fr",
      latCoor1: null,
      longCoor1: null,
      daeDevices: [],
    } as any;
    const errors = validateStepFields(2, data);
    expect(errors.latCoor1).toMatch(/GPS/);
  });

  it("requires at least one device on step 3", () => {
    const data = { daeDevices: [] } as any;
    const errors = validateStepFields(3, data);
    expect(errors._devices).toBeTruthy();
  });
});
