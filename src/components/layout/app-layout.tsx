"use client";

import { AppHeader, SideMenu } from "@/components";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex items-start gap-4">
      <SideMenu />
      <div className="grow w-full">
        <AppHeader />
        {children}
      </div>
    </div>
  );
}
