"use client"

import {
  Switch as AriaSwitch,
  type SwitchProps as AriaSwitchProps,
  composeRenderProps,
} from "react-aria-components"
import { type VariantProps, tv } from "tailwind-variants"

const switchStyles = tv({
  slots: {
    root: "group/switch flex items-center gap-3 disabled:opacity-50",
    wrapper: [
      "inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-all duration-200 ease-in-out group-focus/switch:ring-2 group-focus/switch:ring-foreground-muted/40 group-selected/switch:bg-brand",
      "bg-foreground-muted/40 hover:bg-foreground-muted/60 group-disabled/switch:cursor-not-allowed group-disabled/switch:border group-disabled/switch:bg-transparent group-disabled/switch:group-selected/switch:border-none group-disabled/switch:group-selected/switch:opacity-50",
    ],
    indicator:
      "pointer-events-none block origin-right rounded-full bg-white shadow ring-0 transition-all duration-200 ease-in-out group-disabled/switch:opacity-50",
    label: "",
  },
  variants: {
    size: {
      sm: {
        wrapper: "h-5 w-9",
        indicator:
          "size-4 group-selected/switch:group-pressed/switch:ml-3 group-selected/switch:ml-4 group-pressed/switch:w-5",
      },
      md: {
        wrapper: "h-6 w-11",
        indicator:
          "size-5 group-selected/switch:group-pressed/switch:ml-4 group-selected/switch:ml-5 group-pressed/switch:w-6",
      },
      lg: {
        wrapper: "h-7 w-12",
        indicator:
          "size-6 group-selected/switch:group-pressed/switch:ml-5 group-selected/switch:ml-6 group-pressed/switch:w-7",
      },
    },
  },
  defaultVariants: {
    size: "md",
  },
})

interface SwitchProps
  extends Omit<AriaSwitchProps, "className">,
    VariantProps<typeof switchStyles> {
  className?: string
}
const Switch = ({ className, size, ...props }: SwitchProps) => {
  const { root, wrapper, indicator, label } = switchStyles({ size })

  return (
    <AriaSwitch className={root({ className })} {...props}>
      {composeRenderProps(props.children, (children) => (
        <>
          <span className={wrapper({ className })}>
            <span className={indicator({})} style={{ contain: "layout" }} />
          </span>
          {children && <span className={label({})}>{children}</span>}
        </>
      ))}
    </AriaSwitch>
  )
}

export { Switch }
