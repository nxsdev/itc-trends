"use client"

import * as React from "react"
import {
  Tab as AriaTab,
  TabList as AriaTabList,
  type TabListProps as AriaTabListProps,
  TabPanel as AriaTabPanel,
  type TabPanelProps as AriaTabPanelProps,
  type TabProps as AriaTabProps,
  Tabs as AriaTabs,
  type TabsProps as AriaTabsProps,
  composeRenderProps,
} from "react-aria-components"
import { cn } from "~/lib/utils"

function Tabs({ className, ...props }: AriaTabsProps) {
  return (
    <AriaTabs
      className={composeRenderProps(className, (className) =>
        cn(
          "group flex flex-col gap-2",
          /* Orientation */
          "data-[orientation=vertical]:flex-row",
          className
        )
      )}
      {...props}
    />
  )
}

const TabList = <T extends object>({ className, ...props }: AriaTabListProps<T>) => (
  <AriaTabList
    className={composeRenderProps(className, (className) =>
      cn(
        "inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background-muted px-1",
        /* Orientation */
        "data-[orientation=vertical]:h-auto data-[orientation=vertical]:flex-col",
        className
      )
    )}
    {...props}
  />
)

const Tab = ({ className, ...props }: AriaTabProps) => (
  <AriaTab
    className={composeRenderProps(className, (className) =>
      cn(
        "inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-md px-3 py-1 font-medium text-foreground-light text-sm outline-none ring-offset-background transition-all duration-200 ease-in-out",
        /* Hover */
        "data-[hovered]:bg-surface-200",
        /* Focus Visible */
        "data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring data-[focus-visible]:ring-offset-2",
        /* Disabled */
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        /* Selected */
        "data-[selected]:bg-background data-[selected]:text-foreground data-[selected]:shadow dark:data-[selected]:bg-background-200/100",
        /* Orientation */
        "group-data-[orientation=vertical]:w-full",
        className
      )
    )}
    {...props}
  />
)

const TabPanel = ({ className, ...props }: AriaTabPanelProps) => (
  <AriaTabPanel
    className={composeRenderProps(className, (className) =>
      cn(
        "mt-2 ring-offset-background",
        /* Focus Visible */
        "data-[focus-visible]:outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring data-[focus-visible]:ring-offset-2",
        className
      )
    )}
    {...props}
  />
)

export { Tabs, TabList, TabPanel, Tab }
