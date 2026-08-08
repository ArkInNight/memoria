import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Trophy, Star, Sparkles, CalendarDays, Flame, UserPlus } from "lucide-react";
import { slugify } from "@memoria/shared";
import { EntityImage } from "@/components/ui/entity-image";
import { Badge } from "@/components/ui/badge";
import { getCurrentBanners } from "@/lib/domain/assets";
import { computeDashboardStats } from "@/lib/domain/stats";
import { useActiveProfile } from "@/lib/store/profiles";
import { usePullRecords } from "@/lib/store/summons";
import { useSessions } from "@/lib/store/sessions";

export const Route = createFileRoute("/")({
  component: DashboardPage,
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

function DashboardPage() {
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
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground mt-1">Overview of your permanent summon archive.</p>
        </div>
        <Card className="p-12 text-center space-y-4">
          <div className="mx-auto w-14 h-14 rounded-full bg-muted flex items-center justify-center">
            <UserPlus className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Belum ada profile</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              Buat profile untuk akun game kamu dulu. Semua data summon disimpan hanya di browser
              kamu — tanpa login.
            </p>
          </div>
          <Button asChild>
            <Link to="/profiles">Buat Profile Pertama</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground mt-1">
            Overview of your permanent summon archive{profile.name ? ` — ${profile.name}` : ""}.
          </p>
        </div>
      </div>

      {stats ? (
        <div className="space-y-8">
          {/* Summary Row */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Summons</CardTitle>
                <Trophy className="text-primary h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalSummons}</div>
                <p className="text-xs text-muted-foreground mt-1">Summons stored permanently</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Pity</CardTitle>
                <Sparkles className="text-yellow-500 h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {stats.currentPity} <span className="text-sm text-muted-foreground font-normal">/ 70</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${
                      stats.currentGuarantee ? "bg-emerald-500" : "bg-yellow-500 animate-pulse"
                    }`}
                  />
                  <p className="text-xs text-muted-foreground">
                    {stats.currentGuarantee ? "Guaranteed Rate Up" : "50/50 Chance"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">6★ Characters</CardTitle>
                <Star className="text-yellow-500 fill-yellow-500 h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-500">{stats.total6Star}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.totalSummons > 0
                    ? `${((stats.total6Star / stats.totalSummons) * 100).toFixed(2)}%`
                    : "0%"}{" "}
                  rate
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">5★ Characters</CardTitle>
                <Star className="text-purple-500 fill-purple-500 h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-500">{stats.total5Star}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.totalSummons > 0
                    ? `${((stats.total5Star / stats.totalSummons) * 100).toFixed(2)}%`
                    : "0%"}{" "}
                  rate
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Active Banners Shortcut */}
          {activeBanners && activeBanners.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Flame size={18} className="text-orange-500" />
                  Active Banners
                </h3>
                <Button asChild variant="ghost" size="sm" className="text-primary">
                  <Link to="/banners/current">View all →</Link>
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                    <div className="p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold truncate">{banner.name}</span>
                        <Badge className={`${getBannerTypeColor(banner.type)} text-[10px] capitalize shrink-0`}>
                          {(banner.type ?? "other").replace("-", " ")}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Ends {banner.endDate ? banner.endDate.split(" ")[0] : "N/A"}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Quick Info & Action Banners */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Import Summon History</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Keep your archive up to date by importing new summons. Grab your link and paste it
                  to merge records.
                </p>
              </div>
              <div className="flex items-center justify-between gap-4 mt-2">
                <div className="flex items-center text-xs text-muted-foreground gap-1.5">
                  <CalendarDays size={14} />
                  <span>
                    Last imported: {stats.lastImportTime ? String(stats.lastImportTime).split(".")[0] : "Never"}
                  </span>
                </div>
                <Button asChild size="sm">
                  <Link to="/import">Import Now</Link>
                </Button>
              </div>
            </Card>

            <Card className="p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Banners & Stats</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Analyze details, average pity, guarantee status, and history of rate-ups for
                  specific banners.
                </p>
              </div>
              <div className="flex gap-2 mt-2">
                <Button asChild variant="outline" size="sm">
                  <Link to="/banners">Banner Archive</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to="/banners/current">Current Banners</Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Skeleton className="h-8 w-16 mx-auto mb-2" />
          <p className="text-muted-foreground">Loading...</p>
        </Card>
      )}
    </div>
  );
}
