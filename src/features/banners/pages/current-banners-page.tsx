import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight } from "lucide-react";
import type { Banner } from "@/lib/shared";
import { slugify } from "@/lib/shared";
import { EntityImage } from "@/components/ui/entity-image";
import { CHARACTERS, getCurrentBanners } from "@/lib/domain/assets";
import { YStack, XStack, Spacer } from "@/components/layout/stack";
import { Grid } from "@/components/layout/grid";
import { Text } from "@/components/typography";
import { PageHeader } from "@/components/page-header";
import { Empty, EmptyContent } from "@/components/ui/empty";
import { BannerTypeBadge } from "../components/banner-type-badge";

export function CurrentBannersPage() {
  const activeBanners: Banner[] = useMemo(() => getCurrentBanners(), []);
  const charImageByName = useMemo(
    () => new Map(CHARACTERS.map((c) => [c.name, c.imageUrl])),
    []
  );

  return (
    <YStack gap={24}>
      <PageHeader
        title="Current Banners"
        description="Currently active summon banners inside the archive scope."
      />

      {activeBanners.length > 0 ? (
        <Grid md={2}>
          {activeBanners.map((banner) => (
            <Card
              key={banner.name}
              className="flex flex-col justify-between overflow-hidden shadow-md"
            >
              <EntityImage
                variant="banner"
                name={banner.name}
                imageUrl={banner.imageUrl ?? undefined}
                className="aspect-[16/7] w-full"
              />
              <CardHeader>
                <XStack gap={8} className="justify-between mb-2">
                  {banner.version ? (
                    <Badge variant="outline" className="text-xs">
                      Version {banner.version}
                    </Badge>
                  ) : (
                    <Spacer />
                  )}
                  <BannerTypeBadge type={banner.type} className="text-xs capitalize" />
                </XStack>
                <CardTitle className="text-2xl font-bold">{banner.name}</CardTitle>
                <CardDescription className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                  <Calendar size={14} />
                  <Text size="xs" variant="muted">
                    Ends on: {banner.endDate ? banner.endDate.split(" ")[0] : "N/A"}
                  </Text>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Rate up items */}
                {((banner.rateUp6Star && banner.rateUp6Star.length > 0) ||
                  (banner.rateUp5Star && banner.rateUp5Star.length > 0)) ? (
                  <YStack gap={16}>
                    {banner.rateUp6Star && banner.rateUp6Star.length > 0 && (
                      <YStack gap={8}>
                        <Text
                          size="xs"
                          weight="semibold"
                          variant="yellow"
                          className="uppercase tracking-wider block mb-2"
                        >
                          Rate Up 6★
                        </Text>
                        <XStack gap={8} className="flex-wrap">
                          {banner.rateUp6Star.map((name) => (
                            <Badge
                              key={name}
                              className="inline-flex items-center gap-2 rounded-full bg-yellow-500/90 hover:bg-yellow-600 text-black py-1 pl-1 pr-2.5 font-semibold text-sm border-0"
                            >
                              <EntityImage
                                name={name}
                                imageUrl={charImageByName.get(name)}
                                rarity={6}
                                className="h-7 w-7 rounded-full"
                              />
                              {name}
                            </Badge>
                          ))}
                        </XStack>
                      </YStack>
                    )}

                    {banner.rateUp5Star && banner.rateUp5Star.length > 0 && (
                      <YStack gap={8}>
                        <Text
                          size="xs"
                          weight="semibold"
                          variant="purple"
                          className="uppercase tracking-wider block mb-2"
                        >
                          Rate Up 5★
                        </Text>
                        <XStack gap={8} className="flex-wrap">
                          {banner.rateUp5Star.map((name) => (
                            <Badge
                              key={name}
                              className="inline-flex items-center gap-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white py-1 pl-1 pr-2.5 font-semibold text-sm border-0"
                            >
                              <EntityImage
                                name={name}
                                imageUrl={charImageByName.get(name)}
                                rarity={5}
                                className="h-7 w-7 rounded-full"
                              />
                              {name}
                            </Badge>
                          ))}
                        </XStack>
                      </YStack>
                    )}
                  </YStack>
                ) : (
                  <Text size="xs" variant="muted" className="italic">
                    {banner.type === "ripples"
                      ? "Custom Selector banner. Choose any character from standard pool."
                      : "Standard summon rates apply."}
                  </Text>
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
        </Grid>
      ) : (
        <Card className="p-12">
          <Empty className="border-0 p-0 text-center">
            <EmptyContent>
              <Text variant="muted">No banners are currently active.</Text>
            </EmptyContent>
          </Empty>
        </Card>
      )}
    </YStack>
  );
}
