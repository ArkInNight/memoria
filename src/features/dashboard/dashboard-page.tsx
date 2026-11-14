import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Upload, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatsOverview } from "@/components/stats-overview";
import type { StatRow } from "@/components/stats-overview";
import { XStack, YStack } from "@/components/layout/stack";
import { Grid } from "@/components/layout/grid";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { catalogStore } from "@/stores/catalog-store";
import { getPityPoolForRun, getPityPoolOfSummon, resolveBannerRule } from "@/core/summon-engine";
import { computeTrackerStats, computePityHeroStatus } from "@/core/summon-stats";
import type { TrackerStats } from "@/core/summon-stats";
import { formatNumber, nowString, formatDate, RARITY_STYLE } from "@/shared";
import { useSummonHistory } from "@/features/history/use-summon-history";
import { SummonHistorySection } from "@/features/history/summon-history-section";
import { ActiveBannersSection } from "./active-banners-section";
import { PityHeroCard } from "./pity-hero-card";
import { RarityPieChart } from "@/components/rarity-pie-chart";
import { Recent6StarSection } from "@/components/recent-6star-section";
import { ShareButton } from "@/features/share/share-button";
import { heroOptionsFromSummons, SHARE_COLORS } from "@/features/share/share-card-data";

function buildTrackerRows(stats: TrackerStats): StatRow[] {
  return [
    { label: "Total Summons", value: formatNumber(stats.totalSummons) },
    { label: "Clear Drops Spent", value: formatNumber(stats.clearDrops) },
    {
      label: "5★ Summons",
      value: stats.total5Star,
      valueClassName: RARITY_STYLE[5].text,
    },
    {
      label: "4★ Summons",
      value: stats.total4Star,
      valueClassName: RARITY_STYLE[4].text,
    },
    {
      label: "AVG 5★ Pity",
      value: stats.avg5StarPity > 0 ? stats.avg5StarPity : "—",
    },
    {
      label: "AVG 4★ Pity",
      value: stats.avg4StarPity > 0 ? stats.avg4StarPity : "—",
    },
    {
      label: "Win Rate",
      value: `${stats.winRate}%`,
      valueClassName: stats.winRate >= 50 ? "text-success" : undefined,
    },
  ];
}

export function DashboardPage() {
  const history = useSummonHistory();
  const activeBanners = useMemo(() => catalogStore.getCurrentBanners(), []);

  const filteredSummons = useMemo(
    () =>
      history.poolFilter === "all"
        ? history.allSummons
        : history.allSummons.filter(
            (p) =>
              getPityPoolOfSummon(
                p,
                catalogStore.getInstanceForSummon,
                catalogStore.bannerRules
              ) === history.poolFilter
          ),
    [history.allSummons, history.poolFilter]
  );

  const trackerStats = useMemo(() => computeTrackerStats(filteredSummons), [filteredSummons]);
  const rows = useMemo<StatRow[]>(() => buildTrackerRows(trackerStats), [trackerStats]);

  const pityHeroStatus = useMemo(() => {
    let pool = history.poolFilter;
    let bannerName: string | undefined;
    const matchingBanner =
      pool === "all"
        ? activeBanners[0]
        : activeBanners.find((b) => getPityPoolForRun(b, catalogStore.bannerRules) === pool);

    if (pool === "all") {
      pool = matchingBanner
        ? getPityPoolForRun(matchingBanner, catalogStore.bannerRules)
        : "character";
      bannerName = matchingBanner?.name;
    } else {
      bannerName = matchingBanner?.name;
    }

    const poolSummons = history.allSummons.filter(
      (p) =>
        getPityPoolOfSummon(p, catalogStore.getInstanceForSummon, catalogStore.bannerRules) === pool
    );

    const rule = matchingBanner
      ? resolveBannerRule(matchingBanner, catalogStore.bannerRules).rateUp
      : undefined;

    return {
      status: computePityHeroStatus(poolSummons, pool, rule),
      bannerName,
    };
  }, [history.poolFilter, history.allSummons, activeBanners]);

  const shareHeroes = useMemo(() => heroOptionsFromSummons(filteredSummons), [filteredSummons]);
  const shareStats = useMemo(
    () => [
      {
        label: "Total Summons",
        value: formatNumber(filteredSummons.length),
        color: SHARE_COLORS.white,
      },
      { label: "6★", value: formatNumber(trackerStats.total6Star), color: SHARE_COLORS.gold },
      { label: "5★", value: formatNumber(trackerStats.total5Star), color: SHARE_COLORS.purple },
      { label: "4★", value: formatNumber(trackerStats.total4Star), color: SHARE_COLORS.sky },
      { label: "Win Rate", value: `${trackerStats.winRate}%`, color: SHARE_COLORS.emerald },
    ],
    [filteredSummons, trackerStats]
  );

  if (!history.profile) {
    return (
      <YStack gap={32}>
        <PageHeader title="Dashboard" description="Overview of your permanent summon archive." />
        <EmptyState
          icon={<UserPlus className="h-7 w-7 text-primary" />}
          title="No profile yet"
          description="Create a profile for your game account first. All summon data is stored only in your browser — no login."
          action={
            <Button asChild>
              <Link to="/profiles">Create Profile</Link>
            </Button>
          }
        />
      </YStack>
    );
  }

  return (
    <YStack gap={24}>
      <PageHeader
        title="Dashboard"
        description={
          history.profile.name
            ? `Overview of your permanent summon archive — ${history.profile.name}.`
            : "Overview of your permanent summon archive."
        }
      >
        <XStack gap={8}>
          <Button asChild>
            <Link to="/import">
              <Upload className="mr-2 h-4 w-4" />
              Import Summons
            </Link>
          </Button>
          <ShareButton
            data={{
              profileName: history.profile.name || "Player",
              generatedAt: formatDate(nowString()) || "",
              stats: shareStats,
            }}
            heroes={shareHeroes}
            summons={filteredSummons}
            filename={
              history.poolFilter === "all"
                ? history.profile.name || "profile"
                : `${history.profile.name || "profile"}-${history.poolFilter}`
            }
          />
        </XStack>
      </PageHeader>

      <PityHeroCard status={pityHeroStatus.status} bannerName={pityHeroStatus.bannerName} />

      <ActiveBannersSection
        banners={activeBanners}
        selected={history.poolFilter}
        onSelect={history.setPool}
      />

      <Grid lg={3} gap={24}>
        <StatsOverview rows={rows} />
        <RarityPieChart data={trackerStats.rarityDist} />
        <Recent6StarSection summons={filteredSummons} imageUrlOf={history.imageUrlOf} />
      </Grid>

      <SummonHistorySection history={history} hideBannerFilter />
    </YStack>
  );
}
