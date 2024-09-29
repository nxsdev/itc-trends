import { MoveRight, TrendingDown, TrendingUp } from "lucide-react"
import type * as React from "react"
import { type VariantProps, tv } from "tailwind-variants"
import { cn } from "~/lib/utils"

const trendingBadgeVariants = tv({
  base: "inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md font-semibold text-xs transition-colors",
  variants: {
    variant: {
      up: "border border-brand/40 bg-brand-400/20 text-brand",
      down: "border border-destructive/40 bg-destructive-400/10 text-destructive",
      flat: "border border-warning/40 bg-warning-400/20 text-warning",
    },
    size: {
      sm: "h-5 px-2.5 [&_svg]:size-3",
      md: "h-6 px-3 [&_svg]:size-3.5",
      lg: "h-7 px-4 text-sm [&_svg]:size-4",
    },
  },
  defaultVariants: {
    variant: "up",
    size: "sm",
  },
})

export interface TrendingBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof trendingBadgeVariants> {
  icon?: React.ReactNode
  value?: number
  percentage?: number
}

function TrendingBadge({
  children,
  className,
  variant,
  size,
  value,
  percentage,
  ...props
}: TrendingBadgeProps) {
  return (
    <span
      role="presentation"
      className={cn(trendingBadgeVariants({ variant, size }), className)}
      {...props}
    >
      {variant === "up" && <TrendingUp />}
      {variant === "down" && <TrendingDown />}
      {variant === "flat" && <MoveRight />}
      {value !== undefined && (
        <span className="flex items-center gap-1">
          {value > 0 ? "+" : value < 0 ? "-" : ""}
          {Math.abs(value)}{" "}
          {percentage !== undefined && (
            <span>
              ({value < 0 ? "" : ""}
              {percentage}%)
            </span>
          )}
        </span>
      )}
      {children}
    </span>
  )
}

export { TrendingBadge, trendingBadgeVariants }
