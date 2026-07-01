"use client";

import { Home, Users, BookOpen, CreditCard, Settings, LogOut, Library, ShieldCheck, UserPlus, CalendarCheck, FileText, Bus, Building, Bell, Calendar, Package, GraduationCap, Award, BarChart3 } from "lucide-react"
import Link from "next/link"
import { useTranslations, useLocale } from "next-intl"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import Cookies from "js-cookie"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LanguageSwitcher } from "./LanguageSwitcher"
import { useAdminProfile } from "@/hooks/useAdminProfile"

const getAdminItems = (t: any, isUrdu: boolean) => [
  { title: t("dashboard"), url: "/", icon: Home },
  { title: t("admission"), url: "/admission", icon: GraduationCap },
  { title: isUrdu ? "رزلٹ کارڈز" : "Result Cards", url: "/results", icon: Award },
  { title: t("academics"), url: "/academics", icon: Library },
  { title: isUrdu ? "بیچ پروموشن" : "Batch Promotion", url: "/academics/promotion", icon: GraduationCap },
  { title: t("timetable"), url: "/timetable", icon: Calendar },
  { title: t("attendance"), url: "/attendance", icon: CalendarCheck },
  { title: t("exams"), url: "/exams", icon: FileText },
  { title: t("students"), url: "/students", icon: Users },
  { title: t("teachers"), url: "/teachers", icon: BookOpen },
  { title: t("staff"), url: "/staff", icon: ShieldCheck },
  { title: t("parents"), url: "/parents", icon: UserPlus },
  { title: t("finance"), url: "/finance", icon: CreditCard },
  { title: isUrdu ? "رپورٹس اور تجزیات" : "Reports & Analytics", url: "/reports", icon: BarChart3 },
  { title: t("notices"), url: "/notices", icon: Bell },
  { title: t("library"), url: "/library", icon: BookOpen },
  { title: t("transport"), url: "/transport", icon: Bus },
  { title: t("hostel"), url: "/hostel", icon: Building },
  { title: t("inventory"), url: "/inventory", icon: Package },
  { title: t("settings"), url: "/settings", icon: Settings },
]

const getParentItems = (isUrdu: boolean) => [
  { title: isUrdu ? "بچے کی تفصیلات" : "Child Details", url: "/portal/parents", icon: Home },
  { title: isUrdu ? "رزلٹ کارڈ" : "Result Card", url: "/portal/parents#exams", icon: Award },
  { title: isUrdu ? "فیس کی تفصیلات" : "Fee Details", url: "/portal/parents#fees", icon: CreditCard },
  { title: isUrdu ? "حاضری" : "Attendance", url: "/portal/parents#attendance", icon: CalendarCheck },
]

export function AppSidebar() {
  const t = useTranslations("Sidebar");
  const intlLocale = useLocale();
  const [activeLocale, setActiveLocale] = useState(intlLocale);
  const profile = useAdminProfile();
  const router = useRouter();

  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const cookieLocale = Cookies.get("NEXT_LOCALE");
    if (cookieLocale) {
      setActiveLocale(cookieLocale);
    } else {
      setActiveLocale(intlLocale);
    }

    const currentRole = Cookies.get("user_role");
    setRole(currentRole || "Super Admin");
  }, [intlLocale]);

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

  const isUrdu = activeLocale === 'ur';
  const isParent = role === "Parent" || pathname?.startsWith("/portal");
  const items = isParent ? getParentItems(isUrdu) : getAdminItems(t, isUrdu);

  return (
    <Sidebar side={isUrdu ? 'right' : 'left'} className="border-r-0 bg-sidebar/80 backdrop-blur-xl text-sidebar-foreground shadow-[10px_0_30px_rgb(0,0,0,0.03)] dark:shadow-[10px_0_30px_rgb(0,0,0,0.1)]">
      <SidebarHeader className="p-4 border-b border-border/50 flex flex-row items-center justify-between">
        <div className="flex items-center gap-3 px-1 py-1">
          <img 
            src="/school_logo.png" 
            alt="Bright School & Montessori System Logo" 
            className="w-11 h-11 object-contain shrink-0 drop-shadow-sm"
          />
          <div className="overflow-hidden">
            <h2 className="font-bold text-foreground leading-tight text-sm truncate">
              {isUrdu ? 'برائٹ سکول' : 'Bright School'}
            </h2>
            <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold truncate">
              {isUrdu ? 'اینڈ مونٹیسوری سسٹم' : '& Montessori System'}
            </p>
          </div>
        </div>
        <LanguageSwitcher />
      </SidebarHeader>
      
      <SidebarContent className="px-2 mt-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 ml-2">
            {t("mainMenu")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    render={
                      <Link href={item.url} className="flex items-center gap-3 px-3 w-full">
                        <item.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                        <span className="font-medium text-[15px]">{item.title}</span>
                      </Link>
                    }
                    className="hover:bg-primary/10 hover:text-primary transition-all rounded-lg py-5 mb-1 group cursor-pointer w-full"
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/50 bg-muted/20">
        <DropdownMenu>
          <DropdownMenuTrigger 
            render={
              <div className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded-xl transition-colors outline-none w-full text-left select-none">
                <Avatar className="border-2 border-rose-400 shadow-sm">
                  <AvatarImage src={isParent ? "/parent_avatar.png" : "/admin_avatar.png"} />
                  <AvatarFallback>{isParent ? "PR" : "AD"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden text-left rtl:text-right">
                  <p className="text-sm font-bold text-foreground truncate">
                    {isParent ? (isUrdu ? "طارق محمود" : "Tariq Mahmood") : `${profile.firstName} ${profile.lastName}`}
                  </p>
                  <p className="text-xs text-rose-600 font-semibold truncate">
                    {isParent ? (isUrdu ? "والدین پورٹل" : "Parent Portal") : (isUrdu ? "سپر ایڈمن پینل" : "Super Admin Panel")}
                  </p>
                </div>
              </div>
            }
          />
          <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-xl z-50 bg-white dark:bg-slate-900">
            <DropdownMenuLabel className="font-bold">{t("myAccount")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {!isParent && (
              <>
                <DropdownMenuItem onClick={() => router.push('/profile')} className="w-full flex items-center cursor-pointer rounded-xl py-2 font-bold text-xs">
                  <Users className="mr-2 h-4 w-4 text-rose-600" />
                  <span>{isUrdu ? 'سپر ایڈمن پروفائل پورٹل' : 'Super Admin Profile'}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/settings')} className="w-full flex items-center cursor-pointer rounded-xl py-2 font-bold text-xs">
                  <Settings className="mr-2 h-4 w-4 text-slate-500" />
                  <span>{t("settings")}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onClick={handleLogout} className="text-rose-600 focus:text-rose-600 cursor-pointer rounded-xl py-2 font-bold text-xs">
              <LogOut className="mr-2 h-4 w-4" />
              <span>{isUrdu ? 'لاگ آؤٹ کریں (Logout)' : 'Logout'}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
