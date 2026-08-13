import { ChevronLeft, ChevronRight } from "lucide-react";

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
import { formatDateTime } from "@/lib/shared";
import type { PullRecord } from "@/lib/shared";
import { RarityBadge, RateOnBadge, GuaranteeBadge } from "./status-badges";
import { PityCell } from "./pity-cell";

export interface PullRow {
  pull: PullRecord;
  imageUrl?: string;
}

function PullsTable({
  rows,
  hasAnyData,
  totalPages,
  currentPage,
  onPageChange,
}: {
  rows: PullRow[];
  hasAnyData: boolean;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
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
              <TableHead>Pull Type</TableHead>
              <TableHead className="text-center">Pity</TableHead>
              <TableHead className="text-center">Rate ON/OFF</TableHead>
              <TableHead className="text-center">Guarantee State</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ pull, imageUrl }) => (
              <TableRow key={pull.id}>
                <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                  {formatDateTime(pull.createTime)}
                </TableCell>
                <TableCell className="font-medium">{pull.poolName}</TableCell>
                <TableCell>
                  <XStack gap={10} className="items-center">
                    <EntityImage
                      name={pull.name}
                      imageUrl={imageUrl}
                      rarity={pull.rarity}
                      className="h-9 w-9 rounded-full shrink-0"
                    />
                    <Text weight="semibold" variant="primary">
                      {pull.name}
                    </Text>
                  </XStack>
                </TableCell>
                <TableCell>
                  <RarityBadge rarity={pull.rarity} />
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{pull.summonType === "10" ? "10-pull" : "Single"}</Badge>
                </TableCell>
                <TableCell className="text-center font-mono font-bold">
                  <PityCell pity={pull.pity} rarity={pull.rarity} />
                </TableCell>
                <TableCell className="text-center">
                  <RateOnBadge rateOn={pull.rateOn} />
                </TableCell>
                <TableCell className="text-center">
                  <GuaranteeBadge guaranteed={pull.guaranteed} rarity={pull.rarity} />
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

export { PullsTable };
