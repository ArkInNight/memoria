import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableScroll } from "@/components/ui/table-scroll";
import { Empty, EmptyContent, EmptyDescription } from "@/components/ui/empty";
import { YStack, XStack } from "@/components/layout/stack";
import { Text } from "@/components/typography";
import { characterRarity } from "@/lib/domain/assets";
import type { ManualPullInput } from "@/lib/domain/manualPull";

function DraftTable({
  draft,
  onRemove,
  onClear,
}: {
  draft: ManualPullInput[];
  onRemove: (index: number) => void;
  onClear: () => void;
}) {
  return (
    <YStack gap={8}>
      <XStack gap={8} className="items-center justify-between">
        <Text size="sm" weight="semibold">
          List ({draft.length})
        </Text>
        {draft.length > 0 && (
          <Button type="button" variant="ghost" size="sm" onClick={onClear}>
            Clear
          </Button>
        )}
      </XStack>
      {draft.length > 0 ? (
        <TableScroll className="rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Banner</TableHead>
                <TableHead>Character</TableHead>
                <TableHead className="text-center">Rarity</TableHead>
                <TableHead className="text-center">Pity</TableHead>
                <TableHead className="w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {draft.map((d, i) => (
                <TableRow key={`${d.poolRunId}-${d.name}-${d.createTime}`}>
                  <TableCell className="font-mono text-xs whitespace-nowrap text-muted-foreground">
                    {d.createTime.slice(5, 16)}
                  </TableCell>
                  <TableCell className="max-w-40 truncate text-xs">{d.poolName}</TableCell>
                  <TableCell className="text-xs font-medium">{d.name}</TableCell>
                  <TableCell className="text-center text-xs">
                    {characterRarity(d.name, d.rarity)}★
                  </TableCell>
                  <TableCell className="text-center font-mono text-xs">
                    {d.manualPity ?? "auto"}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => onRemove(i)}
                      aria-label={`Remove ${d.name}`}
                    >
                      <Trash2 />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableScroll>
      ) : (
        <Empty className="border border-border p-4">
          <EmptyContent>
            <EmptyDescription>No records yet. Add one from the form above.</EmptyDescription>
          </EmptyContent>
        </Empty>
      )}
    </YStack>
  );
}

export { DraftTable };
