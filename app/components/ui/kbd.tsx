"use client"

import type * as React from "react"
import { Keyboard } from "react-aria-components"
import { tv } from "tailwind-variants"

const KbdStyles = tv({
  base: "text-foreground-muted text-xs tracking-widest",
  variants: {
    variant: {
      default: "",
      outline: "rounded-md border px-2 py-1",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

type KbdProps = React.HTMLAttributes<HTMLElement>
const Kbd = ({ className, ...props }: KbdProps) => {
  return <Keyboard className={KbdStyles({ className })} {...props} />
}

export type { KbdProps }
export { Kbd, KbdStyles }
