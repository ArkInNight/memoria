import { Link, useParams } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowLeft, UserPlus } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatsOverview } from "@/components/stats-overview";
import type { StatRow } from "@/components/stats-overview";
import { EntityImage } from "@/components/ui/entity-image";
import { YStack, XStack } from "@/components/layout/stack";
import { Grid } from "@/components/layout/grid";
import { Heading, Text } from "@/components/typography";
import { EmptyState } from "@/components/empty-state";
import { formatDate, formatNumber, nowString, RARITY_STYLE } from "@/lib/shared";
import { getBannerByRunId, characterImageUrl, runForPull } from "@/lib/domain/assets";
import { computeBannerStats, computeTrackerStats } from "@/lib/domain/stats";
import { useActiveProfile } from "@/lib/store/profiles";
import { usePullRecords } from "@/lib/store/summons";
import { useSummonHistory } from "@/components/history/use-summon-history";
import { SummonHistorySection } from "@/components/history/summon-history-section";
import { RarityPieChart } from "@/components/rarity-pie-chart";
import { Recent6StarSection } from "@/components/recent-6star-section";
import { ShareButton } from "@/features/share/components/share-button";
import { heroOptionsFromPulls, SHARE_COLORS } from "@/features/share/lib/share-card-data";
import type { ShareStatItem } from "@/features/share/lib/share-card-data";
import { BannerTypeBadge } from "../components/banner-type-badge";
import { RateUpBadgeList } from "../components/rate-up-badge-list";

function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <Text size="xs" variant="muted" weight="medium" className="truncate uppercase tracking-wide">
        {label}
      </Text>
      <Text weight="semibold" className="truncate">
        {value}
      </Text>
    </div>
  );
}

export function BannerDetailPage() {
  const { bannerId } = useParams({ from: "/banners/$bannerId" });

  const banner = useMemo(() => getBannerByRunId(bannerId), [bannerId]);

  const profile = useActiveProfile();
  const pulls = usePullRecords(profile?.id);
  const history = useSummonHistory(banner?.runId);

  const bannerPulls = useMemo(
    () => (banner ? pulls.filter((p) => runForPull(p)?.runId === banner.runId) : []),
    [pulls, banner]
  );

  const stats = useMemo(
    () => (banner ? computeBannerStats(banner, bannerPulls) : null),
    [banner, bannerPulls]
  );

  const rows = useMemo<StatRow[]>(() => {
    if (!stats) return [];
    return [
      { label: "Total Pulls", value: stats.totalPulls },
      {
        label: "6★",
        value: stats.obtained6Star.length,
        valueClassName: RARITY_STYLE[6].text,
      },
      {
        label: "5★",
        value: stats.obtained5Star.length,
        valueClassName: RARITY_STYLE[5].text,
      },
      {
        label: "4★",
        value: stats.total4Star,
        valueClassName: RARITY_STYLE[4].text,
      },
      {
        label: "Average Pity",
        value: stats.avgPity6Star > 0 ? stats.avgPity6Star : "-",
      },
      {
        label: "Highest Pity",
        value: stats.highestPity6Star > 0 ? stats.highestPity6Star : "-",
      },
      {
        label: "Lowest Pity",
        value: stats.lowestPity6Star > 0 ? stats.lowestPity6Star : "-",
        valueClassName: "text-success",
      },
    ];
  }, [stats]);

  const rarityDist = useMemo(
    () => (banner ? computeTrackerStats(bannerPulls).rarityDist : []),
    [banner, bannerPulls]
  );

  const bannerShareStats = useMemo<ShareStatItem[]>(() => {
    if (!stats) return [];
    return [
      { label: "Total Pulls", value: formatNumber(stats.totalPulls), color: SHARE_COLORS.white },
      { label: "6★", value: formatNumber(stats.obtained6Star.length), color: SHARE_COLORS.gold },
      { label: "5★", value: formatNumber(stats.obtained5Star.length), color: SHARE_COLORS.purple },
      { label: "4★", value: formatNumber(stats.total4Star), color: SHARE_COLORS.sky },
      {
        label: "Avg Pity",
        value: stats.avgPity6Star > 0 ? String(stats.avgPity6Star) : "—",
        color: SHARE_COLORS.emerald,
      },
    ];
  }, [stats]);

  return (
    <YStack gap={24}>
      <YStack gap={16}>
        <XStack gap={12} className="justify-between">
          <Button asChild variant="outline" size="sm" className="w-fit">
            <Link to="/banners">
              <ArrowLeft size={16} className="mr-2" />
              Back to Archive
            </Link>
          </Button>
          {banner && profile && bannerPulls.length > 0 && (
            <ShareButton
              data={{
                profileName: profile.name || "Player",
                generatedAt: formatDate(nowString()) || "",
                heading: {
                  title: banner.name,
                  subtitle: banner.type,
                },
                stats: bannerShareStats,
              }}
              heroes={heroOptionsFromPulls(bannerPulls)}
              pulls={bannerPulls}
              filename={banner.name}
            />
          )}
        </XStack>

        {banner ? (
          <YStack gap={4}>
            <XStack gap={12}>
              <Heading level={1}>{banner.name}</Heading>
              <BannerTypeBadge type={banner.type} className="text-xs capitalize" />
            </XStack>
            <Text variant="muted">Detailed statistics and pull details.</Text>
          </YStack>
        ) : (
          <Heading level={1}>Banner not found</Heading>
        )}
      </YStack>

      {!banner ? (
        <EmptyState title="Banner not found" />
      ) : !profile ? (
        <EmptyState
          icon={<UserPlus className="h-7 w-7 text-primary" />}
          title="No profile yet"
          description="Banner statistics are computed from your profile's summon data. Create a profile first to see pulls on this banner."
          action={
            <Button asChild>
              <Link to="/profiles">Create Profile</Link>
            </Button>
          }
        />
      ) : (
        <YStack gap={24}>
          <div className="grid grid-cols-1 gap-6 items-start lg:grid-cols-5">
            <EntityImage
              variant="banner"
              name={banner.name}
              imageUrl={banner.imageUrl ?? undefined}
              className="aspect-21/9 w-full rounded-xl lg:col-span-2"
            />

            <Card className="p-4 shadow-sm sm:p-6 lg:col-span-3">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <InfoItem
                  label="Type"
                  value={<BannerTypeBadge type={banner.type} className="text-xs capitalize" />}
                />
                <InfoItem label="Version" value={banner.version ?? "—"} />
                <InfoItem label="Start Date" value={formatDate(banner.startDate) || "—"} />
                <InfoItem
                  label="End Date"
                  value={banner.endDate === null ? "Permanent" : formatDate(banner.endDate) || "—"}
                />
              </div>

              {(banner.rateUp6Star?.length || banner.rateUp5Star?.length) && (
                <YStack gap={16} className="mt-6 border-t border-border pt-4">
                  <RateUpBadgeList
                    names={banner.rateUp6Star ?? []}
                    rarity={6}
                    imageUrlOf={characterImageUrl}
                  />
                  <RateUpBadgeList
                    names={banner.rateUp5Star ?? []}
                    rarity={5}
                    imageUrlOf={characterImageUrl}
                  />
                </YStack>
              )}
            </Card>
          </div>

          {rows.length > 0 && (
            <Grid lg={3} gap={24}>
              <StatsOverview rows={rows} />
              <RarityPieChart data={rarityDist} />
              <Recent6StarSection pulls={bannerPulls} charImageByName={history.charImageByName} />
            </Grid>
          )}

          <SummonHistorySection history={history} />
        </YStack>
      )}
    </YStack>
  );
}
