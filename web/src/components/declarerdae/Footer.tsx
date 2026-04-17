import { Heart } from "lucide-react";
import Link from "next/link";
import CookieSettingsButton from "@/components/declarerdae/CookieSettingsButton";

export default function Footer() {
  return (
    <footer className="bg-[#1E1E1E] text-white">
      <div className="tricolor-band" aria-hidden="true" />
      <div className="container py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div>
            <Link href="/" className="flex items-center gap-3 mb-4 no-underline">
              <div className="flex items-center justify-center w-9 h-9 rounded bg-white/10">
                <Heart className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-heading font-bold text-base text-white">
                declarerdefibrillateur.fr
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Service simplifié de déclaration de défibrillateurs automatisés externes (DAE) conforme à la réglementation française en vigueur.
            </p>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-sm uppercase tracking-wider mb-4 text-gray-300">
              Navigation
            </h4>
            <ul className="space-y-2">
              <li><a href="/#pourquoi" className="text-sm text-gray-400 hover:text-white transition-colors no-underline">Pourquoi déclarer</a></li>
              <li><Link href="/obligations" className="text-sm text-gray-400 hover:text-white transition-colors no-underline">Obligations légales</Link></li>
              <li><Link href="/guide-erp" className="text-sm text-gray-400 hover:text-white transition-colors no-underline">Guide ERP</Link></li>
              <li><a href="/#service" className="text-sm text-gray-400 hover:text-white transition-colors no-underline">Notre service</a></li>
              <li><Link href="/tarifs" className="text-sm text-gray-400 hover:text-white transition-colors no-underline">Tarifs</Link></li>
              <li><Link href="/declaration" className="text-sm text-gray-400 hover:text-white transition-colors no-underline">Déclarer mon DAE</Link></li>
              <li><a href="/#faq" className="text-sm text-gray-400 hover:text-white transition-colors no-underline">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-sm uppercase tracking-wider mb-4 text-gray-300">
              À propos
            </h4>
            <ul className="space-y-2">
              <li><Link href="/a-propos" className="text-sm text-gray-400 hover:text-white transition-colors no-underline">Notre mission</Link></li>
              <li><Link href="/contact" className="text-sm text-gray-400 hover:text-white transition-colors no-underline">Nous contacter</Link></li>
              <li><Link href="/mentions-legales" className="text-sm text-gray-400 hover:text-white transition-colors no-underline">Mentions légales</Link></li>
              <li><Link href="/politique-de-confidentialite" className="text-sm text-gray-400 hover:text-white transition-colors no-underline">Politique de confidentialité</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-sm uppercase tracking-wider mb-4 text-gray-300">
              Liens institutionnels
            </h4>
            <ul className="space-y-2">
              <li><a href="https://sante.gouv.fr/prevention-en-sante/preserver-sa-sante/dae" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white transition-colors no-underline">sante.gouv.fr — DAE</a></li>
              <li><a href="https://www.data.gouv.fr/datasets/geodae-base-nationale-des-defibrillateurs" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white transition-colors no-underline">data.gouv.fr — Géo&apos;DAE</a></li>
              <li><a href="https://www.legifrance.gouv.fr" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white transition-colors no-underline">legifrance.gouv.fr</a></li>
              <li><a href="https://www.service-public.fr" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white transition-colors no-underline">service-public.fr</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} declarerdefibrillateur.fr — Tous droits réservés
          </p>
          <div className="flex items-center gap-4">
            <Link href="/mentions-legales" className="text-xs text-gray-500 hover:text-white transition-colors no-underline">
              Mentions légales
            </Link>
            <Link href="/politique-de-confidentialite" className="text-xs text-gray-500 hover:text-white transition-colors no-underline">
              Politique de confidentialité
            </Link>
            <Link href="/contact" className="text-xs text-gray-500 hover:text-white transition-colors no-underline">
              Contact
            </Link>
            <CookieSettingsButton />
          </div>
        </div>
      </div>
    </footer>
  );
}
