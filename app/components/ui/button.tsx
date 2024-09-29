"use client"

import { Loader2 } from "lucide-react"
import * as React from "react"
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
  Link as AriaLink,
  type LinkProps as AriaLinkProps,
  composeRenderProps,
} from "react-aria-components"
import { type VariantProps, tv } from "tailwind-variants"
import { focusRing } from "~/lib/utils/styles"

const buttonStyles = tv({
  // extend: focusRing,
  base: "relative inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-sm leading-normal outline-none transition-all duration-200 ease-out disabled:cursor-default disabled:opacity-50",
  variants: {
    variant: {
      default: `
        border border-border-strong
        bg-background-alternative text-foreground hover:border-border-stronger
        hover:bg-background-selection focus-visible:outline-border-strong
        dark:bg-background-muted
        dark:hover:bg-background-muted
        `,
      primary: `
        border border-brand-500/75 bg-brand-400 text-foreground hover:border-brand-600
        hover:bg-brand-400/80 dark:border-brand/30
        dark:bg-brand-500 dark:hover:bg-brand/50
      `,
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      outline:
        "border border-border-strong bg-transparent hover:border-foreground-muted focus-visible:outline-border-strong",
      secondary: `
        border-foreground-light
        bg-foreground text-background
        hover:border-foreground-lighter
        hover:text-border-stronger focus-visible:text-border-control
        focus-visible:outline-border-strong`,
      ghost: "hover:bg-accent hover:text-accent-foreground",
      link: `          
          border
          border-transparent
          border-opacity-0
          bg-opacity-0
          text-brand-600
          shadow-none
          hover:bg-brand-400
          focus-visible:outline-border-strong
        `,
      dashed: `
        border
        border-dashed
        border-border-strong
        bg-transparent text-foreground
        hover:border-border-stronger
        focus-visible:outline-border-strong
      `,
    },
    size: {
      "2xs": "h-[26px] px-2 [&_svg]:size-3.5",
      xs: "h-7 px-2 [&_svg]:size-4",
      sm: "h-8 px-3 [&_svg]:size-4",
      md: "h-9 px-4 [&_svg]:size-4",
      lg: "h-10 px-5 [&_svg]:size-5",
    },
    shape: {
      rectangle: "",
      square: "",
      circle: "rounded-full",
    },
  },
  compoundVariants: [
    {
      size: "xs",
      shape: ["square", "circle"],
      className: "w-7 px-0",
    },
    {
      size: "sm",
      shape: ["square", "circle"],
      className: "w-8 px-0",
    },
    {
      size: "md",
      shape: ["square", "circle"],
      className: "w-9 px-0",
    },
    {
      size: "lg",
      shape: ["square", "circle"],
      className: "w-10 px-0",
    },
  ],
  defaultVariants: {
    variant: "default",
    size: "md",
    shape: "rectangle",
  },
})

interface ButtonProps
  extends Omit<AriaButtonProps, "className">,
    Omit<AriaLinkProps, "className" | "children" | "style">,
    VariantProps<typeof buttonStyles> {
  className?: string
  /**
   * If true, displays a loading spinner and disables the button.
   */
  isLoading?: boolean
  /**
   * Content to be rendered before the button's main content.
   * Typically used for icons or other decorative elements.
   */
  prefix?: React.ReactNode
  /**
   * Content to be rendered after the button's main content.
   * Typically used for icons or other decorative elements.
   */
  suffix?: React.ReactNode
}

const Button = (localProps: ButtonProps) => {
  const contextProps = useButtonContext()
  const props = { ...contextProps, ...localProps }
  const { className, variant, size, shape, isDisabled, isLoading, prefix, suffix, ...restProps } =
    props
  const Element: React.ElementType = props.href ? AriaLink : AriaButton
  return (
    <Element
      {...restProps}
      isDisabled={isDisabled || isLoading}
      className={buttonStyles({ variant, size, shape, className })}
    >
      {composeRenderProps(props.children, (children) => (
        <>
          {isLoading ? <Loader2 aria-label="loading" className="animate-spin" /> : prefix}
          {typeof children === "string" ? <span className="truncate">{children}</span> : children}
          {suffix}
        </>
      ))}
    </Element>
  )
}
Button.displayName = "Button"

type ButtonContextValue = VariantProps<typeof buttonStyles>
const ButtonContext = React.createContext<ButtonContextValue>({})
const useButtonContext = () => {
  return React.useContext(ButtonContext)
}

export type { ButtonProps }
export { Button, buttonStyles, ButtonContext }
