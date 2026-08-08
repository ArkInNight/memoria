import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { server } from "@/api/client";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, ArrowRight, Layers } from "lucide-react";
import type { Banner } from "@memoria/shared";
import { slugify } from "@memoria/shared";
import { EntityImage } from "@/components/ui/entity-image";

export const Route = createFileRoute("/banners/")({
  component: BannersIndexPage,
});

function BannersIndexPage() {
  const { data: banners, isLoading } = useQuery<Banner[]>({
    queryKey: ["banners-archive"],
    queryFn: async () => {
      const res = await server.api.banners.get();
      if (res.error) throw new Error(res.error.value as string);
      return res.data as Banner[];
    },
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Banner Archive</h2>
          <p className="text-muted-foreground mt-1">Browse historical game banners and view pull stats.</p>
        </div>
        <Button asChild>
          <Link to="/banners/current">
            <Layers className="mr-2 h-4 w-4" />
            Current Active Banners
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-48 mb-2" />
                <Skeleton className="h-8 w-full mt-4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : banners && banners.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {banners.map((banner) => (
            <Card key={banner.name} className="flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md transition">
              <EntityImage
                variant="banner"
                name={banner.name}
                imageUrl={banner.imageUrl ?? undefined}
                className="aspect-[16/7] w-full"
              />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-2">
                  {banner.version ? (
                    <Badge variant="outline" className="text-xs">Version {banner.version}</Badge>
                  ) : (
                    <span></span>
                  )}
                  <Badge className={`${getBannerTypeColor(banner.type)} text-xs capitalize`}>
                    {(banner.type ?? "other").replace("-", " ")}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-bold">{banner.name}</CardTitle>
                <CardDescription className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                  <Calendar size={14} />
                  <span>
                    {banner.startDate ? banner.startDate.split(" ")[0] : "N/A"} to{" "}
                    {banner.endDate ? banner.endDate.split(" ")[0] : "N/A"}
                  </span>
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0 border-t border-border mt-auto p-4 bg-muted/20 flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">
                  {banner.nameCN || "—"}
                </span>
                <Button asChild size="sm" variant="ghost" className="text-primary hover:text-primary">
                  <Link to="/banners/$bannerId" params={{ bannerId: slugify(banner.name) }}>
                    View Stats
                    <ArrowRight size={14} className="ml-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center text-muted-foreground">
          No banners found in configuration files.
        </Card>
      )}
    </div>
  );
}
