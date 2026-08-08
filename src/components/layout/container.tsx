import * as React from "react"

import { cn } from "@/lib/utils"

function Container({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="container"
      className={cn(
        "mx-auto my-4 w-[85%] max-w-[1600px] rounded-md border border-[rgba(144,75,16,0.35)] bg-[rgba(255,250,240,0.82)] p-5 backdrop-blur-[16px] sm:my-6 sm:p-8 dark:border-[rgba(144,75,16,0.5)] dark:bg-[rgba(20,22,28,0.78)]",
        className
      )}
      {...props}
    />
  )
}

export { Container }
