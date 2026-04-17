"use client";

import { ReactNode } from "react";

interface DeclarationLayoutProps {
  children: ReactNode;
  sidebar: ReactNode;
}

export default function DeclarationLayout({
  children,
  sidebar,
}: DeclarationLayoutProps) {
  return (
    <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-6">
      <main className="min-w-0">{children}</main>
      <aside className="hidden lg:block">
        <div className="sticky top-24">{sidebar}</div>
      </aside>
    </div>
  );
}
