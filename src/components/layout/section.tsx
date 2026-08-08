import * as React from "react"

import { cn } from "@/lib/utils"

function Section({
  gap = 24,
  className,
  style,
  ...props
}: React.ComponentProps<"section"> & { gap?: number | string }) {
  return (
    <section
      data-slot="section"
      className={cn("flex flex-col", className)}
      style={{ gap, ...style }}
      {...props}
    />
  )
}

export { Section }
