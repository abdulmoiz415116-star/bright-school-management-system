"use client";

import { useTranslations, useLocale } from "next-intl";
import { Globe, Check } from "lucide-react";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageSwitcher() {
  const t = useTranslations("Common");
  const locale = useLocale();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const changeLanguage = (newLocale: string) => {
    Cookies.set("NEXT_LOCALE", newLocale, { expires: 365, path: '/' });
    if (typeof document !== "undefined") {
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    }
    window.location.href = window.location.pathname;
  };

  if (!mounted) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger 
        render={
          <div 
            role="button"
            tabIndex={0}
            className="h-9 px-3 rounded-xl border border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold flex items-center gap-2 transition-all shadow-sm cursor-pointer select-none"
          >
            <Globe className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            <span className="text-xs font-black uppercase text-slate-800 dark:text-slate-200">
              {locale === 'ur' ? '🇵🇰 اردو' : '🇬🇧 EN'}
            </span>
          </div>
        }
      />
      <DropdownMenuContent align="end" className="w-40 rounded-2xl p-2 shadow-xl border-pink-200/80 dark:border-pink-900/40 z-50 bg-white dark:bg-slate-900">
        <DropdownMenuItem 
          onClick={() => changeLanguage("en")} 
          className={`flex items-center justify-between cursor-pointer rounded-xl py-2 px-3 font-bold text-xs transition-colors ${locale === 'en' ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300' : ''}`}
        >
          <span className="flex items-center gap-2">
            <span>🇬🇧</span>
            <span>English</span>
          </span>
          {locale === 'en' && <Check className="w-4 h-4 text-rose-600" />}
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={() => changeLanguage("ur")} 
          className={`flex items-center justify-between cursor-pointer rounded-xl py-2 px-3 font-bold text-sm transition-colors font-nastaleeq ${locale === 'ur' ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300' : ''}`}
        >
          <span className="flex items-center gap-2">
            <span>🇵🇰</span>
            <span>اردو</span>
          </span>
          {locale === 'ur' && <Check className="w-4 h-4 text-rose-600" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
