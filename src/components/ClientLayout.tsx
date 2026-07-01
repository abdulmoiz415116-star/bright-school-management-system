"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Define paths that should NOT show the sidebar (e.g. /login)
  const isNoSidebar = pathname === "/login";

  if (isNoSidebar) {
    return (
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden transition-all duration-300 ease-in-out">
        {children}
      </main>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden transition-all duration-300 ease-in-out">
        {children}
      </main>
    </SidebarProvider>
  );
}
