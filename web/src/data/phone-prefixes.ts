/**
 * Complete list of 249 countries/territories with ISO 3166-1 alpha-2 codes
 * and international dialling prefixes.
 *
 * Flag SVGs are expected at /flags/{alpha2}.svg  (lowercase).
 */

export interface PhonePrefix {
  /** ISO 3166-1 alpha-2 (lowercase) — matches flag filename */
  code: string;
  /** International dialling prefix (digits only, no "+") */
  dial: string;
  /** Country / territory name in French */
  name: string;
  /** Example local phone number (optional) */
  ph?: string;
}

/** Get a placeholder phone number for the given country code */
export function getPhonePlaceholder(code: string): string {
  const entry = PHONE_PREFIXES.find((p) => p.code === code);
  return entry?.ph || "";
}

const PHONE_PREFIXES: PhonePrefix[] = [
  // ── A ──────────────────────────────────────────────────────────────
  { code: "af", dial: "93",   name: "Afghanistan" },
  { code: "za", dial: "27",   name: "Afrique du Sud" },
  { code: "al", dial: "355",  name: "Albanie" },
  { code: "dz", dial: "213",  name: "Algerie", ph: "0555 12 34 56" },
  { code: "de", dial: "49",   name: "Allemagne", ph: "0151 1234 5678" },
  { code: "ad", dial: "376",  name: "Andorre" },
  { code: "ao", dial: "244",  name: "Angola" },
  { code: "ai", dial: "1264", name: "Anguilla" },
  { code: "aq", dial: "672",  name: "Antarctique" },
  { code: "ag", dial: "1268", name: "Antigua-et-Barbuda" },
  { code: "sa", dial: "966",  name: "Arabie saoudite" },
  { code: "ar", dial: "54",   name: "Argentine" },
  { code: "am", dial: "374",  name: "Armenie" },
  { code: "aw", dial: "297",  name: "Aruba" },
  { code: "au", dial: "61",   name: "Australie", ph: "0412 345 678" },
  { code: "at", dial: "43",   name: "Autriche" },
  { code: "az", dial: "994",  name: "Azerbaidjan" },

  // ── B ──────────────────────────────────────────────────────────────
  { code: "bs", dial: "1242", name: "Bahamas" },
  { code: "bh", dial: "973",  name: "Bahrein" },
  { code: "bd", dial: "880",  name: "Bangladesh" },
  { code: "bb", dial: "1246", name: "Barbade" },
  { code: "by", dial: "375",  name: "Bielorussie" },
  { code: "be", dial: "32",   name: "Belgique", ph: "0470 12 34 56" },
  { code: "bz", dial: "501",  name: "Belize" },
  { code: "bj", dial: "229",  name: "Benin" },
  { code: "bm", dial: "1441", name: "Bermudes" },
  { code: "bt", dial: "975",  name: "Bhoutan" },
  { code: "bo", dial: "591",  name: "Bolivie" },
  { code: "bq", dial: "599",  name: "Bonaire, Saint-Eustache et Saba" },
  { code: "ba", dial: "387",  name: "Bosnie-Herzegovine" },
  { code: "bw", dial: "267",  name: "Botswana" },
  { code: "bv", dial: "47",   name: "Ile Bouvet" },
  { code: "br", dial: "55",   name: "Bresil", ph: "11 91234 5678" },
  { code: "bn", dial: "673",  name: "Brunei" },
  { code: "bg", dial: "359",  name: "Bulgarie" },
  { code: "bf", dial: "226",  name: "Burkina Faso" },
  { code: "bi", dial: "257",  name: "Burundi" },

  // ── C ──────────────────────────────────────────────────────────────
  { code: "kh", dial: "855",  name: "Cambodge" },
  { code: "cm", dial: "237",  name: "Cameroun", ph: "6 70 12 34 56" },
  { code: "ca", dial: "1",    name: "Canada", ph: "514 123 4567" },
  { code: "cv", dial: "238",  name: "Cap-Vert" },
  { code: "ky", dial: "1345", name: "Iles Caimans" },
  { code: "cf", dial: "236",  name: "Republique centrafricaine" },
  { code: "cl", dial: "56",   name: "Chili" },
  { code: "cn", dial: "86",   name: "Chine", ph: "131 1234 5678" },
  { code: "cx", dial: "61",   name: "Ile Christmas" },
  { code: "cy", dial: "357",  name: "Chypre" },
  { code: "cc", dial: "61",   name: "Iles Cocos" },
  { code: "co", dial: "57",   name: "Colombie" },
  { code: "km", dial: "269",  name: "Comores", ph: "321 23 45" },
  { code: "cg", dial: "242",  name: "Congo" },
  { code: "cd", dial: "243",  name: "Republique democratique du Congo" },
  { code: "ck", dial: "682",  name: "Iles Cook" },
  { code: "kr", dial: "82",   name: "Coree du Sud" },
  { code: "kp", dial: "850",  name: "Coree du Nord" },
  { code: "cr", dial: "506",  name: "Costa Rica" },
  { code: "ci", dial: "225",  name: "Cote d'Ivoire", ph: "07 12 34 56 78" },
  { code: "hr", dial: "385",  name: "Croatie" },
  { code: "cu", dial: "53",   name: "Cuba" },
  { code: "cw", dial: "599",  name: "Curacao" },

  // ── D ──────────────────────────────────────────────────────────────
  { code: "dk", dial: "45",   name: "Danemark" },
  { code: "dj", dial: "253",  name: "Djibouti" },
  { code: "dm", dial: "1767", name: "Dominique" },
  { code: "do", dial: "1809", name: "Republique dominicaine" },

  // ── E ──────────────────────────────────────────────────────────────
  { code: "eg", dial: "20",   name: "Egypte" },
  { code: "sv", dial: "503",  name: "Salvador" },
  { code: "ae", dial: "971",  name: "Emirats arabes unis" },
  { code: "ec", dial: "593",  name: "Equateur" },
  { code: "er", dial: "291",  name: "Erythree" },
  { code: "es", dial: "34",   name: "Espagne", ph: "612 34 56 78" },
  { code: "ee", dial: "372",  name: "Estonie" },
  { code: "sz", dial: "268",  name: "Eswatini" },
  { code: "us", dial: "1",    name: "Etats-Unis", ph: "202 555 0123" },
  { code: "et", dial: "251",  name: "Ethiopie" },

  // ── F ──────────────────────────────────────────────────────────────
  { code: "fk", dial: "500",  name: "Iles Falkland" },
  { code: "fo", dial: "298",  name: "Iles Feroe" },
  { code: "fj", dial: "679",  name: "Fidji" },
  { code: "fi", dial: "358",  name: "Finlande" },
  { code: "fr", dial: "33",   name: "France", ph: "06 12 34 56 78" },

  // ── G ──────────────────────────────────────────────────────────────
  { code: "ga", dial: "241",  name: "Gabon" },
  { code: "gm", dial: "220",  name: "Gambie" },
  { code: "ge", dial: "995",  name: "Georgie" },
  { code: "gs", dial: "500",  name: "Georgie du Sud-et-les iles Sandwich du Sud" },
  { code: "gh", dial: "233",  name: "Ghana" },
  { code: "gi", dial: "350",  name: "Gibraltar" },
  { code: "gr", dial: "30",   name: "Grece" },
  { code: "gd", dial: "1473", name: "Grenade" },
  { code: "gl", dial: "299",  name: "Groenland" },
  { code: "gp", dial: "590",  name: "Guadeloupe", ph: "0690 12 34 56" },
  { code: "gu", dial: "1671", name: "Guam" },
  { code: "gt", dial: "502",  name: "Guatemala" },
  { code: "gg", dial: "44",   name: "Guernesey" },
  { code: "gn", dial: "224",  name: "Guinee" },
  { code: "gw", dial: "245",  name: "Guinee-Bissau" },
  { code: "gq", dial: "240",  name: "Guinee equatoriale" },
  { code: "gy", dial: "592",  name: "Guyana" },
  { code: "gf", dial: "594",  name: "Guyane francaise", ph: "0694 12 34 56" },

  // ── H ──────────────────────────────────────────────────────────────
  { code: "ht", dial: "509",  name: "Haiti" },
  { code: "hm", dial: "672",  name: "Iles Heard-et-MacDonald" },
  { code: "hn", dial: "504",  name: "Honduras" },
  { code: "hk", dial: "852",  name: "Hong Kong" },
  { code: "hu", dial: "36",   name: "Hongrie" },

  // ── I ──────────────────────────────────────────────────────────────
  { code: "in", dial: "91",   name: "Inde", ph: "98765 43210" },
  { code: "id", dial: "62",   name: "Indonesie" },
  { code: "iq", dial: "964",  name: "Irak" },
  { code: "ir", dial: "98",   name: "Iran" },
  { code: "ie", dial: "353",  name: "Irlande" },
  { code: "is", dial: "354",  name: "Islande" },
  { code: "il", dial: "972",  name: "Israel" },
  { code: "it", dial: "39",   name: "Italie", ph: "312 345 6789" },

  // ── J ──────────────────────────────────────────────────────────────
  { code: "jm", dial: "1876", name: "Jamaique" },
  { code: "jp", dial: "81",   name: "Japon", ph: "090 1234 5678" },
  { code: "je", dial: "44",   name: "Jersey" },
  { code: "jo", dial: "962",  name: "Jordanie" },

  // ── K ──────────────────────────────────────────────────────────────
  { code: "kz", dial: "7",    name: "Kazakhstan" },
  { code: "ke", dial: "254",  name: "Kenya" },
  { code: "kg", dial: "996",  name: "Kirghizistan" },
  { code: "ki", dial: "686",  name: "Kiribati" },
  { code: "kw", dial: "965",  name: "Koweit" },

  // ── L ──────────────────────────────────────────────────────────────
  { code: "la", dial: "856",  name: "Laos" },
  { code: "ls", dial: "266",  name: "Lesotho" },
  { code: "lv", dial: "371",  name: "Lettonie" },
  { code: "lb", dial: "961",  name: "Liban" },
  { code: "lr", dial: "231",  name: "Liberia" },
  { code: "ly", dial: "218",  name: "Libye" },
  { code: "li", dial: "423",  name: "Liechtenstein" },
  { code: "lt", dial: "370",  name: "Lituanie" },
  { code: "lu", dial: "352",  name: "Luxembourg" },

  // ── M ──────────────────────────────────────────────────────────────
  { code: "mo", dial: "853",  name: "Macao" },
  { code: "mk", dial: "389",  name: "Macedoine du Nord" },
  { code: "mg", dial: "261",  name: "Madagascar", ph: "032 12 345 67" },
  { code: "my", dial: "60",   name: "Malaisie" },
  { code: "mw", dial: "265",  name: "Malawi" },
  { code: "mv", dial: "960",  name: "Maldives" },
  { code: "ml", dial: "223",  name: "Mali" },
  { code: "mt", dial: "356",  name: "Malte" },
  { code: "im", dial: "44",   name: "Ile de Man" },
  { code: "mp", dial: "1670", name: "Iles Mariannes du Nord" },
  { code: "ma", dial: "212",  name: "Maroc", ph: "0612 34 56 78" },
  { code: "mh", dial: "692",  name: "Iles Marshall" },
  { code: "mq", dial: "596",  name: "Martinique", ph: "0696 12 34 56" },
  { code: "mu", dial: "230",  name: "Maurice", ph: "5251 2345" },
  { code: "mr", dial: "222",  name: "Mauritanie" },
  { code: "yt", dial: "262",  name: "Mayotte", ph: "0639 12 34 56" },
  { code: "mx", dial: "52",   name: "Mexique" },
  { code: "fm", dial: "691",  name: "Micronesie" },
  { code: "md", dial: "373",  name: "Moldavie" },
  { code: "mc", dial: "377",  name: "Monaco" },
  { code: "mn", dial: "976",  name: "Mongolie" },
  { code: "me", dial: "382",  name: "Montenegro" },
  { code: "ms", dial: "1664", name: "Montserrat" },
  { code: "mz", dial: "258",  name: "Mozambique" },
  { code: "mm", dial: "95",   name: "Myanmar" },

  // ── N ──────────────────────────────────────────────────────────────
  { code: "na", dial: "264",  name: "Namibie" },
  { code: "nr", dial: "674",  name: "Nauru" },
  { code: "np", dial: "977",  name: "Nepal" },
  { code: "ni", dial: "505",  name: "Nicaragua" },
  { code: "ne", dial: "227",  name: "Niger" },
  { code: "ng", dial: "234",  name: "Nigeria" },
  { code: "nu", dial: "683",  name: "Niue" },
  { code: "nf", dial: "672",  name: "Ile Norfolk" },
  { code: "no", dial: "47",   name: "Norvege" },
  { code: "nc", dial: "687",  name: "Nouvelle-Caledonie", ph: "75 12 34" },
  { code: "nz", dial: "64",   name: "Nouvelle-Zelande" },

  // ── O ──────────────────────────────────────────────────────────────
  { code: "om", dial: "968",  name: "Oman" },
  { code: "ug", dial: "256",  name: "Ouganda" },
  { code: "uz", dial: "998",  name: "Ouzbekistan" },

  // ── P ──────────────────────────────────────────────────────────────
  { code: "pk", dial: "92",   name: "Pakistan" },
  { code: "pw", dial: "680",  name: "Palaos" },
  { code: "ps", dial: "970",  name: "Palestine" },
  { code: "pa", dial: "507",  name: "Panama" },
  { code: "pg", dial: "675",  name: "Papouasie-Nouvelle-Guinee" },
  { code: "py", dial: "595",  name: "Paraguay" },
  { code: "nl", dial: "31",   name: "Pays-Bas", ph: "06 1234 5678" },
  { code: "pe", dial: "51",   name: "Perou" },
  { code: "ph", dial: "63",   name: "Philippines" },
  { code: "pn", dial: "64",   name: "Iles Pitcairn" },
  { code: "pl", dial: "48",   name: "Pologne" },
  { code: "pf", dial: "689",  name: "Polynesie francaise", ph: "87 12 34 56" },
  { code: "pr", dial: "1787", name: "Porto Rico" },
  { code: "pt", dial: "351",  name: "Portugal", ph: "912 345 678" },

  // ── Q ──────────────────────────────────────────────────────────────
  { code: "qa", dial: "974",  name: "Qatar" },

  // ── R ──────────────────────────────────────────────────────────────
  { code: "re", dial: "262",  name: "La Reunion", ph: "0692 12 34 56" },
  { code: "ro", dial: "40",   name: "Roumanie" },
  { code: "gb", dial: "44",   name: "Royaume-Uni", ph: "07911 123456" },
  { code: "ru", dial: "7",    name: "Russie" },
  { code: "rw", dial: "250",  name: "Rwanda" },

  // ── S ──────────────────────────────────────────────────────────────
  { code: "eh", dial: "212",  name: "Sahara occidental" },
  { code: "bl", dial: "590",  name: "Saint-Barthelemy", ph: "0690 12 34 56" },
  { code: "kn", dial: "1869", name: "Saint-Christophe-et-Nieves" },
  { code: "sm", dial: "378",  name: "Saint-Marin" },
  { code: "mf", dial: "590",  name: "Saint-Martin", ph: "0690 12 34 56" },
  { code: "sx", dial: "1721", name: "Saint-Martin (partie neerlandaise)" },
  { code: "pm", dial: "508",  name: "Saint-Pierre-et-Miquelon", ph: "55 12 34" },
  { code: "va", dial: "379",  name: "Saint-Siege" },
  { code: "vc", dial: "1784", name: "Saint-Vincent-et-les-Grenadines" },
  { code: "lc", dial: "1758", name: "Sainte-Lucie" },
  { code: "sh", dial: "290",  name: "Sainte-Helene" },
  { code: "sb", dial: "677",  name: "Salomon" },
  { code: "ws", dial: "685",  name: "Samoa" },
  { code: "as", dial: "1684", name: "Samoa americaines" },
  { code: "st", dial: "239",  name: "Sao Tome-et-Principe" },
  { code: "sn", dial: "221",  name: "Senegal", ph: "77 123 45 67" },
  { code: "rs", dial: "381",  name: "Serbie" },
  { code: "sc", dial: "248",  name: "Seychelles" },
  { code: "sl", dial: "232",  name: "Sierra Leone" },
  { code: "sg", dial: "65",   name: "Singapour" },
  { code: "sk", dial: "421",  name: "Slovaquie" },
  { code: "si", dial: "386",  name: "Slovenie" },
  { code: "so", dial: "252",  name: "Somalie" },
  { code: "sd", dial: "249",  name: "Soudan" },
  { code: "ss", dial: "211",  name: "Soudan du Sud" },
  { code: "lk", dial: "94",   name: "Sri Lanka" },
  { code: "se", dial: "46",   name: "Suede" },
  { code: "ch", dial: "41",   name: "Suisse", ph: "076 123 45 67" },
  { code: "sr", dial: "597",  name: "Suriname" },
  { code: "sj", dial: "47",   name: "Svalbard et Jan Mayen" },
  { code: "sy", dial: "963",  name: "Syrie" },

  // ── T ──────────────────────────────────────────────────────────────
  { code: "tj", dial: "992",  name: "Tadjikistan" },
  { code: "tw", dial: "886",  name: "Taiwan" },
  { code: "tz", dial: "255",  name: "Tanzanie" },
  { code: "td", dial: "235",  name: "Tchad" },
  { code: "cz", dial: "420",  name: "Tchequie" },
  { code: "tf", dial: "262",  name: "Terres australes francaises" },
  { code: "io", dial: "246",  name: "Territoire britannique de l'ocean Indien" },
  { code: "th", dial: "66",   name: "Thailande" },
  { code: "tl", dial: "670",  name: "Timor oriental" },
  { code: "tg", dial: "228",  name: "Togo" },
  { code: "tk", dial: "690",  name: "Tokelau" },
  { code: "to", dial: "676",  name: "Tonga" },
  { code: "tt", dial: "1868", name: "Trinite-et-Tobago" },
  { code: "tn", dial: "216",  name: "Tunisie", ph: "20 123 456" },
  { code: "tm", dial: "993",  name: "Turkmenistan" },
  { code: "tc", dial: "1649", name: "Iles Turques-et-Caiques" },
  { code: "tr", dial: "90",   name: "Turquie" },
  { code: "tv", dial: "688",  name: "Tuvalu" },

  // ── U ──────────────────────────────────────────────────────────────
  { code: "ua", dial: "380",  name: "Ukraine" },
  { code: "um", dial: "1",    name: "Iles mineures eloignees des Etats-Unis" },
  { code: "uy", dial: "598",  name: "Uruguay" },

  // ── V ──────────────────────────────────────────────────────────────
  { code: "vu", dial: "678",  name: "Vanuatu" },
  { code: "ve", dial: "58",   name: "Venezuela" },
  { code: "vn", dial: "84",   name: "Vietnam" },
  { code: "vg", dial: "1284", name: "Iles Vierges britanniques" },
  { code: "vi", dial: "1340", name: "Iles Vierges americaines" },

  // ── W ──────────────────────────────────────────────────────────────
  { code: "wf", dial: "681",  name: "Wallis-et-Futuna", ph: "82 12 34" },

  // ── Y ──────────────────────────────────────────────────────────────
  { code: "ye", dial: "967",  name: "Yemen" },

  // ── Z ──────────────────────────────────────────────────────────────
  { code: "zm", dial: "260",  name: "Zambie" },
  { code: "zw", dial: "263",  name: "Zimbabwe" },

  // ── Ax ─────────────────────────────────────────────────────────────
  { code: "ax", dial: "358",  name: "Iles Aland" },
];

export default PHONE_PREFIXES;

/**
 * Priority codes shown at the top of the dropdown (before the full alphabetical list).
 * La Reunion first since it's the app's primary audience.
 */
export const PRIORITY_CODES = ["re", "fr", "gp", "mq", "gf", "yt", "nc", "pf", "pm", "wf", "bl", "mf"];
