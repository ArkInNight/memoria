import { Card } from "@/components/ui/card";
import { Section } from "@/components/layout/section";
import { Heading } from "@/components/typography";
import { HistoryFilters } from "./history-filters";
import { PullsTable } from "./pulls-table";
import type { useSummonHistory } from "./use-summon-history";

function SummonHistorySection({
  history,
  hideBannerFilter = false,
}: {
  history: ReturnType<typeof useSummonHistory>;
  hideBannerFilter?: boolean;
}) {
  return (
    <Section gap={16}>
      <Heading level={2}>Summon History</Heading>

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
        <PullsTable
          rows={history.pageData.map((pull) => ({
            pull,
            imageUrl: history.charImageByName.get(pull.name),
          }))}
          hasAnyData={history.allPulls.length > 0}
          totalPages={history.totalPages}
          currentPage={history.safePage}
          onPageChange={history.handlePageChange}
        />
      </Card>
    </Section>
  );
}

export { SummonHistorySection };
