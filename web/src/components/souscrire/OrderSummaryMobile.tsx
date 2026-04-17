"use client";

import { useState } from "react";
import { calculatePricing } from "@/lib/schemas/subscribe";
import { ChevronUp, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderSummaryMobileProps {
  quantity: number;
}

export default function OrderSummaryMobile({ quantity }: OrderSummaryMobileProps) {
  const [open, setOpen] = useState(false);
  const { monthlyTTC } = calculatePricing(quantity);

  return (
    <div className="lg:hidden sticky top-0 z-30 bg-background border-b">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">
            {quantity} défibrillateur{quantity > 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-primary">{monthlyTTC.toFixed(2)} €/mois</span>
          <ChevronUp
            className={cn(
              "w-4 h-4 transition-transform",
              !open && "rotate-180",
            )}
          />
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm space-y-2 border-t pt-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Prix unitaire</span>
            <span>89 €/mois TTC</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Quantité</span>
            <span>{quantity}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total TTC/mois</span>
            <span className="text-primary">{monthlyTTC.toFixed(2)} €</span>
          </div>
        </div>
      )}
    </div>
  );
}
