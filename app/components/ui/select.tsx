"use client"

import { CaretSortIcon } from "@radix-ui/react-icons"
import { ChevronDownIcon } from "lucide-react"
import {
  Select as AriaSelect,
  type SelectProps as AriaSelectProps,
  SelectValue as AriaSelectValue,
  type SelectValueProps as AriaSelectValueProps,
  composeRenderProps,
} from "react-aria-components"
import { tv } from "tailwind-variants"

import { Button } from "./button"
import { Field, type FieldProps } from "./field"
import { ListBox, type ListBoxProps } from "./list-box"
import { Overlay } from "./overlay"

const selectStyles = tv({
  slots: {
    root: "flex flex-col items-start gap-2",
    selectValue: "flex-1 bg-foreground/[.026] text-left",
  },
})

interface SelectProps<T extends object>
  extends Omit<SelectRootProps<T>, "children">,
    Omit<FieldProps, "children"> {
  children?: ListBoxProps<T>["children"]
  dependencies?: ListBoxProps<T>["dependencies"]
  items?: ListBoxProps<T>["items"]
  isLoading?: ListBoxProps<T>["isLoading"]
}
const Select = <T extends object>({
  label,
  description,
  errorMessage,
  necessityIndicator,
  contextualHelp,
  children,
  dependencies,
  items,
  isLoading,
  ...props
}: SelectProps<T>) => {
  return (
    <SelectRoot {...props}>
      {({ isRequired }) => (
        <>
          <Field
            label={label}
            description={description}
            errorMessage={errorMessage}
            isRequired={isRequired}
            necessityIndicator={necessityIndicator}
            contextualHelp={contextualHelp}
          >
            <Button
              variant="outline"
              className="border border-border bg-foreground/[.026] hover:border-foreground/30 hover:bg-foreground/[.026]"
              suffix={<CaretSortIcon />}
            >
              <SelectValue />
            </Button>
          </Field>
          <Overlay type="popover">
            <ListBox isLoading={isLoading} items={items} dependencies={dependencies}>
              {children}
            </ListBox>
          </Overlay>
        </>
      )}
    </SelectRoot>
  )
}

type SelectValueProps<T extends object> = AriaSelectValueProps<T>
const SelectValue = <T extends object>(props: SelectValueProps<T>) => {
  const { selectValue } = selectStyles()
  return (
    <AriaSelectValue
      {...props}
      className={composeRenderProps(props.className, (className) => selectValue({ className }))}
    />
  )
}

interface SelectRootProps<T extends object> extends Omit<AriaSelectProps<T>, "className"> {
  className?: string
}
const SelectRoot = <T extends object>({ className, ...props }: SelectRootProps<T>) => {
  const { root } = selectStyles()
  return <AriaSelect className={root({ className })} {...props} />
}

export type { SelectProps, SelectRootProps, SelectValueProps }
export { Select, SelectRoot, SelectValue }
