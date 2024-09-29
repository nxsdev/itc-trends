import type * as React from "react"
import { type VariantProps, tv } from "tailwind-variants"
import { cn } from "~/lib/utils"

const badgeVariants = tv({
  base: "inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md font-semibold text-xs transition-colors",
  variants: {
    variant: {
      default: `
        border border-border-strong
        bg-background-alternative text-foreground
        dark:bg-background-muted
        `,
      secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
      destructive:
        "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
      outline: "border text-foreground",
      // success: "bg-bg-success text-fg-onSuccess",
      // "success-subtle": "bg-bg-success-muted/50 text-fg-success",
      // "success-outline": "border-border-success text-fg-success border",
      // danger: "bg-destructive text-destructive-foreground",
      // "danger-subtle": "bg-destructive-muted/50 text-destructive",
      // "danger-outline": "border-border-danger border text-destructive",
      // warning: "bg-bg-warning text-fg-onWarning",
      // "warning-subtle": "bg-bg-warning-muted/50 text-fg-warning",
      // "warning-outline": "border-border-warning text-fg-warning border",
      // accent: "bg-bg-accent text-fg-onAccent",
      // "accent-subtle": "bg-bg-accent-muted text-fg-accent",
      // "accent-outline": "border-border-accent text-fg-accent border",
    },
    size: {
      sm: "h-5 px-2.5 [&_svg]:size-3",
      md: "h-6 px-3 [&_svg]:size-3.5",
      lg: "h-7 px-4 text-sm [&_svg]:size-4",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "sm",
  },
})

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode
}

function Badge({ children, className, variant, size, icon, ...props }: BadgeProps) {
  return (
    <span
      role="presentation"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    >
      {icon && <span>{icon}</span>}
      <span>{children}</span>
    </span>
  )
}

export { Badge, badgeVariants }
