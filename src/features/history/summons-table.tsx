import { ChevronLeft, ChevronRight, MoreHorizontal, Pencil, RotateCcw, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableScroll } from "@/components/ui/table-scroll";
import { Empty, EmptyDescription, EmptyHeader } from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import { EntityImage } from "@/components/ui/entity-image";
import { XStack, YStack } from "@/components/layout/stack";
import { Text } from "@/components/typography";
import { formatDateTime } from "@/shared";
import type { SummonRecord } from "@/shared";
import { RarityBadge, RateOnBadge, GuaranteeBadge } from "./status-badges";
import { PityCell } from "./pity-cell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface SummonRow {
  summon: SummonRecord;
  imageUrl?: string;
}

function SummonsTable({
  rows,
  hasAnyData,
  totalPages,
  currentPage,
  onPageChange,
  isTrash = false,
  onEdit,
  onDelete,
  onRestore,
}: {
  rows: SummonRow[];
  hasAnyData: boolean;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  isTrash?: boolean;
  onEdit: (summon: SummonRecord) => void;
  onDelete: (summon: SummonRecord) => void;
  onRestore: (summon: SummonRecord) => void;
}) {
  if (rows.length === 0) {
    return (
      <TableScroll>
        <Empty className="border-0 p-12">
          <EmptyHeader>
            <EmptyDescription>
              {hasAnyData
                ? "No summon records matching criteria."
                : "No summon data in this profile yet. Import from the Import page."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </TableScroll>
    );
  }

  return (
    <YStack gap={0}>
      <TableScroll>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Banner</TableHead>
              <TableHead>Character</TableHead>
              <TableHead>Rarity</TableHead>
              <TableHead>Summon Type</TableHead>
              <TableHead className="text-center">Pity</TableHead>
              <TableHead className="text-center">Rate ON/OFF</TableHead>
              <TableHead className="text-center">Guarantee State</TableHead>
              <TableHead className="w-12">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ summon, imageUrl }) => (
              <TableRow key={summon.id}>
                <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                  {formatDateTime(summon.createTime)}
                </TableCell>
                <TableCell className="font-medium">{summon.poolName}</TableCell>
                <TableCell>
                  <XStack gap={10} className="items-center">
                    <EntityImage
                      name={summon.name}
                      imageUrl={imageUrl}
                      rarity={summon.rarity}
                      className="h-9 w-9 rounded-full shrink-0"
                    />
                    <Text weight="semibold" variant="primary">
                      {summon.name}
                    </Text>
                  </XStack>
                </TableCell>
                <TableCell>
                  <RarityBadge rarity={summon.rarity} />
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {summon.summonType === "10" ? "10-summon" : "Single"}
                  </Badge>
                </TableCell>
                <TableCell className="text-center font-mono font-bold">
                  <PityCell pity={summon.pity} rarity={summon.rarity} />
                </TableCell>
                <TableCell className="text-center">
                  <RateOnBadge rateOn={summon.rateOn} />
                </TableCell>
                <TableCell className="text-center">
                  <GuaranteeBadge guaranteed={summon.guaranteed} rarity={summon.rarity} />
                </TableCell>
                <TableCell className="text-right">
                  {isTrash ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      title="Restore summon"
                      onClick={() => onRestore(summon)}
                    >
                      <RotateCcw />
                      <span className="sr-only">Restore summon</span>
                    </Button>
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button type="button" variant="ghost" size="icon-sm">
                          <MoreHorizontal />
                          <span className="sr-only">Open summon actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuItem onClick={() => onEdit(summon)}>
                          <Pencil />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" onClick={() => onDelete(summon)}>
                          <Trash2 />
                          Move to Trash
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableScroll>

      {totalPages > 1 && (
        <div className="bg-card">
          <Separator />
          <XStack gap={8} className="justify-between p-4">
            <Text size="xs" variant="muted">
              Page {currentPage} of {totalPages}
            </Text>
            <XStack gap={8}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft data-icon="inline-start" />
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight data-icon="inline-end" />
              </Button>
            </XStack>
          </XStack>
        </div>
      )}
    </YStack>
  );
}

export { SummonsTable };
