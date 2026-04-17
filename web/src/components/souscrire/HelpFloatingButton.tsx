"use client";

import { useState } from "react";
import { MessageCircleQuestion, X, Phone, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HelpFloatingButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="absolute bottom-16 right-0 w-72 rounded-2xl border bg-card shadow-xl p-5 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Besoin d&apos;aide ?</h3>
            <button
              onClick={() => setOpen(false)}
              className="w-6 h-6 rounded-full hover:bg-muted flex items-center justify-center"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground">
            Notre équipe est disponible pour vous accompagner dans votre souscription.
          </p>
          <div className="space-y-2">
            <a
              href="tel:+262262000000"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors text-sm"
            >
              <Phone className="w-4 h-4 text-primary" />
              <span>0262 00 00 00</span>
            </a>
            <a
              href="mailto:contact@star-aid.fr"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors text-sm"
            >
              <Mail className="w-4 h-4 text-primary" />
              <span>contact@star-aid.fr</span>
            </a>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "w-14 h-14 rounded-full bg-primary text-white shadow-lg flex items-center justify-center transition-transform hover:scale-105",
          open && "bg-muted text-foreground",
        )}
      >
        {open ? <X className="w-5 h-5" /> : <MessageCircleQuestion className="w-6 h-6" />}
      </button>
    </div>
  );
}
