"use client"

import { Moon, Sun } from "lucide-react"
import { Theme, useTheme } from "remix-themes"
import { ToggleButton } from "~/components/ui/toggle-button"

export function ModeToggle() {
  const [resolvedTheme, setTheme] = useTheme()

  return (
    <ToggleButton
      onPress={() => setTheme(resolvedTheme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT)}
      variant="quiet"
      size="sm"
      aria-label="Toggle theme"
    >
      {resolvedTheme === "light" ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </ToggleButton>
  )
}
