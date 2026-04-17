import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Fil d'Ariane" className="bg-[#F6F6F6] border-b border-[#E5E5E5]">
      <div className="container py-3">
        <ol className="flex items-center gap-1.5 text-sm flex-wrap">
          <li>
            <Link href="/" className="flex items-center gap-1 text-[#000091] hover:underline no-underline">
              <Home className="w-3.5 h-3.5" />
              <span>Accueil</span>
            </Link>
          </li>
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-1.5">
              <ChevronRight className="w-3.5 h-3.5 text-[#929292]" />
              {item.href ? (
                <Link href={item.href} className="text-[#000091] hover:underline no-underline">
                  {item.label}
                </Link>
              ) : (
                <span className="text-[#3A3A3A] font-medium">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
