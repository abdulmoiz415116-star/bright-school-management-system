"use client"

import * as React from "react"
import { Moon, Sun, Palette, Check } from "lucide-react"
import { useTheme, ColorTheme } from "./theme-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"

export function ThemeSwitcher() {
  const { setTheme, theme, setColor, color } = useTheme()

  const colorOptions: { id: ColorTheme; label: string; bgClass: string }[] = [
    { id: "blue", label: "🔵 Royal Blue (شاہی نیلا)", bgClass: "bg-blue-600" },
    { id: "pink", label: "🌸 Pastel Pink (پریمیئم گلابی)", bgClass: "bg-pink-500" },
    { id: "emerald", label: "💚 Emerald Green (زمرد سبز)", bgClass: "bg-emerald-600" },
    { id: "purple", label: "💜 Royal Purple (شاہی جامنی)", bgClass: "bg-purple-600" },
    { id: "gold", label: "👑 Royal Gold (شاہی سنہری)", bgClass: "bg-amber-500" },
    { id: "rose", label: "❤️ Rose Red (سرخ گلاب)", bgClass: "bg-rose-600" },
    { id: "teal", label: "🩵 Sky Teal (آسمانی فیروزی)", bgClass: "bg-teal-500" }
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger 
        render={
          <div 
            role="button" 
            tabIndex={0}
            className="rounded-full shadow-sm border border-blue-200 bg-white hover:bg-blue-50 flex items-center gap-1.5 px-3 h-9 cursor-pointer transition-all outline-none"
          >
            <Palette className="h-4 w-4 text-blue-600 animate-pulse" />
            <span className="text-xs font-bold text-slate-700 hidden sm:inline">Color Palette</span>
          </div>
        }
      />
      <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl shadow-xl border-blue-200 bg-white">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-black uppercase text-slate-500 px-2 py-1">Mode (Light / Dark)</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer rounded-xl font-bold text-xs">
            <Sun className="mr-2 h-4 w-4 text-amber-500" /> Light Mode (روشن موڈ)
            {theme === "light" && <Check className="ml-auto h-4 w-4 text-blue-600" />}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer rounded-xl font-bold text-xs">
            <Moon className="mr-2 h-4 w-4 text-indigo-500" /> Dark Mode (ڈارک موڈ)
            {theme === "dark" && <Check className="ml-auto h-4 w-4 text-blue-600" />}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator className="my-1.5" />
        
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-black uppercase text-slate-500 px-2 py-1">7 Primary Color Themes</DropdownMenuLabel>
          {colorOptions.map((c) => (
            <DropdownMenuItem 
              key={c.id} 
              onClick={() => setColor(c.id)} 
              className={`cursor-pointer rounded-xl font-bold text-xs my-0.5 flex items-center justify-between ${color === c.id ? 'bg-blue-50 text-blue-900' : ''}`}
            >
              <div className="flex items-center">
                <div className={`w-3.5 h-3.5 rounded-full ${c.bgClass} mr-2.5 shadow-sm border border-white`} />
                <span>{c.label}</span>
              </div>
              {color === c.id && <Check className="h-4 w-4 text-blue-600 shrink-0 ml-1" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
