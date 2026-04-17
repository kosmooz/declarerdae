"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { AuthProvider, useAuth } from "@/lib/auth";
import { Toaster } from "sonner";

function MaintenanceBlocker({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  // Admin pages are always accessible
  if (pathname.startsWith("/admin")) {
    return <>{children}</>;
  }

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <MaintenanceBlocker>
        {children}
      </MaintenanceBlocker>
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}
