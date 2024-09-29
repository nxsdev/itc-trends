"use client"

import { CheckIcon, Loader2 } from "lucide-react"
import React from "react"
import {
  Collection as AriaCollection,
  ListBox as AriaListBox,
  ListBoxItem as AriaListBoxItem,
  type ListBoxItemProps as AriaListBoxItemProps,
  type ListBoxProps as AriaListBoxProps,
  ListStateContext,
  composeRenderProps,
} from "react-aria-components"
import { type VariantProps, tv } from "tailwind-variants"
import { focusRing } from "~/lib/utils/styles"

import { Text } from "./text"

const listBoxStyles = tv({
  base: [
    focusRing(),
    "flex layout-grid:grid layout-grid:w-auto orientation-horizontal:w-auto layout-grid:grid-cols-2 orientation-horizontal:flex-row flex-col overflow-auto border border-overlay bg-overlay p-1 shadow-md outline-none empty:min-h-24 empty:items-center empty:justify-center empty:text-foreground-muted empty:text-sm empty:italic",
    "[&_.separator]:-mx-1 [&_.separator]:my-1 [&_.separator]:w-auto",
  ],
  variants: {
    standalone: {
      true: "max-h-60 w-48 overflow-y-auto rounded-md border border-overlay bg-overlay",
      false: "max-h-[inherit] rounded-[inherit]",
    },
  },
})

const listBoxItemStyles = tv({
  base: [
    "flex cursor-pointer items-center rounded-sm bg-overlay px-3 py-1.5 text-sm outline-none transition-colors hover:bg-overlay-hover focus:bg-overlay-hover disabled:pointer-events-none disabled:opacity-50",
    "selection-multiple:pl-0 selection-single:pl-0",
    "[&_svg]:size-4",
  ],
  variants: {
    variant: {
      default: "text-foreground-light",
      // success: "text-fg-success",
      // warning: "text-fg-warning",
      accent: "text-accent-foreground",
      destructive: "text-destructive",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

interface ListBoxProps<T> extends AriaListBoxProps<T> {
  isLoading?: boolean
}
const ListBox = <T extends object>({ children, isLoading, ...props }: ListBoxProps<T>) => {
  const state = React.useContext(ListStateContext)
  const standalone = !state
  return (
    <AriaListBox
      {...props}
      className={composeRenderProps(props.className, (className) =>
        listBoxStyles({ standalone, className })
      )}
    >
      <AriaCollection items={props.items}>{children}</AriaCollection>
      {isLoading && (
        <AriaListBoxItem className="flex items-center justify-center py-1.5">
          <Loader2
            aria-label="Loading more..."
            className="size-5 animate-spin text-foreground-muted"
          />
        </AriaListBoxItem>
      )}
    </AriaListBox>
  )
}

interface ItemProps<T> extends AriaListBoxItemProps<T>, VariantProps<typeof listBoxItemStyles> {
  label?: string
  description?: string
  prefix?: React.ReactNode
  suffix?: React.ReactNode
}
const Item = <T extends object>({
  variant,
  label,
  description,
  prefix,
  suffix,
  ...props
}: ItemProps<T>) => {
  const textValue =
    props.textValue || (typeof props.children === "string" ? props.children : undefined)
  return (
    <AriaListBoxItem
      {...props}
      textValue={textValue}
      className={composeRenderProps(props.className, (className) =>
        listBoxItemStyles({ variant, className })
      )}
    >
      {composeRenderProps(props.children, (children, { isSelected, selectionMode }) => (
        <>
          {selectionMode !== "none" && (
            <span className="flex w-8 shrink-0 items-center justify-center">
              {isSelected && <CheckIcon aria-hidden className="size-4 text-accent-foreground" />}
            </span>
          )}
          <span className="flex items-center gap-3">
            {prefix}
            <span className="flex flex-1 flex-col">
              {label && <Text slot="label">{label}</Text>}
              {description && <Text slot="description">{description}</Text>}
              {children}
            </span>
            {suffix}
          </span>
        </>
      ))}
    </AriaListBoxItem>
  )
}

export type { ListBoxProps, ItemProps }
export { ListBox, Item }
