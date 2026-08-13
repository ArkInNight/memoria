import * as React from "react";

import { cn } from "@/lib/utils";

function Container({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="container"
      className={cn(
        "mx-auto my-3 w-[calc(100%-1rem)] max-w-[1600px] rounded-md border border-border-panel bg-panel p-4 backdrop-blur-[16px] sm:my-6 sm:w-[85%] sm:p-8",
        className
      )}
      {...props}
    />
  );
}

export { Container };
