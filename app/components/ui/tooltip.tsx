"use client"

import type * as React from "react"
import {
  OverlayArrow as AriaOverlayArrow,
  Tooltip as AriaTooltip,
  type TooltipProps as AriaTooltipProps,
  TooltipTrigger as AriaTooltipTrigger,
  type TooltipTriggerComponentProps as AriaTooltipTriggerProps,
} from "react-aria-components"
import { type VariantProps, tv } from "tailwind-variants"

const tooltipVariants = tv({
  base: "group/tooltip entering:fade-in entering:placement-bottom:slide-in-from-top-0.5 entering:placement-top:slide-in-from-bottom-0.5 entering:placement-left:slide-in-from-right-0.5 entering:placement-right:slide-in-from-left-0.5 exiting:fade-out exiting:placement-bottom:slide-out-to-top-0.5 exiting:placement-top:slide-out-to-bottom-0.5 exiting:placement-left:slide-out-to-right-0.5 exiting:placement-right:slide-out-to-left-0.5 z-50 entering:animate-in exiting:animate-out overflow-hidden rounded-md bg-card/80 px-3 py-1.5 text-foreground text-sm shadow-md entering:ease-out exiting:ease-in will-change-transform",
})

interface TooltipProps
  extends TooltipRootProps,
    Omit<TooltipContentProps, "children">,
    VariantProps<typeof tooltipVariants> {
  content?: React.ReactNode
  arrow?: boolean
}
const Tooltip = ({
  delay,
  closeDelay,
  trigger,
  defaultOpen,
  isOpen,
  onOpenChange,
  isDisabled,
  content,
  arrow = true,
  children,
  ...props
}: TooltipProps) => {
  return (
    <TooltipRoot
      delay={delay}
      closeDelay={closeDelay}
      trigger={trigger}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      isOpen={isOpen}
      isDisabled={isDisabled}
    >
      {children}
      <TooltipContent {...props}>
        {arrow && <OverlayArrow />}
        {content}
      </TooltipContent>
    </TooltipRoot>
  )
}

type TooltipRootProps = AriaTooltipTriggerProps
const TooltipRoot = ({ delay = 400, closeDelay = 0, ...props }: TooltipRootProps) => (
  <AriaTooltipTrigger delay={delay} closeDelay={closeDelay} {...props} />
)

interface TooltipContentProps
  extends Omit<AriaTooltipProps, "className">,
    VariantProps<typeof tooltipVariants> {
  className?: string
}
const TooltipContent = ({ className, offset = 10, ...props }: TooltipContentProps) => {
  return <AriaTooltip offset={offset} className={tooltipVariants({ className })} {...props} />
}

type OverlayArrowProps = Partial<React.SVGProps<SVGSVGElement>>
const OverlayArrow = (props: OverlayArrowProps) => {
  return (
    <AriaOverlayArrow>
      <svg
        width={8}
        height={8}
        viewBox="0 0 8 8"
        className="group-placement-left/tooltip:-rotate-90 z-50 fill-bg-card stroke-border group-placement-bottom/tooltip:rotate-180 group-placement-right/tooltip:rotate-90"
        {...props}
      >
        <path d="M0 0 L6 6 L12 0" />
      </svg>
    </AriaOverlayArrow>
  )
}

export { Tooltip, TooltipRoot, TooltipContent, OverlayArrow }
export type { TooltipProps, TooltipRootProps, TooltipContentProps }
