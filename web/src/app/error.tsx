"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-6">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Une erreur est survenue
        </h2>
        <p className="text-slate-500 mb-6">
          Quelque chose s{"'"}est mal passé. Veuillez réessayer.
        </p>
        <Button onClick={reset}>Réessayer</Button>
      </div>
    </div>
  );
}
