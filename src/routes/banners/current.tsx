import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight } from "lucide-react";
import type { Banner } from "@memoria/shared";
import { slugify } from "@memoria/shared";
import { EntityImage } from "@/components/ui/entity-image";
import { CHARACTERS, getCurrentBanners } from "@/lib/domain/assets";

export const Route = createFileRoute("/banners/current")({
  component: CurrentBannersPage,
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

function CurrentBannersPage() {
  const activeBanners: Banner[] = useMemo(() => getCurrentBanners(), []);
  const charImageByName = useMemo(
    () => new Map(CHARACTERS.map((c) => [c.name, c.imageUrl])),
    []
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Current Banners</h2>
        <p className="text-muted-foreground mt-1">Currently active summon banners inside the archive scope.</p>
      </div>

      {activeBanners.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {activeBanners.map((banner) => (
            <Card key={banner.name} className="flex flex-col justify-between overflow-hidden shadow-md">
              <EntityImage
                variant="banner"
                name={banner.name}
                imageUrl={banner.imageUrl ?? undefined}
                className="aspect-[16/7] w-full"
              />
              <CardHeader>
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
                <CardTitle className="text-2xl font-bold">{banner.name}</CardTitle>
                <CardDescription className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                  <Calendar size={14} />
                  <span>
                    Ends on: {banner.endDate ? banner.endDate.split(" ")[0] : "N/A"}
                  </span>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Rate up items */}
                {((banner.rateUp6Star && banner.rateUp6Star.length > 0) ||
                  (banner.rateUp5Star && banner.rateUp5Star.length > 0)) ? (
                  <div className="space-y-4">
                    {banner.rateUp6Star && banner.rateUp6Star.length > 0 && (
                      <div>
                        <span className="text-xs font-semibold text-yellow-500 uppercase tracking-wider block mb-2">
                          Rate Up 6★
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {banner.rateUp6Star.map((name) => (
                            <span key={name} className="inline-flex items-center gap-2 rounded-full bg-yellow-500/90 hover:bg-yellow-600 text-black py-1 pl-1 pr-2.5 font-semibold text-sm">
                              <EntityImage
                                name={name}
                                imageUrl={charImageByName.get(name)}
                                rarity={6}
                                className="h-7 w-7 rounded-full"
                              />
                              {name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {banner.rateUp5Star && banner.rateUp5Star.length > 0 && (
                      <div>
                        <span className="text-xs font-semibold text-purple-500 uppercase tracking-wider block mb-2">
                          Rate Up 5★
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {banner.rateUp5Star.map((name) => (
                            <span key={name} className="inline-flex items-center gap-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white py-1 pl-1 pr-2.5 font-semibold text-sm">
                              <EntityImage
                                name={name}
                                imageUrl={charImageByName.get(name)}
                                rarity={5}
                                className="h-7 w-7 rounded-full"
                              />
                              {name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground italic">
                    {banner.type === "ripples"
                      ? "Custom Selector banner. Choose any character from standard pool."
                      : "Standard summon rates apply."}
                  </div>
                )}

                <Button asChild className="w-full mt-4">
                  <Link to="/banners/$bannerId" params={{ bannerId: slugify(banner.name) }}>
                    View Statistics
                    <ArrowRight size={16} className="ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center text-muted-foreground">
          No banners are currently active.
        </Card>
      )}
    </div>
  );
}
