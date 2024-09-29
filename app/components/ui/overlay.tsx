"use client"

import { XIcon } from "lucide-react"
import React from "react"
import {
  Modal as AriaModal,
  ModalOverlay as AriaModalOverlay,
  type ModalOverlayProps as AriaModalOverlayProps,
  OverlayArrow as AriaOverlayArrow,
  OverlayTriggerStateContext as AriaOverlayTriggerStateContext,
  Popover as AriaPopover,
  type PopoverProps as AriaPopoverProps,
  composeRenderProps,
} from "react-aria-components"
import { tv } from "tailwind-variants"
import { useMediaQuery } from "~/hooks/use-media-query"
import { cn } from "~/lib/utils"

import { Button, type ButtonProps } from "./button"
import { MotionDrawerRoot, useMotionDrawer } from "./use-motion-drawer"

type OverlayType = "modal" | "drawer" | "popover"

type OverlayProps = {
  type?: OverlayType
  mobileType?: OverlayProps["type"]
  showDismissButton?: boolean
  mediaQuery?: string
  children: React.ReactNode
  classNames?: ModalOverlayClassNames & DrawerOverlayClassNames & PopoverOverlayClassNames
} & Omit<AriaModalOverlayProps, "children"> &
  Omit<AriaPopoverProps, "children">

const Overlay = React.forwardRef<HTMLElement | HTMLDivElement, OverlayProps>(
  (
    {
      type: typeProp = "modal",
      mobileType,
      mediaQuery = "(max-width: 640px)",
      isDismissable = true,
      ...props
    },
    ref
  ) => {
    const isMobile = useMediaQuery(mediaQuery)
    const type = mobileType ? (isMobile ? mobileType : typeProp) : typeProp
    switch (type) {
      case "modal":
        return (
          <ModalOverlay
            ref={ref as React.ForwardedRef<HTMLDivElement>}
            isDismissable={isDismissable}
            {...props}
          />
        )
      case "drawer":
        return (
          // @ts-expect-error TODO FIX THIS SAME ORIENTATION PROP AS POPOVER :'(
          <DrawerOverlay
            ref={ref as React.ForwardedRef<HTMLDivElement>}
            isDismissable={isDismissable}
            {...props}
          />
        )
      case "popover":
        return <PopoverOverlay ref={ref as React.ForwardedRef<HTMLElement>} {...props} />
    }
  }
)
Overlay.displayName = "Overlay"

const modalVariants = tv({
  slots: {
    backdrop: [
      "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm",
      "data-[entering]:fade-in-0 data-[exiting]:fade-out-0 data-[entering]:animate-in data-[exiting]:animate-out data-[exiting]:duration-300",
    ],
    overlay: [
      "group/overlay -translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 z-50 w-full max-w-lg",
      "border bg-background-dash-sidebar shadow-lg sm:rounded-lg md:w-full",
      "data-[entering]:fade-in-0 data-[exiting]:fade-out-0 data-[entering]:zoom-in-95 data-[exiting]:zoom-out-95 data-[entering]:slide-in-from-left-1/2 data-[entering]:slide-in-from-top-[48%] data-[exiting]:slide-out-to-left-1/2 data-[exiting]:slide-out-to-top-[48%] duration-200 data-[entering]:animate-in data-[exiting]:animate-out data-[exiting]:duration-300",
    ],
  },
})

type ModalOverlaySlots = keyof ReturnType<typeof modalVariants>
type ModalOverlayClassNames = {
  [key in ModalOverlaySlots]?: string
}

interface ModalOverlayProps extends AriaModalOverlayProps {
  showDismissButton?: boolean
  classNames?: ModalOverlayClassNames
}

const ModalOverlay = React.forwardRef<React.ElementRef<typeof AriaModalOverlay>, ModalOverlayProps>(
  ({ classNames, className, isDismissable, showDismissButton, ...props }, ref) => {
    const { overlay, backdrop } = modalVariants({})
    return (
      <AriaModalOverlay
        {...props}
        ref={ref}
        isDismissable={isDismissable}
        className={backdrop({ className: classNames?.backdrop })}
      >
        <AriaModal
          {...props}
          data-type="modal"
          className={cn(overlay(), classNames?.overlay, className)}
        >
          {composeRenderProps(props.children, (children) => (
            <>
              {(showDismissButton ?? isDismissable) && <DismissButton />}
              {children}
            </>
          ))}
        </AriaModal>
      </AriaModalOverlay>
    )
  }
)
ModalOverlay.displayName = "ModalOverlay"

const popoverOverlayVariants = tv({
  slots: {
    overlay: [
      "group/overlay z-50 rounded-md border bg-background-dash-sidebar text-foreground shadow-md data-[trigger=ComboBox]:min-w-[--trigger-width] data-[trigger=Select]:min-w-[--trigger-width]",
      "data-[entering]:fade-in-0 data-[exiting]:fade-out-0 data-[entering]:zoom-in-95 data-[exiting]:zoom-out-95 will-change-[transform] data-[entering]:animate-in data-[exiting]:animate-out",
    ],
    arrow: [
      "block fill-background stroke-1 stroke-border",
      "group-placement-left:-rotate-90 group-placement-bottom:rotate-180 group-placement-right:rotate-90",
    ],
  },
})

type PopoverOverlaySlots = keyof ReturnType<typeof popoverOverlayVariants>
type PopoverOverlayClassNames = {
  [key in PopoverOverlaySlots]?: string
}

interface PopoverOverlayProps extends AriaPopoverProps {
  arrow?: boolean
  classNames?: PopoverOverlayClassNames
  showDismissButton?: boolean
}

const PopoverOverlay = React.forwardRef<React.ElementRef<typeof AriaPopover>, PopoverOverlayProps>(
  ({ arrow = false, className, showDismissButton, classNames, ...props }, ref) => {
    const { overlay, arrow: arrowStyle } = popoverOverlayVariants({})
    return (
      <AriaPopover
        data-type="popover"
        ref={ref}
        {...props}
        className={cn(overlay(), classNames?.overlay, className)}
      >
        {composeRenderProps(props.children, (children, {}) => (
          <>
            {showDismissButton && <DismissButton />}
            {arrow && (
              <AriaOverlayArrow className="group">
                <svg
                  width={12}
                  height={12}
                  viewBox="0 0 12 12"
                  className={arrowStyle({ className: classNames?.arrow })}
                  aria-hidden="true"
                >
                  <path d="M0 0 L6 6 L12 0" />
                </svg>
              </AriaOverlayArrow>
            )}
            {children}
          </>
        ))}
      </AriaPopover>
    )
  }
)
PopoverOverlay.displayName = "PopoverOverlay"

const drawerVariants = tv({
  slots: {
    backdrop: ["fixed inset-0 z-50 bg-black/60", "opacity-0"],
    overlay: [
      "group/overlay fixed z-50 flex flex-col bg-overlay outline-none",
      "inset-0",
      "placement-bottom:top-auto placement-left:right-auto placement-top:bottom-auto placement-right:left-auto",
      "placement-bottom:mt-24 placement-bottom:rounded-t-[10px] placement-bottom:border-t",
      "placement-top:mb-24 placement-top:rounded-b-[10px] placement-top:border-b",
      "placement-right:ml-24 placement-right:rounded-l-[10px] placement-right:border-l",
      "placement-left:mr-24 placement-left:rounded-r-[10px] placement-left:border-r",
      "touch-none will-change-transform",
      "placement-left:-translate-x-full placement-top:-translate-y-full placement-right:translate-x-full placement-bottom:translate-y-full", // required
      "max-h-[90%]",
    ],
  },
})

type DrawerOverlaySlots = keyof ReturnType<typeof drawerVariants>
type DrawerOverlayClassNames = {
  [key in DrawerOverlaySlots]?: string
}

interface DrawerOverlayProps extends Omit<AriaModalOverlayProps, "children"> {
  placement?: "top" | "bottom" | "left" | "right"
  showDismissButton?: boolean
  children?: React.ReactNode
  classNames?: DrawerOverlayClassNames
}

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof AriaModalOverlay>,
  DrawerOverlayProps
>(
  (
    {
      children,
      classNames,
      className,
      isDismissable,
      showDismissButton = false,
      placement = "bottom",
      ...props
    },
    ref
  ) => {
    const { rootProps, modalProps, backdropProps, drawerProps } = useMotionDrawer({
      isDismissable,
      placement,
    })
    const { overlay, backdrop } = drawerVariants()

    return (
      <MotionDrawerRoot {...rootProps}>
        <AriaModalOverlay ref={ref} isDismissable={isDismissable} {...props} {...modalProps}>
          <div {...backdropProps} className={backdrop({ className: classNames?.backdrop })} />
          <AriaModal>
            <div
              {...drawerProps}
              data-type="drawer"
              className={cn(overlay(), classNames?.overlay, className)}
            >
              {showDismissButton && <DismissButton shape="rectangle">Done</DismissButton>}
              <div className="mx-auto my-4 h-2 w-[100px] rounded-full bg-surface-300" />
              {children}
            </div>
          </AriaModal>
        </AriaModalOverlay>
      </MotionDrawerRoot>
    )
  }
)
DrawerOverlay.displayName = "DrawerOverlay"

const DismissButton = (props: ButtonProps) => {
  const state = React.useContext(AriaOverlayTriggerStateContext)
  return (
    <Button
      shape="square"
      variant="ghost"
      size="sm"
      aria-label="Close"
      {...props}
      className={cn("absolute top-2 right-2 z-20 hover:bg-transparent", props.className)}
      onPress={() => state.close()}
    >
      {props.children ?? (
        <XIcon className="text-foreground-muted transition-colors duration-200 ease-out hover:text-foreground-light" />
      )}
    </Button>
  )
}

export type { OverlayProps, ModalOverlayProps, DrawerOverlayProps, PopoverOverlayProps }
export {
  Overlay,
  PopoverOverlay,
  DrawerOverlay,
  ModalOverlay,
  drawerVariants,
  modalVariants,
  popoverOverlayVariants,
}
