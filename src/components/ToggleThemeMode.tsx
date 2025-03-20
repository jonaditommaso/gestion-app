"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ToggleThemeMode() {
  const { setTheme, theme = 'light' } = useTheme()

  const THEMES = {
    light: {
      label: 'light',
      icon: <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
    },
    dark: {
      label: 'dark',
      icon: <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    }
  }

  return (
    <Button variant="outline" size="icon" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      {THEMES[theme as keyof typeof THEMES].icon}
    </Button>
  )
}
