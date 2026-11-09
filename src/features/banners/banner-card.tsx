import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Banner, BannerInstance } from "@/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EntityImage } from "@/components/ui/entity-image";
import { XStack, Spacer } from "@/components/layout/stack";
import { Text } from "@/components/typography";
import { BannerTypeBadge } from "./banner-type-badge";

/**
 * Shared banner card: image, version/type badges and title on top, then the
 * caller-provided header extra and footer (stats link, rate-ups, etc.).
 */
function BannerCard({
  banner,
  className,
  titleClassName,
  headerExtra,
  footer,
}: {
  banner: Banner;
  className?: string;
  titleClassName?: string;
  headerExtra?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <Card
      className={cn(
        "flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md transition",
        className
      )}
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
        <CardTitle className={cn("text-xl font-bold", titleClassName)}>{banner.name}</CardTitle>
        {headerExtra}
      </CardHeader>
      {footer}
    </Card>
  );
}

/** Standard "View Stats" footer used by archive-style banner cards. */
function BannerCardFooter({ banner }: { banner: BannerInstance }) {
  return (
    <CardContent className="pt-0 border-t border-border mt-auto p-4 bg-muted/20 flex items-center justify-between">
      <Text size="xs" variant="muted" weight="medium">
        {banner.nameCN || "—"}
      </Text>
      <Button asChild size="sm" variant="ghost" className="text-primary hover:text-primary">
        <Link to="/banners/$bannerId" params={{ bannerId: banner.instanceId }}>
          View Stats
          <ArrowRight size={14} className="ml-1" />
        </Link>
      </Button>
    </CardContent>
  );
}

export { BannerCard, BannerCardFooter };
