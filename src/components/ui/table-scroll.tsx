import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Scrollable wrapper for wide tables. Add `overflow-y-auto` + a max height
 * when the table body should scroll vertically instead.
 */
function TableScroll({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="table-scroll" className={cn("overflow-x-auto", className)} {...props} />;
}

export { TableScroll };
