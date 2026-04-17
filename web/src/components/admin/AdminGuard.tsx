"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useDevMode } from "@/lib/useDevMode";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const dev = useDevMode();

  useEffect(() => {
    if (!loading && (!user || user.role !== "ADMIN")) {
      router.replace("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F6F6]">
        <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${dev.borderSpinner}`} />
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return <>{children}</>;
}
