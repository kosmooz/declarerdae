"use client";

import Image from "next/image";
import { calculatePricing, UNIT_PRICE_TTC, TVA_RATE } from "@/lib/schemas/subscribe";

interface OrderSidebarProps {
  quantity: number;
}

export default function OrderSidebar({ quantity }: OrderSidebarProps) {
  const { monthlyHT, monthlyTTC, yearlyTTC } = calculatePricing(quantity);

  return (
    <div className="rounded-2xl border bg-card overflow-hidden">
      {/* Product image */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 flex items-center justify-center">
        <Image
          src="/images/defibrillateurs-lineup.png"
          alt="ZOLL AED 3"
          width={128}
          height={100}
          className="w-32 h-auto object-contain drop-shadow-lg"
        />
      </div>

      <div className="p-5 space-y-5">
        <div>
          <h3 className="font-semibold">ZOLL AED 3</h3>
          <p className="text-xs text-muted-foreground">Abonnement tout compris</p>
        </div>

        <div className="space-y-2.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Quantité</span>
            <span className="font-medium">{quantity} unité{quantity > 1 ? "s" : ""}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Prix unitaire TTC</span>
            <span className="font-medium">{UNIT_PRICE_TTC} €/mois</span>
          </div>
          {quantity > 1 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sous-total HT</span>
              <span className="font-medium">{monthlyHT} €/mois</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">TVA ({(TVA_RATE * 100).toFixed(1)}%)</span>
            <span className="font-medium">{(monthlyTTC - monthlyHT).toFixed(2)} €</span>
          </div>
          <div className="border-t pt-2.5">
            <div className="flex justify-between text-base">
              <span className="font-semibold">Total TTC/mois</span>
              <span className="font-bold text-[#d92d20]">{monthlyTTC.toFixed(2)} €</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5 text-right">
              soit {yearlyTTC.toFixed(2)} €/an
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-muted/50 p-3 space-y-1.5 text-[11px] text-muted-foreground">
          <p>✓ Maintenance préventive et curative</p>
          <p>✓ Remplacement sous 48h</p>
          <p>✓ Formation incluse</p>
          <p>✓ Engagement 48 mois</p>
        </div>
      </div>
    </div>
  );
}
