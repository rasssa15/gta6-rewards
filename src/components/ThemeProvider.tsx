"use client"
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"

type Theme = "default" | "gta-neon"

interface ThemeContextType {
  theme: Theme
  setTheme: (t: Theme) => void
  applyTheme: (walletId: string, t: Theme) => Promise<void>
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "default",
  setTheme: () => {},
  applyTheme: async () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("default")

  useEffect(() => {
    const saved = localStorage.getItem("g6r-theme") as Theme | null
    if (saved) setThemeState(saved)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
    localStorage.setItem("g6r-theme", theme)
  }, [theme])

  const applyTheme = useCallback(async (walletId: string, t: Theme) => {
    try {
      await fetch(`/api/users/${walletId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: t }),
      })
    } catch {}
    setThemeState(t)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeState, applyTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
