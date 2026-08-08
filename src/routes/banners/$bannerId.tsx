import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Sparkles, Star, Trophy, UserPlus } from "lucide-react";
import { slugify } from "@memoria/shared";
import { EntityImage } from "@/components/ui/entity-image";
import { CHARACTERS, getAggregatedBanners } from "@/lib/domain/assets";
import { computeBannerStats } from "@/lib/domain/stats";
import { useActiveProfile } from "@/lib/store/profiles";
import { usePullRecords } from "@/lib/store/summons";

export const Route = createFileRoute("/banners/$bannerId")({
  component: BannerDetailPage,
});

const getBannerTypeColor = (type: string) => {
  switch (type) {
    case "debut":
      return "bg-amber-600 text-white";
    case "rerun":
      return "bg-purple-600 text-white";
    case "exclusive":
      return "bg-orange-600 text-white";
    case "collaboration":
      return "bg-red-600 text-white";
    case "ripples":
      return "bg-cyan-600 text-white";
    case "lake-promise":
    case "lake-revelation":
    case "lake-gift":
    case "lake-invitation":
    case "lake-vow":
    case "snow":
    case "yearning":
      return "bg-emerald-600 text-white";
    case "beginner":
      return "bg-teal-600 text-white";
    case "standard":
      return "bg-gray-600 text-white";
    default:
      return "bg-blue-600 text-white";
  }
};

function BannerDetailPage() {
  const { bannerId } = Route.useParams();

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
    <div className="space-y-6">
      {/* Back Button & Header */}
      <div className="flex flex-col gap-4">
        <Button asChild variant="outline" size="sm" className="w-fit">
          <Link to="/banners">
            <ArrowLeft size={16} className="mr-2" />
            Back to Archive
          </Link>
        </Button>

        {banner ? (
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold tracking-tight">{banner.name}</h2>
              <Badge className={`${getBannerTypeColor(banner.type)} text-xs capitalize`}>
                {(banner.type ?? "other").replace("-", " ")}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">Detailed statistics and pull details.</p>
          </div>
        ) : (
          <h2 className="text-3xl font-bold tracking-tight">Banner not found</h2>
        )}
      </div>

      {!banner ? (
        <Card className="p-12 text-center text-destructive">Banner not found.</Card>
      ) : !profile ? (
        <Card className="p-12 text-center space-y-4">
          <div className="mx-auto w-14 h-14 rounded-full bg-muted flex items-center justify-center">
            <UserPlus className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Belum ada profile</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              Statistik banner dihitung dari data summon profile kamu. Buat profile dulu untuk
              melihat data pull di banner ini.
            </p>
          </div>
          <Button asChild>
            <Link to="/profiles">Buat Profile</Link>
          </Button>
        </Card>
      ) : stats ? (
        <div className="space-y-8">
          {/* Banner Image */}
          <EntityImage
            variant="banner"
            name={banner.name}
            imageUrl={banner.imageUrl ?? undefined}
            className="aspect-[16/5] w-full rounded-2xl"
          />

          {/* Stats Boxes */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Pulls</CardTitle>
                <Trophy className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalPulls}</div>
                <p className="text-xs text-muted-foreground mt-1">Summons in this banner</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average 6★ Pity</CardTitle>
                <Sparkles className="text-yellow-500 h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-500">
                  {stats.avgPity6Star > 0 ? stats.avgPity6Star : "-"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Across {stats.obtained6Star.length} six-stars
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Highest Pity</CardTitle>
                <Star className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {stats.highestPity6Star > 0 ? stats.highestPity6Star : "-"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Most pulls to get a 6★</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lowest Pity</CardTitle>
                <Star className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-500">
                  {stats.lowestPity6Star > 0 ? stats.lowestPity6Star : "-"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Fewest pulls to get a 6★</p>
              </CardContent>
            </Card>
          </div>

          {/* Obtained Characters section */}
          <div className="grid gap-6 md:grid-cols-2">
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
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    No 6★ characters obtained on this banner.
                  </div>
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
                  <div className="max-h-[400px] overflow-y-auto">
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
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    No 5★ characters obtained on this banner.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  );
}
