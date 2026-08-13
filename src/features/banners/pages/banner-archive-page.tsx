import { useMemo } from "react";
import { Calendar } from "lucide-react";

import { Card, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getBannerRuns,
  getCurrentBanners,
  characterImageMap,
  runForPull,
} from "@/lib/domain/assets";
import { formatDate } from "@/lib/shared";
import { YStack } from "@/components/layout/stack";
import { Grid } from "@/components/layout/grid";
import { Section } from "@/components/layout/section";
import { Heading, Text } from "@/components/typography";
import { PageHeader } from "@/components/page-header";
import { Empty, EmptyContent } from "@/components/ui/empty";
import { useActiveProfile } from "@/lib/store/profiles";
import { usePullRecords } from "@/lib/store/summons";
import type { PullRecord } from "@/lib/shared";
import { BannerCard, BannerCardFooter } from "../components/banner-card";
import { RateUpBadgeList } from "../components/rate-up-badge-list";
import { BannerRecent6Star } from "../components/banner-recent-6star";

interface VersionGroup {
  version: string;
  sortKey: string;
  banners: ReturnType<typeof getBannerRuns>;
}

export function BannerArchivePage() {
  const profile = useActiveProfile();
  const pulls = usePullRecords(profile?.id);

  const groups = useMemo<VersionGroup[]>(() => {
    const runs = getBannerRuns();
    const byVersion = new Map<string, ReturnType<typeof getBannerRuns>>();
    for (const banner of runs) {
      const version = banner.version ?? "Unknown";
      const list = byVersion.get(version) ?? [];
      list.push(banner);
      byVersion.set(version, list);
    }
    return [...byVersion.entries()]
      .map(([version, banners]) => ({
        version,
        sortKey: banners.reduce(
          (max, b) => (b.startDate && b.startDate > max ? b.startDate : max),
          ""
        ),
        banners: banners.sort((a, b) => (b.startDate ?? "").localeCompare(a.startDate ?? "")),
      }))
      .sort((a, b) => b.sortKey.localeCompare(a.sortKey));
  }, []);

  const activeRunIds = useMemo(() => new Set(getCurrentBanners().map((b) => b.runId)), []);
  const imageUrlOf = useMemo(() => {
    const map = characterImageMap();
    return (name: string) => map.get(name);
  }, []);
  const recent6StarByRun = useMemo(() => {
    const map = new Map<string, PullRecord[]>();
    for (const pull of pulls) {
      if (pull.rarity !== 6) continue;
      const runId = runForPull(pull)?.runId;
      if (!runId) continue;
      const list = map.get(runId) ?? [];
      list.push(pull);
      map.set(runId, list);
    }
    return map;
  }, [pulls]);

  return (
    <YStack gap={24}>
      <PageHeader
        title="Banner Archive"
        description="Browse historical game banners by version and view pull stats."
      />

      {groups.length > 0 ? (
        <YStack gap={32}>
          {groups.map((group) => (
            <Section key={group.version} gap={16}>
              <Heading level={2} className="flex items-center gap-2">
                <Text variant="muted" className="text-sm font-medium uppercase tracking-wide">
                  Version
                </Text>
                {group.version}
                <Badge variant="outline" className="text-xs">
                  {group.banners.length}
                </Badge>
              </Heading>

              <Grid cols={1} md={2} lg={4}>
                {group.banners.map((banner) => {
                  const isActive = activeRunIds.has(banner.runId);
                  return (
                    <BannerCard
                      key={banner.runId}
                      banner={banner}
                      headerExtra={
                        <YStack gap={8}>
                          <CardDescription className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Calendar size={14} />
                            <Text size="xs" variant="muted">
                              {formatDate(banner.startDate) || "N/A"} to{" "}
                              {formatDate(banner.endDate) || "N/A"}
                            </Text>
                            {isActive && (
                              <Badge className="bg-success text-success-foreground text-xs">
                                Active
                              </Badge>
                            )}
                          </CardDescription>
                          {banner.rateUp6Star && banner.rateUp6Star.length > 0 && (
                            <RateUpBadgeList
                              names={banner.rateUp6Star}
                              rarity={6}
                              imageUrlOf={imageUrlOf}
                              showLabel={false}
                              limit={8}
                            />
                          )}
                          <BannerRecent6Star
                            pulls={recent6StarByRun.get(banner.runId) ?? []}
                            imageUrlOf={imageUrlOf}
                          />
                        </YStack>
                      }
                      footer={<BannerCardFooter banner={banner} />}
                    />
                  );
                })}
              </Grid>
            </Section>
          ))}
        </YStack>
      ) : (
        <Card className="p-12">
          <Empty className="border-0 p-0 text-center">
            <EmptyContent>
              <Text variant="muted">No banners found in configuration files.</Text>
            </EmptyContent>
          </Empty>
        </Card>
      )}
    </YStack>
  );
}
