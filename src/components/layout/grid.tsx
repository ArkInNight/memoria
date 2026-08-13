import * as React from "react";

import { cn } from "@/lib/utils";

const COLS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
};

const COLS_MD: Record<number, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
};

const COLS_LG: Record<number, string> = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
};

function Grid({
  cols,
  md,
  lg,
  gap = 24,
  className,
  style,
  ...props
}: React.ComponentProps<"div"> & {
  cols?: 1 | 2 | 3 | 4;
  md?: 1 | 2 | 3 | 4;
  lg?: 1 | 2 | 3 | 4;
  gap?: number | string;
}) {
  return (
    <div
      data-slot="grid"
      className={cn("grid", cols && COLS[cols], md && COLS_MD[md], lg && COLS_LG[lg], className)}
      style={{ gap, ...style }}
      {...props}
    />
  );
}

export { Grid };
