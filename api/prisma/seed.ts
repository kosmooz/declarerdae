import { PrismaClient, Role, BlogArticleStatus } from "@prisma/client";
import * as argon2 from "argon2";
import * as crypto from "crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding STAR aid...");

  // ─── Admin User ──────────────────────────────────────────────────
  const passwordHash = await argon2.hash("changeme12345", {
    type: argon2.argon2id,
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@star-aid.fr" },
    update: {},
    create: {
      email: "admin@star-aid.fr",
      passwordHash,
      emailVerified: true,
      role: Role.ADMIN,
      firstName: "Admin",
      lastName: "STAR aid",
    },
  });
  console.log("Seeded admin user:", admin.email);

  // ─── Shop Settings ──────────────────────────────────────────────
  let shop = await prisma.shopSettings.findFirst({
    where: { deleted: false },
  });

  if (!shop) {
    shop = await prisma.shopSettings.create({
      data: {
        name: "STAR aid",
        description: "Prévention des risques professionnels",
        timezone: "Indian/Reunion",
      },
    });
    console.log("Seeded shop settings:", shop.name);
  }

  // ─── Blog Categories ─────────────────────────────────────────────
  const catPremiersSecours = await prisma.blogCategory.upsert({
    where: { slug: "premiers-secours" },
    update: {},
    create: {
      name: "Premiers Secours",
      slug: "premiers-secours",
      color: "#d92d20",
      position: 0,
    },
  });

  const catDefibrillateurs = await prisma.blogCategory.upsert({
    where: { slug: "defibrillateurs" },
    update: {},
    create: {
      name: "Défibrillateurs",
      slug: "defibrillateurs",
      color: "#2563eb",
      position: 1,
    },
  });

  const catFormation = await prisma.blogCategory.upsert({
    where: { slug: "formation" },
    update: {},
    create: {
      name: "Formation",
      slug: "formation",
      color: "#16a34a",
      position: 2,
    },
  });

  const catReglementation = await prisma.blogCategory.upsert({
    where: { slug: "reglementation" },
    update: {},
    create: {
      name: "Réglementation",
      slug: "reglementation",
      color: "#9333ea",
      position: 3,
    },
  });

  console.log("Seeded blog categories");

  // ─── Blog Articles ──────────────────────────────────────────────
  const uid = () => crypto.randomUUID();

  // Article 1: Symptômes Cardiaques
  const article1Content = [
    {
      id: uid(),
      type: "alert",
      data: {
        variant: "warning",
        title: "Important",
        text: "Cet article ne remplace pas un avis médical. Les informations présentées ci-dessous ont un but informatif. Elles ne constituent ni un diagnostic ni un conseil médical.",
      },
    },
    {
      id: uid(),
      type: "paragraph",
      data: {
        html: "L'infarctus du myocarde, communément appelé crise cardiaque, n'est pas toujours un événement brutal et soudain. Le corps envoie fréquemment des signaux avant l'infarctus. Reconnaître ces signes le plus tôt possible peut influencer considérablement la prise en charge et les chances de survie.",
      },
    },
    {
      id: uid(),
      type: "heading",
      data: { level: 2, text: "Quels sont les symptômes d'une crise cardiaque ?" },
    },
    {
      id: uid(),
      type: "heading",
      data: { level: 3, text: "La douleur thoracique, le symptôme le plus fréquent" },
    },
    {
      id: uid(),
      type: "paragraph",
      data: {
        html: "Le symptôme principal reste une sensation d'étau ou de pression oppressante dans la poitrine, souvent décrite comme une douleur « en barre » derrière le sternum. Cette douleur peut irradier vers :",
      },
    },
    {
      id: uid(),
      type: "list",
      data: {
        style: "unordered",
        items: [
          "Le bras gauche (ou les deux bras)",
          "La mâchoire",
          "Le cou",
          "Les épaules",
          "Le dos",
          "La partie supérieure de l'abdomen",
        ],
      },
    },
    {
      id: uid(),
      type: "heading",
      data: { level: 3, text: "Les symptômes associés" },
    },
    {
      id: uid(),
      type: "paragraph",
      data: {
        html: "Des signes accompagnateurs sont fréquemment observés et doivent alerter :",
      },
    },
    {
      id: uid(),
      type: "list",
      data: {
        style: "unordered",
        items: [
          "Essoufflement",
          "Sueurs froides",
          "Nausées ou vomissements",
          "Malaise",
          "Vertiges",
          "Pâleur",
          "Pouls irrégulier",
          "Anxiété intense",
          "Fatigue inhabituelle",
        ],
      },
    },
    {
      id: uid(),
      type: "alert",
      data: {
        variant: "info",
        title: "Durée des symptômes",
        text: "Les symptômes d'une crise cardiaque durent généralement plus de 5 minutes et ne disparaissent pas au repos.",
      },
    },
    {
      id: uid(),
      type: "heading",
      data: { level: 3, text: "Des symptômes différents chez les femmes" },
    },
    {
      id: uid(),
      type: "paragraph",
      data: {
        html: "Les femmes peuvent présenter des manifestations moins « classiques » :",
      },
    },
    {
      id: uid(),
      type: "list",
      data: {
        style: "unordered",
        items: [
          "Gêne thoracique plutôt que douleur intense",
          "Douleur au niveau de l'abdomen supérieur",
          "Nausées, vomissements",
          "Essoufflement soudain",
          "Fatigue inexpliquée",
        ],
      },
    },
    {
      id: uid(),
      type: "heading",
      data: { level: 3, text: "L'infarctus silencieux" },
    },
    {
      id: uid(),
      type: "paragraph",
      data: {
        html: "Certains infarctus surviennent sans douleur notable, se manifestant par un malaise, un essoufflement soudain, une fatigue inhabituelle ou des sensations anormales dans le bras gauche. Ce type d'infarctus est plus fréquent chez les femmes, les personnes âgées et les diabétiques.",
      },
    },
    {
      id: uid(),
      type: "heading",
      data: { level: 2, text: "Combien de temps avant une crise cardiaque les symptômes apparaissent-ils ?" },
    },
    {
      id: uid(),
      type: "paragraph",
      data: {
        html: "Ces manifestations surviennent des heures, des jours, voire des semaines avant la crise. Elles sont souvent moins marquées que la douleur aiguë de l'infarctus et apparaissent fréquemment à l'effort :",
      },
    },
    {
      id: uid(),
      type: "list",
      data: {
        style: "unordered",
        items: [
          "Gêne thoracique intermittente",
          "Essoufflement inhabituel",
          "Douleur diffuse",
          "Signes digestifs",
        ],
      },
    },
    {
      id: uid(),
      type: "alert",
      data: {
        variant: "danger",
        title: "Points clés",
        text: "Les symptômes peuvent précéder l'infarctus de plusieurs heures, jours ou semaines. Ils sont souvent moins marqués que lors de la crise aiguë et surviennent fréquemment à l'effort. Ils justifient une consultation médicale immédiate.",
      },
    },
    {
      id: uid(),
      type: "heading",
      data: { level: 2, text: "Quels signes doivent alerter et justifier un appel d'urgence ?" },
    },
    {
      id: uid(),
      type: "paragraph",
      data: {
        html: "Appelez immédiatement le 15 ou le 112 en cas de :",
      },
    },
    {
      id: uid(),
      type: "list",
      data: {
        style: "unordered",
        items: [
          "Apparition soudaine d'une douleur",
          "Douleur intense dans la poitrine (serrement ou oppression)",
          "Douleur s'étendant à l'ensemble du haut du corps",
          "Douleur persistante ne cédant pas au repos",
          "Douleur irradiant vers les bras, la mâchoire ou le dos",
        ],
      },
    },
    {
      id: uid(),
      type: "paragraph",
      data: {
        html: "Chez les femmes, les personnes âgées et les diabétiques, surveillez également : malaise, essoufflement soudain, fatigue inhabituelle, nausées ou vomissements, anxiété ou transpiration.",
      },
    },
    {
      id: uid(),
      type: "heading",
      data: { level: 2, text: "Pourquoi est-il vital de reconnaître les symptômes le plus tôt possible ?" },
    },
    {
      id: uid(),
      type: "paragraph",
      data: {
        html: "Lorsqu'une artère coronaire se bouche, le sang n'arrive plus correctement jusqu'au muscle cardiaque. Chaque minute compte car le cœur manque d'oxygène, les dommages au muscle cardiaque s'accélèrent, et plus le blocage dure, plus les dégâts sont importants. Une intervention précoce minimise l'étendue de l'infarctus et améliore les chances de récupération, en réduisant les complications graves comme l'arrêt cardiaque.",
      },
    },
    {
      id: uid(),
      type: "heading",
      data: { level: 2, text: "Crise cardiaque : les facteurs de risque à connaître" },
    },
    {
      id: uid(),
      type: "list",
      data: {
        style: "unordered",
        items: [
          "Diabète",
          "Tabagisme",
          "Cholestérol élevé",
          "Hypertension artérielle",
          "Antécédents familiaux d'infarctus",
          "Surpoids",
          "Sédentarité",
        ],
      },
    },
    {
      id: uid(),
      type: "paragraph",
      data: {
        html: "Les professionnels de santé recommandent : l'arrêt du tabac, une alimentation équilibrée de type méditerranéen, une activité physique quotidienne même modérée, la gestion du stress, et un suivi médical régulier de la pression artérielle, du cholestérol et de la glycémie.",
      },
    },
    {
      id: uid(),
      type: "separator",
      data: {},
    },
    {
      id: uid(),
      type: "cta",
      data: {
        title: "Protégez vos équipes avec un défibrillateur",
        text: "Reconnaître les symptômes et disposer d'un défibrillateur peut changer l'issue d'une urgence. STAR aid propose la location et la vente de défibrillateurs ainsi que des formations aux premiers secours.",
        buttonText: "Découvrir nos offres",
        buttonUrl: "/souscrire",
      },
    },
  ];

  const existingArticle1 = await prisma.blogArticle.findUnique({
    where: { slug: "combien-de-temps-les-symptomes-cardiaques" },
  });

  if (!existingArticle1) {
    await prisma.blogArticle.create({
      data: {
        title: "Symptômes Cardiaques : Quelle Durée ?",
        slug: "combien-de-temps-les-symptomes-cardiaques",
        excerpt:
          "Découvrez quels symptômes peuvent annoncer une crise cardiaque, parfois des jours en avant, et quels signes doivent conduire à agir rapidement.",
        content: article1Content,
        status: BlogArticleStatus.PUBLISHED,
        authorId: admin.id,
        metaTitle: "Symptômes Cardiaques : Quelle Durée ? | STAR aid",
        metaDescription:
          "Découvrez quels symptômes peuvent annoncer une crise cardiaque, parfois des jours en avant, et quels signes doivent conduire à agir rapidement.",
        readingTime: 5,
        publishedAt: new Date("2025-12-08"),
        categories: {
          createMany: {
            data: [
              { categoryId: catPremiersSecours.id },
              { categoryId: catDefibrillateurs.id },
            ],
          },
        },
      },
    });
    console.log("Seeded article: Symptômes Cardiaques");
  }

  // Article 2: Travail en hauteur
  const article2Content = [
    {
      id: uid(),
      type: "paragraph",
      data: {
        html: "Les chutes de hauteur représentent plus de 10 % des accidents du travail en France et constituent la deuxième cause de décès au travail. Dans le BTP, ces chutes représentent environ 20 % des accidents mortels. Le Code du travail (articles L.4121-1 et L.4121-2) impose à l'employeur d'assurer la sécurité et la santé des travailleurs, incluant l'évaluation des risques, la mise en place de protections et la formation obligatoire.",
      },
    },
    {
      id: uid(),
      type: "heading",
      data: { level: 2, text: "Comment définir le travail en hauteur ?" },
    },
    {
      id: uid(),
      type: "paragraph",
      data: {
        html: "Le Code du travail ne fixe pas de seuil en mètres. Le travail en hauteur s'applique dès lors qu'un travailleur est exposé à un risque de chute pouvant entraîner des blessures graves, quelle que soit la distance.",
      },
    },
    {
      id: uid(),
      type: "alert",
      data: {
        variant: "info",
        title: "Exemples concrets",
        text: "Une chute de 50 cm peut être qualifiée de travail en hauteur si le risque de blessure grave existe. Les chutes de plusieurs mètres (échafaudages, toitures, nacelles, pylônes) entrent clairement dans le champ réglementaire.",
      },
    },
    {
      id: uid(),
      type: "paragraph",
      data: {
        html: "Types de travaux concernés :",
      },
    },
    {
      id: uid(),
      type: "list",
      data: {
        style: "unordered",
        items: [
          "Travaux sur échafaudages ou plateformes",
          "Travaux de toiture ou de charpente",
          "Utilisation d'échelles, escabeaux ou marchepieds",
          "Travaux sur nacelles élévatrices (PEMP)",
          "Travaux sur cordes (cordistes)",
        ],
      },
    },
    {
      id: uid(),
      type: "heading",
      data: { level: 2, text: "Que dit la loi concernant le travail en hauteur ?" },
    },
    {
      id: uid(),
      type: "table",
      data: {
        hasHeader: true,
        rows: [
          ["Article", "Code", "Exigence"],
          ["R.4323-58", "Code du travail", "Les travaux temporaires en hauteur nécessitent des postes de travail correctement conçus et installés"],
          ["R.4323-59", "Code du travail", "La prévention des chutes privilégie les garde-corps ou dispositifs équivalents"],
          ["R.4323-61", "Code du travail", "Quand les protections collectives sont impossibles, l'employeur doit fournir des EPI antichute"],
          ["R.4323-63", "Code du travail", "Les échelles ne peuvent servir de poste de travail permanent, sauf impossibilité technique"],
          ["R.4323-23", "Code du travail", "Vérification régulière des équipements par du personnel compétent"],
          ["R.4141-2", "Code du travail", "L'employeur doit former et informer les travailleurs sur les risques d'exposition"],
        ],
      },
    },
    {
      id: uid(),
      type: "heading",
      data: { level: 2, text: "La hiérarchie des moyens de protection" },
    },
    {
      id: uid(),
      type: "paragraph",
      data: {
        html: "La loi impose une séquence prioritaire de protection :",
      },
    },
    {
      id: uid(),
      type: "list",
      data: {
        style: "ordered",
        items: [
          "<strong>Supprimer le risque de chute</strong> par des protections collectives (garde-corps, filets de sécurité, plateformes sécurisées)",
          "<strong>Sécuriser l'accès et la circulation</strong> si la prévention s'avère impossible (escaliers temporaires, passerelles protégées)",
          "<strong>Équipements de protection individuelle (EPI)</strong> en dernier recours (harnais de sécurité, lignes de vie, systèmes d'arrêt de chute)",
        ],
      },
    },
    {
      id: uid(),
      type: "alert",
      data: {
        variant: "warning",
        title: "Attention",
        text: "Les échelles et escabeaux ne peuvent pas constituer des postes de travail permanents. Seuls les travaux de courte durée et non répétitifs justifient leur utilisation lorsqu'aucune alternative plus sûre n'existe.",
      },
    },
    {
      id: uid(),
      type: "heading",
      data: { level: 2, text: "Les obligations de l'employeur" },
    },
    {
      id: uid(),
      type: "paragraph",
      data: {
        html: "L'employeur doit remplir cinq responsabilités principales :",
      },
    },
    {
      id: uid(),
      type: "list",
      data: {
        style: "ordered",
        items: [
          "Évaluer les risques et les consigner dans le Document Unique d'Évaluation des Risques Professionnels (DUERP)",
          "Mettre en place les mesures de protection appropriées",
          "Fournir et vérifier les équipements (échafaudages, nacelles, harnais, longes, mousquetons)",
          "Former et informer les travailleurs (montage/démontage d'échafaudages, port du harnais, conduite de nacelle)",
          "Organiser le travail et faire respecter les pratiques (supervision des chantiers, procédures de secours)",
        ],
      },
    },
    {
      id: uid(),
      type: "alert",
      data: {
        variant: "danger",
        title: "Contrôles et sanctions",
        text: "L'inspection du travail effectue des contrôles inopinés sur les chantiers, vérifiant l'évaluation des risques, la présence des protections, l'état des équipements et la formation des travailleurs. Le non-respect expose à des mises en demeure, des amendes et des arrêts de travaux.",
      },
    },
    {
      id: uid(),
      type: "heading",
      data: { level: 2, text: "Les obligations du salarié" },
    },
    {
      id: uid(),
      type: "list",
      data: {
        style: "unordered",
        items: [
          "Respecter les consignes de sécurité et les procédures",
          "Utiliser correctement les équipements (endosser et sécuriser les harnais, employer les lignes de vie)",
          "Préserver la sécurité personnelle et celle des collègues",
          "Signaler immédiatement les anomalies et les dangers",
        ],
      },
    },
    {
      id: uid(),
      type: "heading",
      data: { level: 2, text: "Formation au travail en hauteur" },
    },
    {
      id: uid(),
      type: "paragraph",
      data: {
        html: "L'employeur doit fournir une formation pratique et pertinente permettant aux travailleurs de :",
      },
    },
    {
      id: uid(),
      type: "list",
      data: {
        style: "unordered",
        items: [
          "Évaluer les dangers liés à la hauteur",
          "Appliquer correctement les protections collectives",
          "Déployer et utiliser les systèmes EPI antichute",
          "Comprendre les protocoles de secours",
        ],
      },
    },
    {
      id: uid(),
      type: "paragraph",
      data: {
        html: "Les formations spécialisées requises comprennent : la formation obligatoire pour le montage et démontage d'échafaudages, l'autorisation de conduite pour les nacelles élévatrices (PEMP), et la formation renforcée pour les travaux sur cordes. Les recommandations professionnelles préconisent un recyclage tous les 3 à 5 ans.",
      },
    },
    {
      id: uid(),
      type: "separator",
      data: {},
    },
    {
      id: uid(),
      type: "cta",
      data: {
        title: "Formez vos équipes avec STAR aid",
        text: "STAR aid propose des formations certifiées pour le travail en hauteur : échafaudages roulants, échafaudages fixes, travaux en hauteur (toitures, pentes, terrasses) et port du harnais.",
        buttonText: "Découvrir nos formations",
        buttonUrl: "/souscrire",
      },
    },
  ];

  const existingArticle2 = await prisma.blogArticle.findUnique({
    where: { slug: "travail-en-hauteur-formation-et-reglementation" },
  });

  if (!existingArticle2) {
    await prisma.blogArticle.create({
      data: {
        title: "Travail en hauteur : obligations et formation à connaître",
        slug: "travail-en-hauteur-formation-et-reglementation",
        excerpt:
          "Découvrez le cadre complet du travail en hauteur : définition, obligations légales, responsabilités de l'employeur et du salarié, hiérarchie des protections et formation obligatoire.",
        content: article2Content,
        status: BlogArticleStatus.PUBLISHED,
        authorId: admin.id,
        metaTitle:
          "Travail en hauteur : obligations et formation | STAR aid",
        metaDescription:
          "Découvrez le cadre complet du travail en hauteur : définition, obligations légales, responsabilités de l'employeur et du salarié, hiérarchie des protections et formation obligatoire.",
        readingTime: 7,
        publishedAt: new Date("2025-11-21"),
        categories: {
          createMany: {
            data: [
              { categoryId: catFormation.id },
              { categoryId: catReglementation.id },
            ],
          },
        },
      },
    });
    console.log("Seeded article: Travail en hauteur");
  }

  console.log("\nSeed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
