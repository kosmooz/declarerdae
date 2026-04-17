"use client";

import { useState } from "react";
import { Phone, LogIn, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import AuthDialog from "@/components/AuthDialog";
import { IMAGES, NAV_ITEMS, CONTACT } from "@/data/landing-content";
import { useRouter, usePathname } from "next/navigation";

function navigateToSection(id: string, pathname: string, router: ReturnType<typeof useRouter>, setOpen?: (v: boolean) => void) {
  setOpen?.(false);
  if (pathname === "/") {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  } else {
    router.push(`/#${id}`);
  }
}

export default function StickyHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="container flex items-center justify-between h-14 md:h-16">
          <a href="/" className="shrink-0">
            <img src={IMAGES.logo} alt="Star Aid" className="h-9 md:h-12 w-auto" />
          </a>
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-900">
            {NAV_ITEMS.map((item) => (
              <button key={item.id} onClick={() => item.href ? router.push(item.href) : navigateToSection(item.id, pathname, router)} className="hover:text-[#d92d20] transition-colors">
                {item.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <a href={CONTACT.phoneHref} className="hidden md:flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-[#d92d20] transition-colors">
              <Phone className="w-4 h-4" />
              {CONTACT.phone}
            </a>
            {!loading && (
              user ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(user.role === "ADMIN" ? "/admin" : "/dashboard")}
                  className="font-semibold text-sm"
                >
                  <User className="w-4 h-4 mr-1.5" />
                  Mon espace
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAuthOpen(true)}
                  className="font-semibold text-sm"
                >
                  <LogIn className="w-4 h-4 mr-1.5" />
                  Connexion
                </Button>
              )
            )}
            <Button onClick={() => navigateToSection("rdv", pathname, router)} className="bg-[#d92d20] hover:bg-[#b91c1c] text-white font-semibold text-sm px-4 py-2">
              Prendre RDV
            </Button>
            <button className="lg:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <div className="space-y-1.5">
                <span className={`block w-5 h-0.5 bg-gray-700 transition-all duration-300 ${mobileMenuOpen ? "rotate-45 translate-y-2" : ""}`} />
                <span className={`block w-5 h-0.5 bg-gray-700 transition-all duration-300 ${mobileMenuOpen ? "opacity-0" : ""}`} />
                <span className={`block w-5 h-0.5 bg-gray-700 transition-all duration-300 ${mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
              </div>
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 py-3 px-4 space-y-1">
            {[...NAV_ITEMS, { id: "rdv", label: "Prendre RDV" }].map((item) => (
              <button key={item.id} onClick={() => { setMobileMenuOpen(false); "href" in item && item.href ? router.push(item.href) : navigateToSection(item.id, pathname, router); }} className="block w-full text-left py-2.5 text-gray-700 hover:text-[#d92d20] font-medium text-sm">
                {item.label}
              </button>
            ))}
            {!loading && !user && (
              <button
                onClick={() => { setMobileMenuOpen(false); setAuthOpen(true); }}
                className="block w-full text-left py-2.5 text-[#d92d20] font-medium text-sm"
              >
                Connexion
              </button>
            )}
          </div>
        )}
      </header>
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
}
