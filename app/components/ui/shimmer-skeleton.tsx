import { cn } from "~/lib/utils"

function ShimmerSkeleton({
  className,
  show = true,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  show?: boolean
}) {
  if (!show) return props.children
  return (
    <div className={cn("rounded-md bg-background-selection", className)} {...props}>
      {props.children}
    </div>
  )
}

export { ShimmerSkeleton }
