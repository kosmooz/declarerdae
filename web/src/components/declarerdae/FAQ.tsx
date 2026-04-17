import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "Qui est concerné par l'obligation de déclaration d'un DAE ?",
    answer: "Tous les exploitants de défibrillateurs automatisés externes (DAE) ont l'obligation légale de déclarer leurs appareils dans la base de données nationale Géo'DAE. Cela concerne les ERP (Établissements Recevant du Public) de toutes catégories, les entreprises, les associations, les collectivités territoriales, et toute personne physique ou morale possédant un DAE mis à disposition de tiers. Cette obligation est définie par le décret n°2018-1259 du 27 décembre 2018.",
  },
  {
    question: "Quelles sont les sanctions en cas de non-déclaration de mon DAE ?",
    answer: "Le non-respect de l'obligation de déclaration expose l'exploitant à des sanctions significatives. En cas d'arrêt cardiaque mortel dans un établissement, l'absence de DAE déclaré et maintenu peut engager la responsabilité pénale du chef d'établissement. Les sanctions peuvent inclure des amendes pouvant atteindre 45 000 €, la fermeture temporaire ou définitive de l'établissement, et des poursuites pour mise en danger de la vie d'autrui.",
  },
  {
    question: "Combien de temps prend la déclaration en ligne sur votre plateforme ?",
    answer: "Notre service a été conçu pour simplifier au maximum la procédure. En moyenne, une déclaration complète prend moins de 5 minutes grâce à notre formulaire guidé en 4 étapes. Vous recevez ensuite une attestation de déclaration par email sous 24 heures. Notre équipe vérifie la conformité de votre dossier et procède à l'enregistrement dans la base nationale.",
  },
  {
    question: "Quelle est la différence entre un DEA et un DSA ?",
    answer: "Un DEA (Défibrillateur Entièrement Automatique) délivre automatiquement le choc électrique s'il le juge nécessaire, sans intervention de l'utilisateur. Un DSA (Défibrillateur Semi-Automatique) nécessite que l'utilisateur appuie sur un bouton pour délivrer le choc, après indication de l'appareil. Les deux types sont des DAE (Défibrillateurs Automatisés Externes) et doivent être déclarés. Toute personne, même non-médecin, peut utiliser un DAE (décret n°2007-705 du 4 mai 2007).",
  },
  {
    question: "Mon établissement est-il obligé de s'équiper d'un DAE ?",
    answer: "Depuis le 1er janvier 2022, tous les ERP de catégories 1 à 5 (selon les seuils définis) sont tenus de s'équiper d'un DAE. L'obligation s'est déployée progressivement : catégories 1, 2 et 3 depuis le 1er janvier 2020, catégorie 4 depuis le 1er janvier 2021, et certains ERP de catégorie 5 depuis le 1er janvier 2022. En dehors de cette obligation, toute personne est libre d'installer un DAE pour contribuer à sauver des vies.",
  },
  {
    question: "Quelles sont les obligations de maintenance d'un DAE ?",
    answer: "L'exploitant d'un DAE a l'obligation de maintenir son appareil opérationnel conformément aux préconisations du fabricant. Cela inclut la vérification régulière de l'état des électrodes, de la batterie, et du logiciel. La date de dernière maintenance doit être déclarée dans Géo'DAE.",
  },
  {
    question: "Est-ce que votre service remplace la déclaration sur Géo'DAE ?",
    answer: "Notre service simplifie et automatise le processus de déclaration. Nous collectons vos informations via notre formulaire optimisé, vérifions la conformité de votre dossier, puis procédons à l'enregistrement de vos données dans la base nationale Géo'DAE conformément au standard défini par l'arrêté du 29 octobre 2019. Vous bénéficiez d'un accompagnement complet et d'une attestation de déclaration.",
  },
  {
    question: "Puis-je déclarer plusieurs DAE en une seule fois ?",
    answer: "Oui, notre plateforme permet la déclaration multiple. Si vous gérez un parc de plusieurs défibrillateurs, vous pouvez les déclarer un par un via notre formulaire, ou nous contacter pour un accompagnement personnalisé dans le cadre d'une déclaration groupée.",
  },
  {
    question: "Où doit être installé un DAE pour être conforme ?",
    answer: "Le DAE doit être installé dans un emplacement visible du public et en permanence facile d'accès. Les préconisations officielles recommandent de l'installer de préférence en extérieur pour qu'il soit accessible même pendant les heures de fermeture.",
  },
  {
    question: "Combien coûte votre service de déclaration ?",
    answer: "Notre service de base de déclaration en ligne est accessible gratuitement. Nous proposons également des prestations complémentaires pour les organisations ayant des besoins spécifiques : accompagnement personnalisé, déclaration groupée, suivi de maintenance, et mise en conformité complète.",
  },
];

export default function FAQ() {
  return (
    <Accordion type="single" collapsible className="space-y-2">
      {faqItems.map((item, index) => (
        <AccordionItem
          key={index}
          value={`item-${index}`}
          className="border border-[#E5E5E5] rounded bg-white px-0 overflow-hidden"
        >
          <AccordionTrigger className="px-5 py-4 text-left font-heading font-semibold text-[15px] text-[#3A3A3A] hover:text-[#000091] hover:no-underline [&[data-state=open]]:text-[#000091]">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="px-5 pb-4 text-[15px] text-[#666] leading-relaxed border-t border-[#F6F6F6]">
            <div className="pt-3">{item.answer}</div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
