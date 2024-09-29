import { tv } from "tailwind-variants"

export const focusRing = tv({
  base: "outline-none ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
})

export const focusRingGroup = tv({
  base: "outline-none ring-0 ring-ring group-focus-visible:ring-1",
})

export const focusInput = tv({
  base: "focus-within:border-foreground/30 focus-within:ring-1 focus-within:ring-ring",
})
