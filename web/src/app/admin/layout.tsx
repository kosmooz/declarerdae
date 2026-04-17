"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { useAuth } from "@/lib/auth";
import { useDevMode } from "@/lib/useDevMode";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, Shield, User, ExternalLink, LogOut, ChevronDown, LayoutDashboard, ClipboardList, BookOpen, Users, Settings, Home, ChevronRight } from "lucide-react";

const PAGE_TITLES: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  "/admin": { label: "Tableau de bord", icon: LayoutDashboard },
  "/admin/declarations": { label: "Déclarations", icon: ClipboardList },
  "/admin/blog": { label: "Blog", icon: BookOpen },
  "/admin/users": { label: "Utilisateurs", icon: Users },
  "/admin/reglages": { label: "Réglages", icon: Settings },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const dev = useDevMode();

  // Match current page title: try exact match first, then prefix match for sub-pages
  const pageInfo = PAGE_TITLES[pathname] || Object.entries(PAGE_TITLES).find(([key]) => key !== "/admin" && pathname.startsWith(key))?.[1];

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const initials = user
    ? `${(user.firstName || "")[0] || ""}${(user.lastName || "")[0] || ""}`.toUpperCase() || user.email[0].toUpperCase()
    : "?";

  const fullName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email
    : "";

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-[#F6F6F6]">
        <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <header className="flex items-center justify-between px-4 py-1.5 bg-white border-b">
            {/* Left: mobile menu + breadcrumb */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-1.5 rounded-lg hover:bg-[#F6F6F6] transition-colors"
              >
                <Menu className="h-5 w-5 text-[#3A3A3A]" />
              </button>
              <div className="flex items-center gap-2 lg:hidden">
                <div className={`w-7 h-7 rounded-lg ${dev.bgShield} flex items-center justify-center`}>
                  <Shield className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="font-semibold text-sm text-[#3A3A3A]">Admin</span>
              </div>

              {/* Breadcrumb */}
              <nav className="hidden lg:flex items-center gap-1.5 text-sm">
                <a href="/admin" className="text-[#929292] hover:text-[#000091] transition-colors">
                  <Home className="h-4 w-4" />
                </a>
                {pageInfo && pathname !== "/admin" && (
                  <>
                    <ChevronRight className="h-3.5 w-3.5 text-[#929292]" />
                    <span className="font-medium text-[#3A3A3A]">{pageInfo.label}</span>
                  </>
                )}
              </nav>
            </div>

            {/* Right: user dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 hover:bg-[#F6F6F6] transition-colors outline-none">
                  <div className="w-8 h-8 rounded-full bg-[#000091]/10 text-[#000091] flex items-center justify-center text-xs font-bold shrink-0">
                    {initials}
                  </div>
                  <div className="hidden sm:block text-left min-w-0">
                    <p className="text-sm font-medium text-[#3A3A3A] truncate max-w-[160px]">{fullName}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-[#929292] shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{fullName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
                  <User className="h-4 w-4" />
                  Profil détaillé
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/")}>
                  <ExternalLink className="h-4 w-4" />
                  Retour au site
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </AdminGuard>
  );
}
