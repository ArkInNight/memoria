import * as React from "react";

import { Card } from "@/components/ui/card";
import { Text } from "@/components/typography";
import { cn } from "@/lib/utils";

export interface StatRow {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  valueClassName?: string;
}

/** Simple key-value stat list shared by the dashboard and banner pages. */
function StatsOverview({ rows, className }: { rows: StatRow[]; className?: string }) {
  return (
    <Card className={cn("shadow-sm", className)}>
      <dl className="divide-y divide-border">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-baseline justify-between gap-4 px-4 py-3 sm:px-6"
          >
            <dt className="shrink-0 text-sm font-medium text-muted-foreground">{row.label}</dt>
            <dd className="flex min-w-0 flex-col items-end gap-0.5 text-right">
              <Text size="lg" weight="bold" className={cn("leading-none", row.valueClassName)}>
                {row.value}
              </Text>
              {row.hint !== undefined && (
                <Text size="xs" variant="muted" className="truncate">
                  {row.hint}
                </Text>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

export { StatsOverview };
