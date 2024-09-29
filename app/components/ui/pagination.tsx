import { DotsHorizontalIcon } from "@radix-ui/react-icons"
import { Link, type LinkProps, useNavigate } from "@remix-run/react"
import { ArrowLeft, ArrowRight, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import * as React from "react"
import { Link as AriaLink } from "react-aria-components"
import { Button, type ButtonProps, buttonStyles } from "~/components/ui/button"
import { cn } from "~/lib/utils"

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
)
Pagination.displayName = "Pagination"

const PaginationContent = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} className={cn("flex flex-row items-center gap-1", className)} {...props} />
  )
)
PaginationContent.displayName = "PaginationContent"

const PaginationItem = React.forwardRef<HTMLLIElement, React.ComponentProps<"li">>(
  ({ className, ...props }, ref) => <li ref={ref} className={cn("", className)} {...props} />
)
PaginationItem.displayName = "PaginationItem"

type PaginationLinkProps = {
  isActive?: boolean
  to: string
} & Pick<ButtonProps, "shape"> &
  React.ComponentProps<"a">

const PaginationLink = ({ className, isActive, children, to, ...props }: PaginationLinkProps) => {
  return (
    <Link
      to={to}
      aria-current={isActive ? "page" : undefined}
      prefetch="intent"
      preventScrollReset
      className={cn(
        buttonStyles({
          variant: "outline",
          shape: "square",
          size: "lg",
          className: isActive ? "mx-auto rounded-lg bg-surface-300" : "mx-auto rounded-lg",
        }),
        className
      )}
      {...props}
    >
      {children}
      {!children && <span className="sr-only">ページ</span>}
    </Link>
  )
}
PaginationLink.displayName = "PaginationLink"

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to previous page"
    shape="rectangle"
    className={cn("mr-2 gap-1", className)}
    {...props}
  >
    <ArrowLeft className="size-4 text-foreground-light" />
  </PaginationLink>
)
PaginationPrevious.displayName = "PaginationPrevious"

const PaginationNext = ({ className, ...props }: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to next page"
    shape="rectangle"
    className={cn("ml-2 gap-1", className)}
    {...props}
  >
    <ArrowRight className="size-4 text-foreground-light" />
  </PaginationLink>
)
PaginationNext.displayName = "PaginationNext"

interface PaginationEllipsisProps extends LinkProps {
  direction?: "left" | "right"
}

const PaginationEllipsis = ({
  className,
  direction = "right",
  to,
  ...props
}: PaginationEllipsisProps) => {
  const [isHovered, setIsHovered] = React.useState(false)

  const handleHoverStart = () => setIsHovered(true)
  const handleHoverEnd = () => setIsHovered(false)

  const Icon = isHovered
    ? direction === "left"
      ? ChevronLeftIcon
      : ChevronRightIcon
    : DotsHorizontalIcon

  return (
    <Link
      to={to}
      prefetch="intent"
      preventScrollReset
      className={cn(
        buttonStyles({
          variant: "outline",
          shape: "square",
          size: "lg",
        }),
        "mx-auto rounded-lg",
        className
      )}
      onMouseEnter={handleHoverStart}
      onMouseLeave={handleHoverEnd}
      {...props}
    >
      <Icon className="size-4" />
    </Link>
  )
}
PaginationEllipsis.displayName = "PaginationEllipsis"

interface PaginationButtonProps extends ButtonProps {
  isActive?: boolean
  children?: React.ReactNode
}

/**
 * サーバーでページングする用のボタン
 */
const PaginationButton = ({ className, isActive, children, ...props }: PaginationButtonProps) => {
  return (
    <Button
      aria-current={isActive ? "page" : undefined}
      className={cn("mx-auto rounded-lg", isActive ? "bg-surface-300" : "", className)}
      {...props}
    >
      {children}
      {!children && <span className="sr-only">ページ</span>}
    </Button>
  )
}
PaginationButton.displayName = "PaginationButton"

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
  PaginationButton,
}
