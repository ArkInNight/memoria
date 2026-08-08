import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowRight, Layers } from "lucide-react";
import type { Banner } from "@/lib/shared";
import { slugify } from "@/lib/shared";
import { EntityImage } from "@/components/ui/entity-image";
import { getAggregatedBanners } from "@/lib/domain/assets";
import { YStack, XStack, Spacer } from "@/components/layout/stack";
import { Grid } from "@/components/layout/grid";
import { Text } from "@/components/typography";
import { PageHeader } from "@/components/page-header";
import { Empty, EmptyContent } from "@/components/ui/empty";
import { BannerTypeBadge } from "../components/banner-type-badge";

export function BannerArchivePage() {
  const banners: Banner[] = useMemo(() => getAggregatedBanners(), []);

  return (
    <YStack gap={24}>
      <PageHeader
        title="Banner Archive"
        description="Browse historical game banners and view pull stats."
      >
        <Button asChild>
          <Link to="/banners/current">
            <Layers className="mr-2 h-4 w-4" />
            Current Active Banners
          </Link>
        </Button>
      </PageHeader>

      {banners.length > 0 ? (
        <Grid md={2} lg={3}>
          {banners.map((banner) => (
            <Card
              key={banner.name}
              className="flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md transition"
            >
              <EntityImage
                variant="banner"
                name={banner.name}
                imageUrl={banner.imageUrl ?? undefined}
                className="aspect-[16/7] w-full"
              />
              <CardHeader className="pb-4">
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
                <CardTitle className="text-xl font-bold">{banner.name}</CardTitle>
                <CardDescription className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                  <Calendar size={14} />
                  <Text size="xs" variant="muted">
                    {banner.startDate ? banner.startDate.split(" ")[0] : "N/A"} to{" "}
                    {banner.endDate ? banner.endDate.split(" ")[0] : "N/A"}
                  </Text>
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0 border-t border-border mt-auto p-4 bg-muted/20 flex items-center justify-between">
                <Text size="xs" variant="muted" weight="medium">
                  {banner.nameCN || "—"}
                </Text>
                <Button asChild size="sm" variant="ghost" className="text-primary hover:text-primary">
                  <Link to="/banners/$bannerId" params={{ bannerId: slugify(banner.name) }}>
                    View Stats
                    <ArrowRight size={14} className="ml-1" />
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
              <Text variant="muted">No banners found in configuration files.</Text>
            </EmptyContent>
          </Empty>
        </Card>
      )}
    </YStack>
  );
}
