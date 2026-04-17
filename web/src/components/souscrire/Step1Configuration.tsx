"use client";

import { Minus, Plus, ArrowRight, CheckCircle2 } from "lucide-react";
import { calculatePricing, UNIT_PRICE_TTC } from "@/lib/schemas/subscribe";
import { cn } from "@/lib/utils";

interface Step1Props {
  quantity: number;
  onQuantityChange: (qty: number) => void;
  onNext: () => void;
}

const INCLUDED = [
  "Défibrillateur ZOLL AED 3",
  "Armoire murale + signalétique",
  "Installation sur site",
  "Maintenance préventive",
  "Formation digitale certifiée",
  "Hotline 24h/24",
];

export default function Step1Configuration({ quantity, onQuantityChange, onNext }: Step1Props) {
  const { monthlyHT, monthlyTTC } = calculatePricing(quantity);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Configurez votre abonnement
        </h1>
        <p className="text-muted-foreground mt-1">
          Choisissez le nombre de défibrillateurs pour votre établissement
        </p>
      </div>

      {/* Product card with image */}
      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="sm:flex">
          {/* Product image */}
          <div className="sm:w-48 md:w-56 bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center shrink-0">
            <img
              src="/images/defibrillateurs-lineup.png"
              alt="ZOLL AED 3"
              className="w-36 sm:w-full h-auto object-contain drop-shadow-lg"
            />
          </div>

          {/* Product info */}
          <div className="flex-1 p-5">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <span className="inline-block bg-[#d92d20] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mb-1.5">
                  N°1 mondial
                </span>
                <h2 className="text-lg font-bold">Défibrillateur ZOLL AED 3</h2>
                <p className="text-sm text-muted-foreground">
                  Abonnement tout compris · Engagement 48 mois
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-2xl font-bold text-[#d92d20]">{UNIT_PRICE_TTC}€</span>
                <p className="text-xs text-muted-foreground">TTC/mois</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-4">
              {INCLUDED.map((item) => (
                <div key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#d92d20] shrink-0" />
                  <span className="text-xs text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>

            {/* Quantity selector — compact */}
            <div className="flex items-center gap-4 p-3 rounded-xl bg-muted/50">
              <span className="text-sm font-medium">Quantité</span>
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className={cn(
                    "w-8 h-8 rounded-lg border flex items-center justify-center transition-colors",
                    quantity <= 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-background",
                  )}
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-lg font-bold w-8 text-center">{quantity}</span>
                <button
                  onClick={() => onQuantityChange(Math.min(50, quantity + 1))}
                  disabled={quantity >= 50}
                  className={cn(
                    "w-8 h-8 rounded-lg border flex items-center justify-center transition-colors",
                    quantity >= 50 ? "opacity-40 cursor-not-allowed" : "hover:bg-background",
                  )}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="text-right pl-3 border-l">
                <span className="text-lg font-bold text-[#d92d20]">{monthlyTTC.toFixed(2)}€</span>
                <p className="text-[10px] text-muted-foreground">TTC/mois</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full h-12 bg-[#d92d20] hover:bg-[#b91c1c] text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
      >
        Continuer
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
