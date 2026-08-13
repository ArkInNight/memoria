import * as React from "react";

import { cn } from "@/lib/utils";

function AppShell({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="app-shell"
      className={cn(
        "relative flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground",
        className
      )}
      {...props}
    />
  );
}

function Main({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      data-slot="main"
      className={cn("relative z-10 flex-1 overflow-y-auto", className)}
      {...props}
    />
  );
}

export { AppShell, Main };
