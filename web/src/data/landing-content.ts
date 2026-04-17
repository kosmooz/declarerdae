export const IMAGES = {
  logo: "/images/logo-staraid.png",
  heroBg: "/images/hero-bg.webp",
  cardiacStats: "/images/cardiac-stats.webp",
  teamFormation: "/images/team-formation.webp",
  maintenanceTech: "/images/maintenance-tech.webp",
  ctaBg: "/images/cta-bg.webp",
  defibArmoire: "/images/defibrillateur-armoire.png",
  secoursTerrain: "/images/secours-terrain.png",
  zollAed3: "/images/zoll-aed3.jpg",
  defibLineup: "/images/defibrillateurs-lineup.png",
};

export const NAV_ITEMS: { id: string; label: string; href?: string }[] = [
  { id: "offre", label: "L'offre" },
  { id: "produit", label: "Le produit" },
  { id: "reglementation", label: "Réglementation" },
  { id: "temoignages", label: "Avis clients" },
  { id: "faq", label: "FAQ" },
  { id: "blog", label: "Blog", href: "/blog" },
];

export const STATS = [
  { end: 50000, label: "Arrêts cardiaques par an en France", suffix: "" },
  { end: 7, label: "Minutes avant des lésions irréversibles", suffix: " min" },
  { end: 1000, label: "Structures équipées par STAR aid", suffix: "+" },
  { end: 13, label: "Années d'expérience à La Réunion", suffix: " ans" },
];

export const HERO_FEATURES = [
  "Défibrillateur ZOLL AED Plus",
  "Installation sur site à La Réunion",
  "Armoire murale + signalétique",
  "Maintenance annuelle sur place",
  "Formation digitale certifiée",
  "Intervention sous 48h",
  "Hotline 24h/24, 7j/7",
  "Enregistrement Géo'DAE",
  "Attestation immédiate",
];

export const HERO_BADGES = [
  "Sans engagement",
  "Sans caution",
  "Installation incluse",
  "Hotline 24h/24",
];

export const SCENARIOS = [
  {
    scenario: "Votre meilleur collègue s'écroule devant vos yeux au bureau.",
    question: "Savez-vous quoi faire dans les 3 prochaines minutes ?",
    iconName: "Building2" as const,
  },
  {
    scenario: "Un membre de votre famille s'effondre au restaurant, à côté d'un défibrillateur que personne ne sait utiliser.",
    question: "Qui va oser appuyer sur le bouton ?",
    iconName: "Heart" as const,
  },
  {
    scenario: "Un sportif tombe soudainement dans votre salle de sport ou sur votre terrain.",
    question: "Votre établissement est-il équipé et en conformité ?",
    iconName: "Activity" as const,
  },
];

export const PRODUCT_SPECS = [
  { label: "Technologie exclusive", value: "Real CPR Help™ — guidage vocal et visuel en temps réel", iconName: "Activity" as const },
  { label: "Résistance", value: "IP55 — résistant à l'eau et à la poussière", iconName: "ShieldCheck" as const },
  { label: "Garantie", value: "7 ans constructeur", iconName: "Award" as const },
  { label: "Poids", value: "3,1 kg — compact et portable", iconName: "Truck" as const },
];

export const INCLUDED_FEATURES = [
  { iconName: "Zap" as const, text: "Défibrillateur ZOLL certifié" },
  { iconName: "Building2" as const, text: "Installation sur site" },
  { iconName: "Eye" as const, text: "Armoire murale + signalétique" },
  { iconName: "FileCheck" as const, text: "Enregistrement Géo'DAE" },
  { iconName: "Wrench" as const, text: "Maintenance préventive annuelle" },
  { iconName: "Timer" as const, text: "Intervention curative sous 48h" },
  { iconName: "Heart" as const, text: "Remplacement consommables" },
  { iconName: "GraduationCap" as const, text: "Formation digitale certifiée" },
  { iconName: "Award" as const, text: "Attestation immédiate" },
  { iconName: "PhoneCall" as const, text: "Hotline 24h/24, 7j/7" },
];

export const ERP_CATEGORIES = [
  { iconName: "Building2" as const, title: "ERP catégorie 1 à 3", desc: "Obligation depuis le 1er janvier 2020" },
  { iconName: "Users" as const, title: "ERP catégorie 4", desc: "Obligation depuis le 1er janvier 2021" },
  { iconName: "MapPin" as const, title: "Certains ERP cat. 5", desc: "Obligation depuis le 1er janvier 2022" },
  { iconName: "Heart" as const, title: "Associations sportives", desc: "Obligation depuis 2020" },
];

export const TESTIMONIALS = [
  {
    name: "Yoan D.",
    role: "Chef d'entreprise",
    company: "Ocorner — La Réunion",
    quote: "La seule chose qui a sauvé cette personne, c'est d'avoir un défibrillateur sur place. C'est un investissement dont on ne revient jamais dessus.",
  },
  {
    name: "Adrien N.",
    role: "Pompier",
    company: "Aéroport Roland Garros — Sainte-Marie",
    quote: "L'appareil va dicter toutes les actions à faire pour une personne qui n'est pas forcément formée. Sauver une vie, c'est à la portée de tous.",
  },
  {
    name: "Lhoucen E.",
    role: "Président",
    company: "Tennis Club de Champ Fleuri — Saint-Denis",
    quote: "Voilà la bête qui nous a permis de sauver une vie. Le défibrillateur, c'est comme une assurance. On se demande à quoi ça sert… jusqu'au moment où ça sauve une vie.",
  },
];

export const STEPS = [
  { step: "1", title: "Souscription", desc: "En 3 minutes, signez votre contrat en ligne ou par téléphone.", iconName: "FileCheck" as const },
  { step: "2", title: "Contact", desc: "Un conseiller à La Réunion vous contacte sous 24h.", iconName: "Headphones" as const },
  { step: "3", title: "Formation", desc: "Accès à votre formation digitale certifiée Qualiopi.", iconName: "GraduationCap" as const },
  { step: "4", title: "Installation", desc: "Un technicien pose le matériel avec armoire et signalétique.", iconName: "Wrench" as const },
];

export const TRUST_LOGOS = [
  "McDonald's", "MyGym", "Réunion 1ère", "SCPR",
  "TotalEnergies", "Conseil Régional", "Aéroport Roland Garros",
];

export const CERTIFICATIONS = [
  { iconName: "Award" as const, title: "Certifié Qualiopi", desc: "Organisme de formation reconnu par l'État" },
  { iconName: "ShieldCheck" as const, title: "Distributeur officiel", desc: "ZOLL, MINDRAY, Cardiac Science" },
  { iconName: "BookOpen" as const, title: "Financé FEDER", desc: "Programme FEDER-FSE+ Réunion" },
];

export const FAQ_ITEMS = [
  { q: "Suis-je obligé d'avoir un défibrillateur dans mon établissement à La Réunion ?", a: "Oui, si vous êtes un ERP (Établissement Recevant du Public). Depuis le décret n°2018-1186, les ERP de catégorie 1 à 4 et certains de catégorie 5 sont tenus de s'équiper d'un DAE. Les entreprises ont également une obligation de sécurité envers leurs salariés (Art. R4224-15 du Code du travail). STAR aid vous accompagne pour vérifier votre obligation." },
  { q: "Quelles sont les sanctions si je ne suis pas équipé ?", a: "Le non-respect peut entraîner la fermeture de votre établissement, des amendes jusqu'à 75 000€ et jusqu'à 5 ans d'emprisonnement. En cas d'accident sans DAE, votre responsabilité civile et pénale peut être engagée." },
  { q: "Que comprend l'abonnement à 89€ TTC/mois ?", a: "L'abonnement inclut le défibrillateur ZOLL AED Plus, l'installation sur site, l'armoire murale avec signalétique, l'enregistrement Géo'DAE, la maintenance préventive annuelle, l'intervention curative sous 48h, le remplacement de tous les consommables, la formation digitale certifiée Qualiopi, l'attestation immédiate et une hotline 24h/24. Tout est inclus." },
  { q: "Y a-t-il un engagement de durée ?", a: "Non. L'abonnement STAR aid est sans engagement et sans caution. Vous pouvez résilier à tout moment." },
  { q: "Qui peut utiliser un défibrillateur ?", a: "Tout le monde. Le décret 2007-705 autorise toute personne à utiliser un DAE, même sans formation. Le ZOLL AED Plus guide l'utilisateur pas à pas avec des instructions vocales claires. Il est impossible de blesser quelqu'un : l'appareil ne délivre un choc que si nécessaire." },
  { q: "Que se passe-t-il si le défibrillateur est utilisé ?", a: "STAR aid intervient sous 48h pour remettre votre équipement en état. Les consommables utilisés sont remplacés sans frais. Un matériel de prêt est mis à disposition pendant l'intervention." },
  { q: "Comment se passe la maintenance ?", a: "Trois types : préventive (contrôle annuel documenté), curative (intervention sous 48h avec prêt de matériel) et post-utilisation (remplacement des consommables). Toutes les pièces sont certifiées fabricant." },
  { q: "Intervenez-vous sur toute La Réunion ?", a: "Oui. Basés à Saint-Paul, nous intervenons sur toute l'île. Nous couvrons également la Guadeloupe et Mayotte." },
  { q: "Quelles formations proposez-vous ?", a: "SST, initiation aux gestes de premiers secours, formation défibrillateur, incendie et évacuation, habilitations électriques, gestes et postures, HACCP. La formation digitale est incluse, les formations sur site en option." },
];

export const CONTACT = {
  phone: "+262 262 150 950",
  phoneHref: "tel:+262262150950",
  email: "info@star-aid.fr",
  address: "60 Chau. Royale, Saint-Paul 97460",
  siret: "99949176400018",
  hours: {
    weekdays: "Lun - Jeu : 07h30 - 16h30",
    friday: "Vendredi : 07h30 - 15h30",
    weekend: "Sam - Dim : Fermé",
  },
  zones: "La Réunion · Guadeloupe · Mayotte",
};
