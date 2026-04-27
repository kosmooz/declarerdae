import { describe, it, expect } from "vitest";
import {
  createEmptyDevice,
  serializeDevice,
  deserializeDevice,
} from "@/lib/declaration-types";

describe("createEmptyDevice", () => {
  it("creates a device with correct position", () => {
    const device = createEmptyDevice(3);
    expect(device.position).toBe(3);
    expect(device.localId).toBeTruthy();
    expect(device.nom).toBe("");
    expect(device.etatFonct).toBe("En fonctionnement");
    expect(device.hadMaintenance).toBe("NON");
  });

  it("generates unique localIds", () => {
    const d1 = createEmptyDevice(0);
    const d2 = createEmptyDevice(1);
    expect(d1.localId).not.toBe(d2.localId);
  });

  it("has default arrays for dispJ and dispH", () => {
    const device = createEmptyDevice(0);
    expect(device.dispJ).toEqual(["7j/7"]);
    expect(device.dispH).toEqual(["24h/24"]);
  });
});

describe("serializeDevice", () => {
  it("serializes dispJ and dispH as JSON strings", () => {
    const device = createEmptyDevice(0);
    device.fabRais = "Philips";
    device.modele = "HeartStart FRx";
    const result = serializeDevice(device);
    expect(result.dispJ).toBe(JSON.stringify(["7j/7"]));
    expect(result.dispH).toBe(JSON.stringify(["24h/24"]));
    expect(result.fabRais).toBe("Philips");
  });

  it("excludes localId, id, and declarationId from output", () => {
    const device = createEmptyDevice(0);
    const result = serializeDevice(device);
    expect(result).not.toHaveProperty("localId");
    expect(result).not.toHaveProperty("id");
    expect(result).not.toHaveProperty("declarationId");
    expect(result).not.toHaveProperty("hadMaintenance");
  });

  it("includes position and nom", () => {
    const device = createEmptyDevice(2);
    device.nom = "DAE-Accueil";
    const result = serializeDevice(device);
    expect(result.position).toBe(2);
    expect(result.nom).toBe("DAE-Accueil");
  });
});

describe("deserializeDevice", () => {
  it("converts server data to form state with defaults", () => {
    const serverData = {
      id: "abc-123",
      position: 1,
      nom: "DAE-1",
      fabRais: "ZOLL",
      modele: "AED Plus",
      numSerie: "SN123",
      etatFonct: "En fonctionnement",
      acc: null,
      dispJ: '["Lundi","Mardi"]',
      dispH: '["8h-18h"]',
    };
    const result = deserializeDevice(serverData);
    expect(result.id).toBe("abc-123");
    expect(result.nom).toBe("DAE-1");
    expect(result.dispJ).toEqual(["Lundi", "Mardi"]);
    expect(result.dispH).toEqual(["8h-18h"]);
    expect(result.acc).toBe("interieur"); // null → default from createEmptyDevice
  });

  it("uses fallback localId when provided", () => {
    const result = deserializeDevice({ position: 0 }, "my-local-id");
    expect(result.localId).toBe("my-local-id");
  });

  it("handles invalid JSON in dispJ/dispH gracefully", () => {
    const result = deserializeDevice({
      position: 0,
      dispJ: "not-json",
      dispH: null,
    });
    expect(result.dispJ).toEqual(["7j/7"]); // fallback
    expect(result.dispH).toEqual(["24h/24"]); // fallback
  });

  it("preserves array values when already arrays", () => {
    const result = deserializeDevice({
      position: 0,
      dispJ: ["Samedi"],
      dispH: ["10h-16h"],
    });
    expect(result.dispJ).toEqual(["Samedi"]);
    expect(result.dispH).toEqual(["10h-16h"]);
  });
});
