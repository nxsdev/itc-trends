"use client"

import * as React from "react"
import {
  ToggleButton as AriaToggleButton,
  type ToggleButtonProps as AriaToggleButtonProps,
  composeRenderProps,
} from "react-aria-components"
import { type VariantProps, tv } from "tailwind-variants"
import { focusRing } from "~/lib/utils/styles"

const toggleButtonStyles = tv({
  extend: focusRing,
  base: "inline-flex items-center justify-center gap-2 rounded-md font-medium text-sm leading-normal ring-offset-background transition-colors disabled:cursor-default disabled:bg-bg-disabled disabled:text-fg-disabled",
  variants: {
    variant: {
      quiet:
        "bg-transparent pressed:bg-bg-inverse/20 selected:bg-bg-brand selected:pressed:bg-bg-brand-active selected:text-fg-onPrimary text-fg hover:bg-bg-inverse/10 selected:hover:bg-bg-brand-hover",
      outline:
        "border border-border-field pressed:border-transparent selected:border-transparent bg-transparent pressed:bg-bg-inverse/20 selected:bg-bg-brand selected:pressed:bg-bg-brand-active selected:text-fg-onPrimary text-fg hover:bg-bg-inverse/10 selected:hover:bg-bg-brand-hover",
      accent:
        "border border-border-field pressed:border-transparent selected:border-transparent bg-transparent pressed:bg-bg-inverse/20 selected:bg-bg-accent selected:pressed:bg-bg-accent-active selected:text-fg-onAccent text-fg hover:bg-bg-inverse/10 selected:hover:bg-bg-accent-hover",
    },
    size: {
      sm: "size-8 [&_svg]:size-4",
      md: "size-9 [&_svg]:size-4",
      lg: "size-10 [&_svg]:size-5",
    },
    shape: {
      rectangle: "",
      square: "",
      circle: "rounded-full",
    },
  },
  compoundVariants: [
    {
      size: "sm",
      shape: "rectangle",
      className: "w-auto px-3",
    },
    {
      size: "md",
      shape: "rectangle",
      className: "w-auto px-4",
    },
    {
      size: "lg",
      shape: "rectangle",
      className: "w-auto px-5",
    },
  ],
  defaultVariants: {
    variant: "quiet",
    size: "md",
    shape: "square",
  },
})

interface ToggleButtonProps
  extends Omit<AriaToggleButtonProps, "className">,
    VariantProps<typeof toggleButtonStyles> {
  className?: string
  prefix?: React.ReactNode
  suffix?: React.ReactNode
}

const ToggleButton = React.forwardRef(
  (localProps: ToggleButtonProps, ref: React.ForwardedRef<HTMLButtonElement>) => {
    const contextProps = useToggleButtonContext()
    const props = { ...contextProps, ...localProps }
    const { className, variant, size, shape, prefix, suffix, ...restProps } = props
    return (
      <AriaToggleButton
        ref={ref}
        {...restProps}
        className={toggleButtonStyles({
          variant,
          size,
          shape,
          className,
        })}
      >
        {composeRenderProps(props.children, (children) => (
          <>
            {prefix}
            {typeof children === "string" ? <span className="truncate">{children}</span> : children}
            {suffix}
          </>
        ))}
      </AriaToggleButton>
    )
  }
)
ToggleButton.displayName = "ToggleButton"

type ToggleButtonContextValue = VariantProps<typeof toggleButtonStyles>
const ToggleButtonContext = React.createContext<ToggleButtonContextValue>({})
const useToggleButtonContext = () => {
  return React.useContext(ToggleButtonContext)
}

export type { ToggleButtonProps }
export { ToggleButton, toggleButtonStyles, ToggleButtonContext }
