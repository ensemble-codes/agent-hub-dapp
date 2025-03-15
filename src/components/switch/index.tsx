// Tremor Switch [v0.0.1]

import React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { tv, VariantProps } from "tailwind-variants"
import { cx, switchFocusRing } from "../../utils"

const switchVariants = tv({
  slots: {
    root: [
      // base
      "group relative isolate inline-flex shrink-0 cursor-pointer items-center rounded-full p-0.5 shadow-inner outline-none transition-all",
      "bg-[#8F95B2]", // Match the blue from modal.tsx
      // ring color
      "ring-black/5 dark:ring-gray-800",
      // checked
      "data-[state=checked]:bg-[#ABF1C5]", // Match the yellow from modal.tsx
      // disabled
      "data-[disabled]:cursor-default",
      switchFocusRing,
    ],
    thumb: [
      // base
      "pointer-events-none relative inline-block transform appearance-none rounded-full border-none shadow-lg outline-none transition-all duration-150 ease-in-out",
      "bg-[#3D3D3D]", // Red for unchecked
      "data-[state=checked]:bg-[#00D64F]", // Green for checked
      "group-data-[disabled]:shadow-none",
    ],
  },
  variants: {
    size: {
      default: {
        root: "h-6 w-14",
        thumb: "h-7 w-7 data-[state=checked]:translate-x-8 data-[state=unchecked]:translate-x-0",
      },
      small: {
        root: "h-4 w-7",
        thumb: "h-3 w-3 data-[state=checked]:translate-x-3 data-[state=unchecked]:translate-x-0",
      }
    },
  },
  defaultVariants: {
    size: "default",
  },
})

interface SwitchProps
  extends Omit<
      React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>,
      "asChild"
    >,
    VariantProps<typeof switchVariants> {}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, size, ...props }: SwitchProps, forwardedRef) => {
  const { root, thumb } = switchVariants({ size })
  return (
    <SwitchPrimitives.Root
      ref={forwardedRef}
      className={cx(root(), className)}
      tremor-id="tremor-raw"
      {...props}
    >
      <SwitchPrimitives.Thumb className={cx(thumb())} />
    </SwitchPrimitives.Root>
  )
})

Switch.displayName = "Switch"

export { Switch }
