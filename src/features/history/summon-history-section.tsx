import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/layout/section";
import { Heading } from "@/components/typography";
import { XStack } from "@/components/layout/stack";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { SummonRecord } from "@/shared";
import { summonStore } from "@/stores/summon-store";
import { HistoryFilters } from "./history-filters";
import { SummonsTable } from "./summons-table";
import type { useSummonHistory } from "./use-summon-history";
import { SummonRecordDialog } from "./summon-record-dialog";
import { DeleteSummonDialog } from "./delete-summon-dialog";

function SummonHistorySection({
  history,
  hideBannerFilter = false,
}: {
  history: ReturnType<typeof useSummonHistory>;
  hideBannerFilter?: boolean;
}) {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<SummonRecord | null>(null);
  const [deleting, setDeleting] = useState<SummonRecord | null>(null);

  const handleDelete = async () => {
    if (!history.profile || !deleting) return;
    try {
      await summonStore.remove(history.profile.id, deleting.id);
      toast.success("Summon moved to Trash");
      setDeleting(null);
    } catch (error) {
      toast.error("Could not move summon to Trash", {
        description: error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  };

  const handleRestore = async (summon: SummonRecord) => {
    if (!history.profile) return;
    try {
      await summonStore.restore(history.profile.id, summon.id);
      toast.success("Summon restored");
    } catch (error) {
      toast.error("Summon restore failed", {
        description: error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  };

  return (
    <Section gap={16}>
      <XStack gap={12} className="flex-wrap items-center justify-between">
        <Heading level={2}>Summon History</Heading>
        <XStack gap={8} className="flex-wrap">
          <ToggleGroup
            type="single"
            value={history.view}
            onValueChange={(value) => value && history.setView(value as "active" | "trash")}
            variant="outline"
            size="sm"
            spacing={0}
            aria-label="Summon history view"
          >
            <ToggleGroupItem value="active">History</ToggleGroupItem>
            <ToggleGroupItem value="trash">
              <Trash2 />
              Trash{history.deletedSummons.length > 0 ? ` (${history.deletedSummons.length})` : ""}
            </ToggleGroupItem>
          </ToggleGroup>
          {history.view === "active" && history.profile && (
            <Button type="button" size="sm" onClick={() => setAdding(true)}>
              <Plus data-icon="inline-start" />
              Add Summon
            </Button>
          )}
        </XStack>
      </XStack>

      <HistoryFilters
        values={{
          search: history.search,
          bannerFilter: history.bannerFilter,
          rarityFilter: history.rarityFilter,
          total: history.total,
        }}
        banners={history.banners}
        hideBannerFilter={hideBannerFilter || history.isLocked}
        onSearchChange={history.setSearch}
        onBannerChange={history.setBanner}
        onRarityChange={history.setRarity}
      />

      <Card className="shadow-sm overflow-hidden">
        <SummonsTable
          rows={history.pageData.map((summon) => ({
            summon,
            imageUrl: history.imageUrlOf(summon.name),
          }))}
          hasAnyData={
            history.view === "trash"
              ? history.deletedSummons.length > 0
              : history.allSummons.length > 0
          }
          totalPages={history.totalPages}
          currentPage={history.safePage}
          onPageChange={history.handlePageChange}
          isTrash={history.view === "trash"}
          onEdit={setEditing}
          onDelete={setDeleting}
          onRestore={(summon) => void handleRestore(summon)}
        />
      </Card>

      {history.profile && adding && (
        <SummonRecordDialog
          key="add-summon"
          profile={history.profile}
          summon={null}
          open
          onOpenChange={setAdding}
        />
      )}
      {history.profile && editing && (
        <SummonRecordDialog
          key={editing.id}
          profile={history.profile}
          summon={editing}
          open
          onOpenChange={(open) => !open && setEditing(null)}
        />
      )}
      <DeleteSummonDialog
        summon={deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => void handleDelete()}
      />
    </Section>
  );
}

export { SummonHistorySection };
