"use client";

import { ReactNode } from "react";

interface SubscribeLayoutProps {
  children: ReactNode;
  sidebar: ReactNode;
}

export default function SubscribeLayout({ children, sidebar }: SubscribeLayoutProps) {
  return (
    <div className="max-w-6xl mx-auto px-4 pb-8 lg:grid lg:grid-cols-[1fr_380px] lg:gap-8">
      <main className="min-w-0">{children}</main>
      <aside className="hidden lg:block">
        <div className="sticky top-24">{sidebar}</div>
      </aside>
    </div>
  );
}
