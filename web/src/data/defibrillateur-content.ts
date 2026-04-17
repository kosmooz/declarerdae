export const AED3_FEATURES = [
  {
    iconName: "Monitor" as const,
    title: "Écran LCD couleur",
    description:
      "Écran haute résolution avec instructions visuelles claires, guidant chaque étape du sauvetage en temps réel.",
  },
  {
    iconName: "Activity" as const,
    title: "Feedback CPR en temps réel",
    description:
      "Real CPR Help™ analyse la profondeur et la fréquence des compressions et corrige en direct.",
  },
  {
    iconName: "Cpu" as const,
    title: "Analyse automatique",
    description:
      "L'algorithme détecte le rythme cardiaque et ne délivre un choc que si nécessaire. Zéro risque d'erreur.",
  },
  {
    iconName: "Users" as const,
    title: "Mode adulte & pédiatrique",
    description:
      "Électrodes universelles CPR Uni-padz III : un seul jeu pour adultes et enfants, sans interversion possible.",
  },
];

export const AED3_SPECS = [
  { value: "200J", label: "Énergie de choc", description: "Onde rectiligne biphasique" },
  { value: "5 ans", label: "Autonomie batterie", description: "Pile lithium longue durée" },
  { value: "2.5 kg", label: "Poids total", description: "Ultra-léger et portable" },
  { value: "CE / FDA", label: "Certifications", description: "Normes internationales" },
  { value: "IP55", label: "Indice de protection", description: "Eau et poussière" },
  { value: "Auto-test", label: "Test quotidien", description: "Vérification automatique" },
];

export const AED3_USAGE_STEPS = [
  { step: 1, title: "Ouvrir le couvercle", description: "L'appareil s'allume automatiquement et commence les instructions vocales." },
  { step: 2, title: "Suivre les instructions", description: "L'écran LCD et la voix vous guident pas à pas, même sans formation." },
  { step: 3, title: "Placer les électrodes", description: "Les pictogrammes indiquent exactement où positionner les pads sur le patient." },
  { step: 4, title: "L'AED analyse et agit", description: "L'appareil analyse le rythme cardiaque et délivre le choc uniquement si nécessaire." },
];

export const AED3_CTA_POINTS = [
  { iconName: "ShieldCheck" as const, title: "Garantie 8 ans", description: "Constructeur ZOLL Medical" },
  { iconName: "CreditCard" as const, title: "89€ TTC / mois", description: "Tout compris, sans engagement" },
  { iconName: "GraduationCap" as const, title: "Formation incluse", description: "Certifiée Qualiopi" },
];
