import * as React from "react";

import { cn } from "@/lib/utils";

type Gap = number | string;

function Stack({
  gap = 24,
  direction = "vertical",
  className,
  style,
  ...props
}: React.ComponentProps<"div"> & {
  gap?: Gap;
  direction?: "vertical" | "horizontal";
}) {
  return (
    <div
      data-slot="stack"
      className={cn(
        "flex",
        direction === "vertical" ? "flex-col" : "flex-row items-center",
        className
      )}
      style={{ gap, ...style }}
      {...props}
    />
  );
}

function XStack({ gap = 16, ...props }: React.ComponentProps<"div"> & { gap?: Gap }) {
  return <Stack direction="horizontal" gap={gap} {...props} />;
}

function YStack({ gap = 16, ...props }: React.ComponentProps<"div"> & { gap?: Gap }) {
  return <Stack direction="vertical" gap={gap} {...props} />;
}

function Spacer({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="spacer" className={cn("flex-1", className)} {...props} />;
}

export { Stack, XStack, YStack, Spacer };
