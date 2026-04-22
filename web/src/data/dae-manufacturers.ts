/**
 * Liste officielle des fabricants et modeles de defibrillateurs DAE.
 * Source : fichier "Marque Modele Defibrillateur.xlsx"
 */

export interface DaeModel {
  name: string;
  warranty: string;
}

export interface DaeManufacturer {
  name: string;
  models: DaeModel[];
}

export const DAE_MANUFACTURERS: DaeManufacturer[] = [
  {
    name: "Cardiac Science (ZOLL)",
    models: [
      { name: "Powerheart G3", warranty: "7 ans" },
      { name: "Powerheart G5", warranty: "8 ans" },
    ],
  },
  {
    name: "CU Medical",
    models: [
      { name: "iPAD NF1200", warranty: "5 ans" },
      { name: "iPAD SP1", warranty: "5 ans" },
    ],
  },
  {
    name: "Defibtech",
    models: [
      { name: "Lifeline", warranty: "8 ans" },
      { name: "Lifeline VIEW", warranty: "8 ans" },
    ],
  },
  {
    name: "DefiSign",
    models: [
      { name: "DefiSign LIFE", warranty: "10 ans" },
    ],
  },
  {
    name: "HeartSine (Stryker)",
    models: [
      { name: "Samaritan PAD 300P", warranty: "8 ans" },
      { name: "Samaritan PAD 350P", warranty: "10 ans" },
      { name: "Samaritan PAD 360P", warranty: "10 ans" },
      { name: "Samaritan PAD 500P", warranty: "10 ans" },
    ],
  },
  {
    name: "LifeAz",
    models: [
      { name: "LifeAz Clark", warranty: "5 ans" },
    ],
  },
  {
    name: "Mindray",
    models: [
      { name: "BeneHeart C1A", warranty: "8 ans" },
      { name: "BeneHeart C2", warranty: "8 ans" },
      { name: "BeneHeart D1", warranty: "8 ans" },
    ],
  },
  {
    name: "Nihon Kohden",
    models: [
      { name: "AED-3100", warranty: "8 ans" },
    ],
  },
  {
    name: "Philips",
    models: [
      { name: "HeartStart FR2+", warranty: "5 ans" },
      { name: "HeartStart FRx", warranty: "8 ans" },
      { name: "HeartStart HS1", warranty: "8 ans" },
    ],
  },
  {
    name: "Primedic (Metrax)",
    models: [
      { name: "HeartSave myPAD", warranty: "8 ans" },
    ],
  },
  {
    name: "Progetti",
    models: [
      { name: "Rescue SAM", warranty: "8 ans" },
      { name: "Rescue SAM 4.0", warranty: "8 ans" },
    ],
  },
  {
    name: "Saverone",
    models: [
      { name: "Saver One", warranty: "6 ans" },
      { name: "Saver One D", warranty: "6 ans" },
      { name: "Saver One P", warranty: "6 ans" },
      { name: "Smarty Saver", warranty: "10 ans" },
    ],
  },
  {
    name: "Schiller",
    models: [
      { name: "FRED easy port", warranty: "10 ans" },
      { name: "FRED easyport plus", warranty: "10 ans" },
      { name: "FRED PA-1", warranty: "10 ans" },
    ],
  },
  {
    name: "Stryker / Physio-Control",
    models: [
      { name: "LIFEPAK 1000", warranty: "5 ans" },
      { name: "LIFEPAK CR Plus", warranty: "5 ans" },
      { name: "LIFEPAK CR2", warranty: "8 ans" },
    ],
  },
  {
    name: "Zoll",
    models: [
      { name: "AED 3", warranty: "8 ans" },
      { name: "AED Plus", warranty: "7 ans" },
    ],
  },
];

/** Valeur speciale pour l'option "Autre" dans les selects */
export const OTHER_VALUE = "__autre__";

/** Liste des noms de fabricants pour le select (triee alphabetiquement) */
export function getManufacturerNames(): string[] {
  return DAE_MANUFACTURERS.map((m) => m.name);
}

/** Liste des modeles pour un fabricant donne */
export function getModelsForManufacturer(manufacturerName: string): DaeModel[] {
  const mfr = DAE_MANUFACTURERS.find((m) => m.name === manufacturerName);
  return mfr?.models ?? [];
}
