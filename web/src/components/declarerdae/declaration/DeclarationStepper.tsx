"use client";

import { User, Building2, Cpu, CheckCircle2 } from "lucide-react";

const steps = [
  { id: 1, title: "Exploitant", icon: User },
  { id: 2, title: "Site", icon: Building2 },
  { id: 3, title: "DAE", icon: Cpu },
  { id: 4, title: "Récap.", icon: CheckCircle2 },
];

interface DeclarationStepperProps {
  currentStep: number;
}

export default function DeclarationStepper({
  currentStep,
}: DeclarationStepperProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      {steps.map((step, i) => {
        const Icon = step.icon;
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;

        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                  isCompleted
                    ? "bg-[#18753C] text-white"
                    : isActive
                      ? "bg-[#000091] text-white"
                      : "bg-[#E5E5E5] text-[#929292]"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Icon className="w-4.5 h-4.5" />
                )}
              </div>
              <span
                className={`text-[10px] mt-1 font-medium ${
                  isActive
                    ? "text-[#000091]"
                    : isCompleted
                      ? "text-[#18753C]"
                      : "text-[#929292]"
                }`}
              >
                {step.title}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 mt-[-16px] ${
                  isCompleted ? "bg-[#18753C]" : "bg-[#E5E5E5]"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
