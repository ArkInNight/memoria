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
import { getCurrentBanners, BANNER_RULES } from "@/lib/domain/assets";
import { pityPoolOfPull } from "@/lib/domain/pityEngine";
import { computeTrackerStats } from "@/lib/domain/stats";
import type { TrackerStats } from "@/lib/domain/stats";
import { formatNumber, nowString, formatDate, RARITY_STYLE } from "@/lib/shared";
import { useSummonHistory } from "@/components/history/use-summon-history";
import { SummonHistorySection } from "@/components/history/summon-history-section";
import { ActiveBannersSection } from "../components/active-banners-section";
import { RarityPieChart } from "@/components/rarity-pie-chart";
import { Recent6StarSection } from "@/components/recent-6star-section";
import { ShareButton } from "@/features/share/components/share-button";
import { heroOptionsFromPulls } from "@/features/share/lib/share-card-data";
import { SHARE_COLORS } from "@/features/share/lib/share-card-data";

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
  const activeBanners = useMemo(() => getCurrentBanners(), []);

  const filteredPulls = useMemo(
    () =>
      history.poolFilter === "all"
        ? history.allPulls
        : history.allPulls.filter((p) => pityPoolOfPull(p, BANNER_RULES) === history.poolFilter),
    [history.allPulls, history.poolFilter]
  );

  const trackerStats = useMemo(() => computeTrackerStats(filteredPulls), [filteredPulls]);
  const rows = useMemo<StatRow[]>(() => buildTrackerRows(trackerStats), [trackerStats]);

  const shareHeroes = useMemo(() => heroOptionsFromPulls(filteredPulls), [filteredPulls]);
  const shareStats = useMemo(
    () => [
      {
        label: "Total Summons",
        value: formatNumber(filteredPulls.length),
        color: SHARE_COLORS.white,
      },
      { label: "6★", value: formatNumber(trackerStats.total6Star), color: SHARE_COLORS.gold },
      { label: "5★", value: formatNumber(trackerStats.total5Star), color: SHARE_COLORS.purple },
      { label: "4★", value: formatNumber(trackerStats.total4Star), color: SHARE_COLORS.sky },
      { label: "Win Rate", value: `${trackerStats.winRate}%`, color: SHARE_COLORS.emerald },
    ],
    [filteredPulls, trackerStats]
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
            pulls={filteredPulls}
            filename={
              history.poolFilter === "all"
                ? history.profile.name || "profile"
                : `${history.profile.name || "profile"}-${history.poolFilter}`
            }
          />
        </XStack>
      </PageHeader>

      <ActiveBannersSection
        banners={activeBanners}
        selected={history.poolFilter}
        onSelect={history.setPool}
      />

      <Grid lg={3} gap={24}>
        <StatsOverview rows={rows} />
        <RarityPieChart data={trackerStats.rarityDist} />
        <Recent6StarSection pulls={filteredPulls} charImageByName={history.charImageByName} />
      </Grid>

      <SummonHistorySection history={history} hideBannerFilter />
    </YStack>
  );
}
