import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-7xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Page introuvable
        </h2>
        <p className="text-slate-500 mb-6">
          La page que vous recherchez n{"'"}existe pas ou a été déplacée.
        </p>
        <Button asChild>
          <Link href="/">Retour à l{"'"}accueil</Link>
        </Button>
      </div>
    </div>
  );
}
