"use client";
import { useState, useRef, useEffect } from "react";
import { Menu, X, Heart, ChevronDown, ArrowRight, User, LogOut, LayoutDashboard, ClipboardList, Pencil, KeyRound } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import AuthDialog from "@/components/AuthDialog";

interface NavItem {
  label: string;
  href: string;
  isPage?: boolean;
  badge?: string;
  children?: { label: string; href: string; desc?: string; isPage?: boolean }[];
}

const navLinks: NavItem[] = [
  {
    label: "Informations",
    href: "#",
    children: [
      { label: "Pourquoi déclarer", href: "/#pourquoi", desc: "Enjeux de santé publique" },
      { label: "Obligations légales", href: "/obligations", isPage: true, desc: "Cadre réglementaire complet" },
      { label: "Guide ERP", href: "/guide-erp", isPage: true, desc: "Catégories et calendrier" },
      { label: "FAQ", href: "/#faq", desc: "Questions fréquentes" },
    ],
  },
  { label: "Trouver un DAE", href: "/trouver-un-dae", isPage: true },
  { label: "Notre service", href: "/#service" },
  { label: "Tarifs", href: "/tarifs", isPage: true, badge: "Gratuit" },
  { label: "À propos", href: "/a-propos", isPage: true },
  { label: "Contact", href: "/contact", isPage: true },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(null);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const renderLink = (href: string, isPage: boolean | undefined, children: React.ReactNode, className: string, onClick?: () => void) => {
    if (isPage) {
      return <Link href={href} className={className} onClick={onClick}>{children}</Link>;
    }
    return <a href={href} className={className} onClick={onClick}>{children}</a>;
  };

  return (
    <header className="sticky top-0 z-[1000] bg-white shadow-sm">
      <div className="tricolor-band" aria-hidden="true" />
      <div className="container flex items-center justify-between py-3">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div className="flex items-center justify-center w-10 h-10 rounded bg-[#000091]">
            <Heart className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <span className="block text-[#000091] font-heading text-base font-bold tracking-tight">
              declarerdefibrillateur.fr
            </span>
            <span className="block text-xs text-[#666] font-body">
              Service de déclaration simplifié
            </span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1" aria-label="Navigation principale" ref={dropdownRef}>
          {navLinks.map((link) =>
            link.children ? (
              <div key={link.label} className="relative">
                <button
                  onClick={() => setDropdownOpen(dropdownOpen === link.label ? null : link.label)}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-[#3A3A3A] hover:text-[#000091] hover:bg-[#F6F6F6] rounded-sm transition-colors"
                >
                  {link.label}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${dropdownOpen === link.label ? "rotate-180" : ""}`} />
                </button>
                {dropdownOpen === link.label && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-[#E5E5E5] rounded shadow-lg py-1 z-50">
                    {link.children.map((child) => (
                      <div key={child.href}>
                        {renderLink(
                          child.href,
                          child.isPage,
                          <div className="px-4 py-2.5 hover:bg-[#F6F6F6] transition-colors">
                            <span className="block text-sm font-medium text-[#161616]">{child.label}</span>
                            {child.desc && <span className="block text-xs text-[#929292] mt-0.5">{child.desc}</span>}
                          </div>,
                          "block no-underline",
                          () => setDropdownOpen(null)
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div key={link.href}>
                {renderLink(
                  link.href,
                  link.isPage,
                  <>
                    {link.label}
                    {link.badge && (
                      <span className="ml-1.5 inline-flex items-center bg-[#18753C] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                        {link.badge}
                      </span>
                    )}
                  </>,
                  "px-3 py-2 text-sm font-medium text-[#3A3A3A] hover:text-[#000091] hover:bg-[#F6F6F6] rounded-sm transition-colors no-underline flex items-center",
                )}
              </div>
            )
          )}
          <a
            href="/declaration"
            className="ml-2 px-4 py-2 text-sm font-semibold bg-[#000091] text-white hover:bg-[#000070] rounded-sm transition-colors no-underline flex items-center gap-1.5"
          >
            Déclarer mon DAE
            <ArrowRight className="w-4 h-4" />
          </a>

          {/* User button */}
          {!loading && (
            <div className="relative ml-2" ref={userMenuRef}>
              {user ? (
                <>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center justify-center w-9 h-9 rounded-full border-2 border-[#000091] text-[#000091] hover:bg-[#000091] hover:text-white transition-colors"
                    aria-label="Mon compte"
                  >
                    <User className="w-5 h-5" />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-[#E5E5E5] rounded shadow-lg py-1 z-50">
                      <div className="px-4 py-2.5 border-b border-[#E5E5E5]">
                        <p className="text-sm font-semibold text-[#161616] truncate">{user.email}</p>
                        <p className="text-xs text-[#929292]">{user.role === "ADMIN" ? "Administrateur" : "Utilisateur"}</p>
                      </div>
                      <p className="px-4 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-[#929292]">Mon espace</p>
                      <button
                        onClick={() => { setUserMenuOpen(false); router.push("/dashboard/mes-declarations"); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-[#3A3A3A] hover:bg-[#F6F6F6] transition-colors"
                      >
                        <ClipboardList className="w-4 h-4" />
                        Mes déclarations
                      </button>
                      <button
                        onClick={() => { setUserMenuOpen(false); router.push("/dashboard/profile"); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-[#3A3A3A] hover:bg-[#F6F6F6] transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Mon profil
                      </button>
                      <button
                        onClick={() => { setUserMenuOpen(false); router.push("/dashboard/edit-profile"); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-[#3A3A3A] hover:bg-[#F6F6F6] transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                        Modifier mon profil
                      </button>
                      <button
                        onClick={() => { setUserMenuOpen(false); router.push("/dashboard/change-password"); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-[#3A3A3A] hover:bg-[#F6F6F6] transition-colors"
                      >
                        <KeyRound className="w-4 h-4" />
                        Mot de passe
                      </button>
                      {user.role === "ADMIN" && (
                        <>
                          <div className="border-t border-[#E5E5E5] my-1" />
                          <button
                            onClick={() => { setUserMenuOpen(false); router.push("/admin"); }}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-[#000091] font-medium hover:bg-[#F6F6F6] transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            Administration
                          </button>
                        </>
                      )}
                      <div className="border-t border-[#E5E5E5] my-1" />
                      <button
                        onClick={async () => { setUserMenuOpen(false); await logout(); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-[#E1000F] hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Déconnexion
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <button
                  onClick={() => setAuthOpen(true)}
                  className="flex items-center justify-center w-9 h-9 rounded-full border-2 border-[#CECECE] text-[#929292] hover:border-[#000091] hover:text-[#000091] transition-colors"
                  aria-label="Se connecter"
                >
                  <User className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
        </nav>

        <button
          className="lg:hidden p-2 text-[#3A3A3A] hover:text-[#000091]"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <nav className="lg:hidden border-t border-[#E5E5E5] bg-white" aria-label="Navigation mobile">
          <div className="container py-2">
            {navLinks.map((link) =>
              link.children ? (
                <div key={link.label}>
                  <p className="px-3 py-2 text-xs font-semibold uppercase tracking-widest text-[#929292]">
                    {link.label}
                  </p>
                  {link.children.map((child) => (
                    <div key={child.href}>
                      {renderLink(
                        child.href,
                        child.isPage,
                        <>
                          <span className="text-sm font-medium">{child.label}</span>
                          {child.desc && <span className="text-xs text-[#929292] ml-2">{child.desc}</span>}
                        </>,
                        "block px-3 py-3 text-[#3A3A3A] hover:text-[#000091] no-underline border-b border-[#F6F6F6]",
                        () => setMobileOpen(false)
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div key={link.href}>
                  {renderLink(
                    link.href,
                    link.isPage,
                    <>
                      {link.label}
                      {link.badge && (
                        <span className="ml-1.5 inline-flex items-center bg-[#18753C] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                          {link.badge}
                        </span>
                      )}
                    </>,
                    "flex items-center px-3 py-3 text-sm font-medium text-[#3A3A3A] hover:text-[#000091] no-underline border-b border-[#F6F6F6]",
                    () => setMobileOpen(false)
                  )}
                </div>
              )
            )}
            <a
              href="/declaration"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-3 text-sm font-bold text-[#000091] no-underline"
            >
              Déclarer mon DAE →
            </a>
            {/* Mobile auth */}
            {!loading && (
              <div className="border-t border-[#E5E5E5] mt-1 pt-1">
                {user ? (
                  <>
                    <div className="px-3 py-2">
                      <p className="text-sm font-semibold text-[#161616] truncate">{user.email}</p>
                      <p className="text-xs text-[#929292]">{user.role === "ADMIN" ? "Administrateur" : "Utilisateur"}</p>
                    </div>
                    <p className="px-3 pt-1 pb-0.5 text-[10px] font-semibold uppercase tracking-widest text-[#929292]">Mon espace</p>
                    <button
                      onClick={() => { setMobileOpen(false); router.push("/dashboard/mes-declarations"); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-[#3A3A3A] hover:bg-[#F6F6F6] transition-colors"
                    >
                      <ClipboardList className="w-4 h-4" />
                      Mes déclarations
                    </button>
                    <button
                      onClick={() => { setMobileOpen(false); router.push("/dashboard/profile"); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-[#3A3A3A] hover:bg-[#F6F6F6] transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Mon profil
                    </button>
                    <button
                      onClick={() => { setMobileOpen(false); router.push("/dashboard/edit-profile"); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-[#3A3A3A] hover:bg-[#F6F6F6] transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                      Modifier mon profil
                    </button>
                    <button
                      onClick={() => { setMobileOpen(false); router.push("/dashboard/change-password"); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-[#3A3A3A] hover:bg-[#F6F6F6] transition-colors"
                    >
                      <KeyRound className="w-4 h-4" />
                      Mot de passe
                    </button>
                    {user.role === "ADMIN" && (
                      <>
                        <div className="border-t border-[#E5E5E5] my-1" />
                        <button
                          onClick={() => { setMobileOpen(false); router.push("/admin"); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-[#000091] hover:bg-[#F6F6F6] transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Administration
                        </button>
                      </>
                    )}
                    <div className="border-t border-[#E5E5E5] my-1" />
                    <button
                      onClick={async () => { setMobileOpen(false); await logout(); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-[#E1000F] hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Déconnexion
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { setMobileOpen(false); setAuthOpen(true); }}
                    className="w-full flex items-center gap-2.5 px-3 py-3 text-sm font-medium text-[#000091] hover:bg-[#F6F6F6] transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Se connecter
                  </button>
                )}
              </div>
            )}
          </div>
        </nav>
      )}

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} skipRedirect={pathname === "/declaration"} />
    </header>
  );
}
