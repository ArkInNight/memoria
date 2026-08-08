import * as React from "react"

import { cn } from "@/lib/utils"

function Dot({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      aria-hidden
      data-slot="dot"
      className={cn("h-2.5 w-2.5 rounded-full", className)}
      {...props}
    />
  )
}

export { Dot }
