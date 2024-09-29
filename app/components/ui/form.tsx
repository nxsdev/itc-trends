/**
 * react-aria based original component
 * ref: https://react-spectrum.adobe.com/react-aria/forms.html
 */

"use client"

import * as React from "react"
import { Form as AriaForm, type FormProps as AriaFormProps } from "react-aria-components"

import { cn } from "~/lib/utils"

const Form = (props: AriaFormProps) => {
  return <AriaForm {...props} className={cn("space-y-6", props.className)} />
}
Form.displayName = "Form"

export { Form }
