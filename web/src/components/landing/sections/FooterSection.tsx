"use client";

import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { IMAGES, CONTACT } from "@/data/landing-content";

export default function FooterSection() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="h-0.5 bg-gradient-to-r from-transparent via-[#d92d20] to-transparent" />
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2">
            <img src={IMAGES.logo} alt="Star Aid" className="h-10 w-auto mb-3 brightness-0 invert" />
            <p className="text-gray-400 font-sans text-xs leading-relaxed max-w-md mb-3">
              STAR aid, organisme de formation certifié Qualiopi et leader outre-mer de la vente, location et maintenance de défibrillateurs. Depuis 2012 à La Réunion.
            </p>
            <p className="text-gray-500 font-sans text-xs">Certifié Qualiopi · Distributeur officiel ZOLL · Financé FEDER-FSE+</p>
            <p className="text-gray-600 font-sans text-xs mt-1">SIRET : {CONTACT.siret} · {CONTACT.address}</p>
          </div>
          <div>
            <h4 className="font-bold mb-3 text-xs font-sans uppercase tracking-wider text-gray-400">Contact</h4>
            <div className="space-y-2.5 text-xs text-gray-400 font-sans">
              <a href={CONTACT.phoneHref} className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone className="w-3.5 h-3.5" /> {CONTACT.phone}
              </a>
              <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail className="w-3.5 h-3.5" /> {CONTACT.email}
              </a>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{CONTACT.address}<br />La Réunion</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-3 text-xs font-sans uppercase tracking-wider text-gray-400">Horaires</h4>
            <div className="space-y-1 text-xs text-gray-400 font-sans">
              <div className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <div>
                  <p>{CONTACT.hours.weekdays}</p>
                  <p>{CONTACT.hours.friday}</p>
                  <p>{CONTACT.hours.weekend}</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 font-sans mt-3">{CONTACT.zones}</p>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500 font-sans">
            © {new Date().getFullYear()} STAR aid — Prévention des risques professionnels
          </p>
          <div className="flex gap-4 text-xs text-gray-500 font-sans">
            <a href="/blog" className="hover:text-white transition-colors">Blog</a>
            <a href="https://star-aid.fr" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">star-aid.fr</a>
            <a href="https://location-dae.fr" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">location-dae.fr</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
