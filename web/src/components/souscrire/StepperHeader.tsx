"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const steps = [
  { label: "Configuration", shortLabel: "Config" },
  { label: "Informations", shortLabel: "Infos" },
  { label: "Récapitulatif", shortLabel: "Récap" },
  { label: "Signature", shortLabel: "Signer" },
];

interface StepperHeaderProps {
  currentStep: number;
}

export default function StepperHeader({ currentStep }: StepperHeaderProps) {
  return (
    <nav className="w-full px-4 py-6">
      <ol className="flex items-center justify-between max-w-2xl mx-auto">
        {steps.map((step, index) => {
          const stepNum = index + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;

          return (
            <li key={step.label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300",
                    isCompleted && "bg-primary text-white",
                    isCurrent && "bg-primary text-white ring-4 ring-primary/20",
                    !isCompleted && !isCurrent && "bg-muted text-muted-foreground",
                  )}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : stepNum}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium transition-colors",
                    (isCompleted || isCurrent)
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  <span className="hidden sm:inline">{step.label}</span>
                  <span className="sm:hidden">{step.shortLabel}</span>
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-3 mt-[-1.5rem] transition-colors duration-300",
                    stepNum < currentStep ? "bg-primary" : "bg-muted",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
