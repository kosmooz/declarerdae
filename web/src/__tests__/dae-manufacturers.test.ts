import { describe, it, expect } from "vitest";
import {
  DAE_MANUFACTURERS,
  getModelsForManufacturer,
  OTHER_VALUE,
} from "@/data/dae-manufacturers";

describe("DAE_MANUFACTURERS", () => {
  it("contains at least 10 manufacturers", () => {
    expect(DAE_MANUFACTURERS.length).toBeGreaterThanOrEqual(10);
  });

  it("each manufacturer has a name and at least one model", () => {
    DAE_MANUFACTURERS.forEach((m) => {
      expect(m.name).toBeTruthy();
      expect(m.models.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("each model has a name", () => {
    DAE_MANUFACTURERS.forEach((m) => {
      m.models.forEach((model) => {
        expect(model.name).toBeTruthy();
      });
    });
  });
});

describe("getModelsForManufacturer", () => {
  it("returns models for a known manufacturer", () => {
    const models = getModelsForManufacturer("Philips");
    expect(models.length).toBeGreaterThan(0);
    expect(models[0]).toHaveProperty("name");
  });

  it("returns empty array for unknown manufacturer", () => {
    const models = getModelsForManufacturer("Fabricant Inconnu XYZ");
    expect(models).toEqual([]);
  });

  it("returns empty array for empty string", () => {
    const models = getModelsForManufacturer("");
    expect(models).toEqual([]);
  });
});

describe("OTHER_VALUE", () => {
  it("is a string that no manufacturer name matches", () => {
    expect(typeof OTHER_VALUE).toBe("string");
    expect(DAE_MANUFACTURERS.some((m) => m.name === OTHER_VALUE)).toBe(false);
  });
});
