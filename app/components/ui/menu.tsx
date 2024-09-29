"use client"

import { CheckIcon, ChevronRightIcon } from "lucide-react"
import type * as React from "react"
import {
  Menu as AriaMenu,
  MenuItem as AriaMenuItem,
  type MenuItemProps as AriaMenuItemProps,
  type MenuProps as AriaMenuProps,
  MenuTrigger as AriaMenuTrigger,
  type MenuTriggerProps as AriaMenuTriggerProps,
  SubmenuTrigger as AriaSubmenuTrigger,
  composeRenderProps,
} from "react-aria-components"
import { type VariantProps, tv } from "tailwind-variants"

import { Kbd } from "./kbd"
import { Overlay, type OverlayProps } from "./overlay"
import { Text } from "./text"

const menuStyles = tv({
  base: [
    "max-h-[inherit] rounded-[inherit] bg-overlay p-1 text-xs outline-none",
    "group-data-[type=drawer]/overlay:p-2",
    "[&_.separator]:-mx-1 [&_.separator]:my-1 [&_.separator]:w-auto",
  ],
})

const menuItemStyles = tv({
  base: [
    "flex cursor-pointer items-center rounded-sm bg-overlay px-3 py-1.5 text-xs outline-none transition-colors focus:bg-overlay-hover disabled:pointer-events-none disabled:opacity-70",
    "selection-multiple:pl-0 selection-single:pl-0",
    "group-data-[type=drawer]/overlay:py-3 group-data-[type=drawer]/overlay:text-sm",
    "group-data-[type=modal]/overlay:py-2 group-data-[type=modal]/overlay:text-sm",
    "[&_svg]:size-3",
  ],
  variants: {
    variant: {
      default: "text-foreground-light",
      success: "text-foreground-light",
      warning: "text-foreground-light",
      accent: "text-foreground-light",
      danger: "text-destructive",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

type MenuRootProps = AriaMenuTriggerProps
const MenuRoot = (props: MenuRootProps) => {
  return <AriaMenuTrigger {...props} />
}

type MenuProps<T> = MenuContentProps<T> & {
  type?: OverlayProps["type"]
  mobileType?: OverlayProps["mobileType"]
  mediaQuery?: OverlayProps["mediaQuery"]
  placement?: OverlayProps["placement"]
}
const Menu = <T extends object>({
  placement,
  type = "popover",
  mobileType = "drawer",
  mediaQuery,
  ...props
}: MenuProps<T>) => {
  return (
    <Overlay type={type} mobileType={mobileType} mediaQuery={mediaQuery} placement={placement}>
      <MenuContent {...props} />
    </Overlay>
  )
}

type MenuContentProps<T> = AriaMenuProps<T>
const MenuContent = <T extends object>({ className, ...props }: MenuContentProps<T>) => {
  return <AriaMenu className={menuStyles({ className })} {...props} />
}

const MenuSub = AriaSubmenuTrigger

interface MenuItemProps<T>
  extends Omit<AriaMenuItemProps<T>, "className">,
    VariantProps<typeof menuItemStyles> {
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  label?: string
  description?: string
  shortcut?: string
  className?: string
}
const MenuItem = <T extends object>({
  className,
  label,
  description,
  prefix,
  suffix,
  shortcut,
  variant,
  ...props
}: MenuItemProps<T>) => {
  return (
    <AriaMenuItem className={menuItemStyles({ className, variant })} {...props}>
      {composeRenderProps(props.children, (children, { selectionMode, isSelected, hasSubmenu }) => (
        <>
          {selectionMode !== "none" && (
            <span className="flex w-8 items-center justify-center">
              {isSelected && <CheckIcon aria-hidden className="size-4 text-foreground-muted" />}
            </span>
          )}
          {prefix}
          <span className="flex items-center gap-2">
            <span className="flex flex-1 flex-col">
              {label && <Text slot="label">{label}</Text>}
              {description && <Text slot="description">{description}</Text>}
              {children}
            </span>
            {suffix}
            {shortcut && <Kbd>{shortcut}</Kbd>}
            {hasSubmenu && <ChevronRightIcon aria-hidden className="size-4" />}
          </span>
        </>
      ))}
    </AriaMenuItem>
  )
}

export type { MenuRootProps, MenuProps }
export { MenuRoot, Menu, MenuItem, MenuContent, MenuSub }
