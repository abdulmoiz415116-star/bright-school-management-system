"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NotificationBell } from "@/components/NotificationBell";
import { useAdminProfile } from "@/hooks/useAdminProfile";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import Cookies from "js-cookie";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TopNav() {
  const profile = useAdminProfile();
  const locale = useLocale();
  const isUrdu = locale === 'ur';

  const handleLogout = () => {
    Cookies.remove("auth_token", { path: '/' });
    Cookies.remove("user_role", { path: '/' });
    Cookies.remove("user_email", { path: '/' });
    if (typeof document !== "undefined") {
      document.cookie = "auth_token=; path=/; max-age=0";
      document.cookie = "user_role=; path=/; max-age=0";
    }
    window.location.href = "/login";
  };

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-10 px-6">
      <SidebarTrigger className="-ml-2 text-muted-foreground hover:text-foreground" />
      <div className="flex-1" />
      <div className="flex items-center gap-4">
        <ThemeSwitcher />
        <NotificationBell />
        
        {/* Clickable Super Admin Profile Link */}
        <Link href="/profile" className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition group">
          <div className="flex flex-col items-end hidden md:flex text-right">
            <span className="text-sm font-bold text-foreground group-hover:text-rose-600 transition">
              {profile.firstName} {profile.lastName}
            </span>
            <span className="text-[11px] text-rose-600 font-semibold">Super Admin Panel</span>
          </div>
          <Avatar className="h-10 w-10 border-2 border-rose-300 shadow-sm group-hover:scale-105 transition-transform">
            <AvatarImage src="/admin_avatar.png" />
            <AvatarFallback>SA</AvatarFallback>
          </Avatar>
        </Link>

        {/* Prominent Header Logout Button */}
        <Button 
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-bold text-xs flex items-center gap-1.5 ml-2"
          title="Logout of system"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{isUrdu ? 'لاگ آؤٹ' : 'Logout'}</span>
        </Button>
      </div>
    </header>
  );
}
