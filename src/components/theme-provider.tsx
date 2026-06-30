"use client"

import * as React from "react"

export type Theme = "dark" | "light" | "system"
export type ColorTheme = "blue" | "pink" | "emerald" | "purple" | "gold" | "rose" | "teal"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  color: ColorTheme
  setColor: (color: ColorTheme) => void
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = React.useContext(ThemeContext)
  if (!context) throw new Error("useTheme must be used within ThemeProvider")
  return context
}

export function useColorTheme() {
  return useTheme()
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>("light")
  const [color, setColorState] = React.useState<ColorTheme>("blue")

  React.useEffect(() => {
    const savedTheme = (localStorage.getItem("theme") as Theme) || "light"
    const savedColor = (localStorage.getItem("app-color-theme") as ColorTheme) || "blue"
    
    setTheme(savedTheme)
    setColor(savedColor)
  }, [])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem("theme", newTheme)
    
    const isDark = 
      newTheme === "dark" || 
      (newTheme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
    
    if (isDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  const setColor = (newColor: ColorTheme) => {
    setColorState(newColor)
    localStorage.setItem("app-color-theme", newColor)
    document.documentElement.setAttribute("data-theme", newColor)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, color, setColor }}>
      {children}
    </ThemeContext.Provider>
  )
}
