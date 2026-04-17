"use client";

import { usePathname, useRouter } from "next/navigation";
import { useDevMode } from "@/lib/useDevMode";
import { LayoutDashboard, Users, Settings, Shield, X, ClipboardList, BookOpen } from "lucide-react";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/declarations", label: "Déclarations", icon: ClipboardList },
  { href: "/admin/blog", label: "Blog", icon: BookOpen },
  { href: "/admin/users", label: "Utilisateurs", icon: Users },
  { href: "/admin/reglages", label: "Réglages", icon: Settings },
];

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const dev = useDevMode();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#1B1B35] text-white flex flex-col transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Tricolor band */}
        <div className="tricolor-band shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/15">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg ${dev.bgShield} flex items-center justify-center shrink-0`}>
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-sm">DéclarerDéfibrillateur</span>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 rounded hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <button
                key={link.href}
                onClick={() => {
                  router.push(link.href);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  active
                    ? `${dev.bgActive} text-white shadow-sm border-l-2 border-white`
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" />
                {link.label}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
