import { Link, useParams } from "@tanstack/react-router";
import { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Sparkles, Star, Trophy, UserPlus } from "lucide-react";
import { slugify } from "@/lib/shared";
import { EntityImage } from "@/components/ui/entity-image";
import { CHARACTERS, getAggregatedBanners } from "@/lib/domain/assets";
import { computeBannerStats } from "@/lib/domain/stats";
import { useActiveProfile } from "@/lib/store/profiles";
import { usePullRecords } from "@/lib/store/summons";
import { YStack, XStack } from "@/components/layout/stack";
import { Grid } from "@/components/layout/grid";
import { Heading, Text } from "@/components/typography";
import { StatCard } from "@/components/stat-card";
import { EmptyState } from "@/components/empty-state";
import { Empty, EmptyContent } from "@/components/ui/empty";
import { BannerTypeBadge } from "../components/banner-type-badge";

export function BannerDetailPage() {
  const { bannerId } = useParams({ from: "/banners/$bannerId" });

  const profile = useActiveProfile();
  const pulls = usePullRecords(profile?.id);

  const banner = useMemo(
    () => getAggregatedBanners().find((b) => slugify(b.name) === bannerId),
    [bannerId]
  );

  const bannerPulls = useMemo(
    () => (banner ? pulls.filter((p) => p.poolName === banner.name) : []),
    [pulls, banner]
  );

  const stats = useMemo(
    () => (banner ? computeBannerStats(banner, bannerPulls) : null),
    [banner, bannerPulls]
  );

  const getCharImage = (name: string) =>
    CHARACTERS.find((c) => c.name === name)?.imageUrl;

  return (
    <YStack gap={24}>
      {/* Back Button & Header */}
      <YStack gap={16}>
        <Button asChild variant="outline" size="sm" className="w-fit">
          <Link to="/banners">
            <ArrowLeft size={16} className="mr-2" />
            Back to Archive
          </Link>
        </Button>

        {banner ? (
          <YStack gap={4}>
            <XStack gap={12}>
              <Heading level={2}>{banner.name}</Heading>
              <BannerTypeBadge type={banner.type} className="text-xs capitalize" />
            </XStack>
            <Text variant="muted">Detailed statistics and pull details.</Text>
          </YStack>
        ) : (
          <Heading level={2}>Banner not found</Heading>
        )}
      </YStack>

      {!banner ? (
        <Card className="p-12">
          <Empty className="border-0 p-0 text-center">
            <EmptyContent>
              <Text variant="destructive">Banner not found.</Text>
            </EmptyContent>
          </Empty>
        </Card>
      ) : !profile ? (
        <EmptyState
          icon={<UserPlus className="h-7 w-7 text-primary" />}
          title="Belum ada profile"
          description="Statistik banner dihitung dari data summon profile kamu. Buat profile dulu untuk melihat data pull di banner ini."
          action={
            <Button asChild>
              <Link to="/profiles">Buat Profile</Link>
            </Button>
          }
        />
      ) : stats ? (
        <YStack gap={32}>
          {/* Banner Image */}
          <EntityImage
            variant="banner"
            name={banner.name}
            imageUrl={banner.imageUrl ?? undefined}
            className="aspect-[16/5] w-full rounded-2xl"
          />

          {/* Stats Boxes */}
          <Grid cols={1} md={2} lg={4}>
            <StatCard
              label="Total Pulls"
              icon={<Trophy className="text-muted-foreground h-4 w-4" />}
              value={stats.totalPulls}
              hint="Summons in this banner"
            />

            <StatCard
              label="Average 6★ Pity"
              icon={<Sparkles className="text-yellow-500 h-4 w-4" />}
              value={stats.avgPity6Star > 0 ? stats.avgPity6Star : "-"}
              valueClassName="text-yellow-500"
              hint={`Across ${stats.obtained6Star.length} six-stars`}
            />

            <StatCard
              label="Highest Pity"
              icon={<Star className="text-muted-foreground h-4 w-4" />}
              value={stats.highestPity6Star > 0 ? stats.highestPity6Star : "-"}
              hint="Most pulls to get a 6★"
            />

            <StatCard
              label="Lowest Pity"
              icon={<Star className="text-muted-foreground h-4 w-4" />}
              value={stats.lowestPity6Star > 0 ? stats.lowestPity6Star : "-"}
              valueClassName="text-emerald-500"
              hint="Fewest pulls to get a 6★"
            />
          </Grid>

          {/* Obtained Characters section */}
          <Grid md={2}>
            {/* 6-star pulls */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Star className="text-yellow-500 fill-yellow-500 h-5 w-5" />
                  Obtained 6★ Characters ({stats.obtained6Star.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.obtained6Star.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10"></TableHead>
                        <TableHead>Character</TableHead>
                        <TableHead className="text-center">Pity</TableHead>
                        <TableHead>Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.obtained6Star.map((p, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <EntityImage name={p.name} imageUrl={getCharImage(p.name)} rarity={6} className="h-9 w-9 rounded-full" />
                          </TableCell>
                          <TableCell className="font-semibold text-yellow-500">{p.name}</TableCell>
                          <TableCell className="text-center font-mono font-bold">{p.pity}</TableCell>
                          <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                            {p.createTime.split(".")[0]}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Empty className="border-0 p-8">
                    <EmptyContent>
                      <Text size="sm" variant="muted">
                        No 6★ characters obtained on this banner.
                      </Text>
                    </EmptyContent>
                  </Empty>
                )}
              </CardContent>
            </Card>

            {/* 5-star pulls */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Star className="text-purple-500 fill-purple-500 h-5 w-5" />
                  Obtained 5★ Characters ({stats.obtained5Star.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.obtained5Star.length > 0 ? (
                  <YStack gap={0} className="max-h-[400px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10"></TableHead>
                          <TableHead>Character</TableHead>
                          <TableHead className="text-center">Pity</TableHead>
                          <TableHead>Time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stats.obtained5Star.map((p, i) => (
                          <TableRow key={i}>
                            <TableCell>
                              <EntityImage name={p.name} imageUrl={getCharImage(p.name)} rarity={5} className="h-9 w-9 rounded-full" />
                            </TableCell>
                            <TableCell className="font-semibold text-purple-500">{p.name}</TableCell>
                            <TableCell className="text-center font-mono font-bold">{p.pity}</TableCell>
                            <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                              {p.createTime.split(".")[0]}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </YStack>
                ) : (
                  <Empty className="border-0 p-8">
                    <EmptyContent>
                      <Text size="sm" variant="muted">
                        No 5★ characters obtained on this banner.
                      </Text>
                    </EmptyContent>
                  </Empty>
                )}
              </CardContent>
            </Card>
          </Grid>
        </YStack>
      ) : null}
    </YStack>
  );
}
