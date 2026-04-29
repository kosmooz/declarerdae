"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDevMode } from "@/lib/useDevMode";
import {
  LayoutDashboard,
  Users,
  Settings,
  Shield,
  X,
  ClipboardList,
  BookOpen,
  ChevronDown,
  FileText,
  Tag,
} from "lucide-react";

type SidebarLink = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[];
};

const links: SidebarLink[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/declarations", label: "Déclarations", icon: ClipboardList },
  {
    href: "/admin/blog",
    label: "Blog",
    icon: BookOpen,
    children: [
      { href: "/admin/blog", label: "Articles", icon: FileText },
      { href: "/admin/blog/categories", label: "Catégories", icon: Tag },
    ],
  },
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
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  // Auto-ouvre les groupes contenant la route active
  useEffect(() => {
    const next: Record<string, boolean> = {};
    for (const link of links) {
      if (link.children && pathname.startsWith(link.href)) {
        next[link.href] = true;
      }
    }
    setOpenGroups((prev) => ({ ...prev, ...next }));
  }, [pathname]);

  const isExactActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    if (href === "/admin/blog") return pathname === "/admin/blog";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const isGroupActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const handleNavigate = (href: string) => {
    router.push(href);
    onClose();
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
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;

            if (link.children) {
              const groupOpen = openGroups[link.href] ?? false;
              const groupActive = isGroupActive(link.href);
              return (
                <div key={link.href}>
                  <button
                    type="button"
                    onClick={() =>
                      setOpenGroups((prev) => ({
                        ...prev,
                        [link.href]: !groupOpen,
                      }))
                    }
                    aria-expanded={groupOpen}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                      groupActive
                        ? "bg-white/10 text-white"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                    <span className="flex-1 text-left">{link.label}</span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        groupOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {groupOpen && (
                    <div className="mt-1 ml-3 space-y-0.5 border-l border-white/15 pl-3">
                      {link.children.map((child) => {
                        const ChildIcon = child.icon;
                        const childActive = isExactActive(child.href);
                        return (
                          <button
                            key={child.href}
                            type="button"
                            onClick={() => handleNavigate(child.href)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-all duration-150 ${
                              childActive
                                ? `${dev.bgActive} text-white shadow-sm`
                                : "text-white/60 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            <ChildIcon className="h-4 w-4" />
                            {child.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const active = isGroupActive(link.href);
            return (
              <button
                key={link.href}
                onClick={() => handleNavigate(link.href)}
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
