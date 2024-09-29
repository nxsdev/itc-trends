import { cn } from "~/lib/utils"

function ShimmerLoader({
  className,
  show = true,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  show?: boolean
}) {
  if (!show) return props.children
  return (
    <div
      className={cn([
        "relative rounded-lg",
        "before:-translate-x-full before:absolute before:inset-0 before:animate-[shimmer_1.4s_infinite]",
        "before:bg-gradient-to-r before:from-transparent before:via-surface-400/20 before:to-transparent",
        "overflow-hidden before:border-surface-400/20 before:border-t",
        // props.children && "h-auto *:invisible",
        className,
      ])}
      {...props}
    >
      {props.children}
    </div>
  )
}

export { ShimmerLoader }
