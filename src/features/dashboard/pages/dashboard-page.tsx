import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Star,
  Sparkles,
  CalendarDays,
  Flame,
  UserPlus,
} from "lucide-react";
import { slugify } from "@/lib/shared";
import { EntityImage } from "@/components/ui/entity-image";
import { getCurrentBanners } from "@/lib/domain/assets";
import { computeDashboardStats } from "@/lib/domain/stats";
import { useActiveProfile } from "@/lib/store/profiles";
import { usePullRecords } from "@/lib/store/summons";
import { useSessions } from "@/lib/store/sessions";
import { YStack, XStack } from "@/components/layout/stack";
import { Grid } from "@/components/layout/grid";
import { Section } from "@/components/layout/section";
import { Heading, Text } from "@/components/typography";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { EmptyState } from "@/components/empty-state";
import { Dot } from "@/components/dot";
import { BannerTypeBadge } from "@/features/banners/components/banner-type-badge";

export function DashboardPage() {
  const profile = useActiveProfile();
  const pulls = usePullRecords(profile?.id);
  const sessions = useSessions(profile?.id);

  const stats = useMemo(
    () => (profile ? computeDashboardStats(pulls, sessions) : null),
    [profile, pulls, sessions]
  );
  const activeBanners = useMemo(() => getCurrentBanners(), []);

  if (!profile) {
    return (
      <YStack gap={32}>
        <PageHeader
          title="Dashboard"
          description="Overview of your permanent summon archive."
        />
        <EmptyState
          icon={<UserPlus className="h-7 w-7 text-primary" />}
          title="Belum ada profile"
          description="Buat profile untuk akun game kamu dulu. Semua data summon disimpan hanya di browser kamu — tanpa login."
          action={
            <Button asChild>
              <Link to="/profiles">Buat Profile Pertama</Link>
            </Button>
          }
        />
      </YStack>
    );
  }

  return (
    <YStack gap={32}>
      {/* Header */}
      <PageHeader
        title="Dashboard"
        description={
          profile.name
            ? `Overview of your permanent summon archive — ${profile.name}.`
            : "Overview of your permanent summon archive."
        }
      />

      {stats ? (
        <YStack gap={32}>
          {/* Summary Row */}
          <Grid cols={1} md={2} lg={4}>
            <StatCard
              label="Total Summons"
              icon={<Trophy className="text-primary h-4 w-4" />}
              value={stats.totalSummons}
              hint="Summons stored permanently"
            />

            <StatCard
              label="Current Pity"
              icon={<Sparkles className="text-yellow-500 h-4 w-4" />}
              value={
                <>
                  {stats.currentPity}{" "}
                  <Text size="sm" variant="muted" weight="normal">
                    / 70
                  </Text>
                </>
              }
            >
              <XStack gap={6} className="mt-1">
                <Dot
                  className={
                    stats.currentGuarantee ? "bg-emerald-500" : "bg-yellow-500 animate-pulse"
                  }
                />
                <Text size="xs" variant="muted">
                  {stats.currentGuarantee ? "Guaranteed Rate Up" : "50/50 Chance"}
                </Text>
              </XStack>
            </StatCard>

            <StatCard
              label="6★ Characters"
              icon={<Star className="text-yellow-500 fill-yellow-500 h-4 w-4" />}
              value={stats.total6Star}
              valueClassName="text-yellow-500"
              hint={`${stats.totalSummons > 0 ? ((stats.total6Star / stats.totalSummons) * 100).toFixed(2) : "0"}% rate`}
            />

            <StatCard
              label="5★ Characters"
              icon={<Star className="text-purple-500 fill-purple-500 h-4 w-4" />}
              value={stats.total5Star}
              valueClassName="text-purple-500"
              hint={`${stats.totalSummons > 0 ? ((stats.total5Star / stats.totalSummons) * 100).toFixed(2) : "0"}% rate`}
            />
          </Grid>

          {/* Active Banners Shortcut */}
          {activeBanners && activeBanners.length > 0 && (
            <Section gap={12}>
              <XStack gap={8} className="justify-between mb-3">
                <Heading level={3} className="flex items-center gap-2">
                  <Flame size={18} className="text-orange-500" />
                  Active Banners
                </Heading>
                <Button asChild variant="ghost" size="sm" className="text-primary">
                  <Link to="/banners/current">View all →</Link>
                </Button>
              </XStack>
              <Grid gap={16} md={2} lg={3}>
                {activeBanners.slice(0, 3).map((banner) => (
                  <Link
                    key={banner.name}
                    to="/banners/$bannerId"
                    params={{ bannerId: slugify(banner.name) }}
                    className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition"
                  >
                    <EntityImage
                      variant="banner"
                      name={banner.name}
                      imageUrl={banner.imageUrl ?? undefined}
                      className="aspect-[16/6] w-full"
                    />
                    <YStack gap={4} className="p-3">
                      <XStack gap={8} className="justify-between">
                        <Text size="sm" weight="semibold" className="truncate">
                          {banner.name}
                        </Text>
                        <BannerTypeBadge
                          type={banner.type ?? "other"}
                          className="text-[10px] capitalize shrink-0"
                        />
                      </XStack>
                      <Text size="xs" variant="muted">
                        Ends {banner.endDate ? banner.endDate.split(" ")[0] : "N/A"}
                      </Text>
                    </YStack>
                  </Link>
                ))}
              </Grid>
            </Section>
          )}

          {/* Quick Info & Action Banners */}
          <Grid md={2}>
            <Card className="p-6 flex flex-col justify-between">
              <YStack gap={8}>
                <Heading level={3} className="mb-2">
                  Import Summon History
                </Heading>
                <Text size="sm" variant="muted" className="mb-4">
                  Keep your archive up to date by importing new summons. Grab your link and paste
                  it to merge records.
                </Text>
              </YStack>
              <XStack gap={16} className="justify-between mt-2">
                <XStack gap={6} className="text-xs text-muted-foreground">
                  <CalendarDays size={14} />
                  <Text size="xs" variant="muted">
                    Last imported:{" "}
                    {stats.lastImportTime ? String(stats.lastImportTime).split(".")[0] : "Never"}
                  </Text>
                </XStack>
                <Button asChild size="sm">
                  <Link to="/import">Import Now</Link>
                </Button>
              </XStack>
            </Card>

            <Card className="p-6 flex flex-col justify-between">
              <YStack gap={8}>
                <Heading level={3} className="mb-2">
                  Banners & Stats
                </Heading>
                <Text size="sm" variant="muted" className="mb-4">
                  Analyze details, average pity, guarantee status, and history of rate-ups for
                  specific banners.
                </Text>
              </YStack>
              <XStack gap={8} className="mt-2">
                <Button asChild variant="outline" size="sm">
                  <Link to="/banners">Banner Archive</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to="/banners/current">Current Banners</Link>
                </Button>
              </XStack>
            </Card>
          </Grid>
        </YStack>
      ) : (
        <Card className="p-12 text-center">
          <Skeleton className="h-8 w-16 mx-auto mb-2" />
          <Text variant="muted">Loading...</Text>
        </Card>
      )}
    </YStack>
  );
}
