import { Flame, LayoutGrid, Check } from "lucide-react";

import { EntityImage } from "@/components/ui/entity-image";
import { Section } from "@/components/layout/section";
import { Heading } from "@/components/typography";
import { cn } from "@/lib/utils";
import type { BannerInstance } from "@/shared";
import { catalogStore } from "@/stores/catalog-store";
import { getPityPoolForRun } from "@/core/summon-engine";

interface ActiveBannersSectionProps {
  banners: BannerInstance[];
  selected: string;
  onSelect: (pool: string) => void;
}

export function ActiveBannersSection({ banners, selected, onSelect }: ActiveBannersSectionProps) {
  if (banners.length === 0) return null;

  const poolOf = (banner: BannerInstance) => getPityPoolForRun(banner, catalogStore.bannerRules);

  return (
    <Section gap={12}>
      <div className="flex flex-col gap-1">
        <Heading level={2} className="flex items-center gap-2">
          <Flame size={18} className="text-orange-500" />
          Active Banners
        </Heading>
        <p className="text-sm text-muted-foreground">
          Filter by banner pool to view focused pity and summon history.
        </p>
      </div>

      {/* Snap-scroll deck on mobile, clean responsive grid on larger viewports */}
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 pt-1 scrollbar-thin snap-x snap-mandatory sm:mx-0 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 sm:overflow-visible sm:px-0">
        {/* All Banners Tile */}
        <button
          type="button"
          onClick={() => onSelect("all")}
          aria-pressed={selected === "all"}
          className={cn(
            "group relative flex w-44 shrink-0 flex-col overflow-hidden rounded-xl border text-left transition snap-start sm:w-auto",
            selected === "all"
              ? "border-primary bg-primary/10 ring-2 ring-primary/60 shadow-sm"
              : "border-border bg-card/80 hover:border-primary/50 hover:bg-card hover:shadow-sm"
          )}
        >
          <div className="relative aspect-video w-full overflow-hidden bg-muted/60 flex items-center justify-center">
            <LayoutGrid
              size={24}
              className={cn(
                "transition group-hover:scale-110",
                selected === "all" ? "text-primary" : "text-muted-foreground"
              )}
            />
            {selected === "all" && (
              <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check size={12} strokeWidth={3} />
              </span>
            )}
          </div>
          <div className="flex flex-1 flex-col justify-between p-2.5">
            <span className="text-xs font-semibold leading-tight text-foreground line-clamp-1">
              All Banners
            </span>
            <span className="mt-0.5 text-[10px] text-muted-foreground">Combined history</span>
          </div>
        </button>

        {/* Banner Tiles */}
        {banners.map((banner) => {
          const pool = poolOf(banner);
          const isSelected = selected === pool;
          const label = catalogStore.getInstanceLabel(banner);

          return (
            <button
              key={banner.instanceId}
              type="button"
              onClick={() => onSelect(pool)}
              aria-pressed={isSelected}
              className={cn(
                "group relative flex w-44 shrink-0 flex-col overflow-hidden rounded-xl border text-left transition snap-start sm:w-auto",
                isSelected
                  ? "border-primary bg-primary/10 ring-2 ring-primary/60 shadow-sm"
                  : "border-border bg-card/80 hover:border-primary/50 hover:bg-card hover:shadow-sm"
              )}
            >
              <div className="relative aspect-video w-full overflow-hidden bg-muted/40">
                <EntityImage
                  variant="banner"
                  name={banner.name}
                  imageUrl={banner.imageUrl ?? undefined}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
                {isSelected && (
                  <span className="absolute right-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs">
                    <Check size={12} strokeWidth={3} />
                  </span>
                )}
                <span className="absolute bottom-1.5 left-1.5 z-10 rounded-sm bg-black/70 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white backdrop-blur-xs">
                  {pool}
                </span>
              </div>

              <div className="flex flex-1 flex-col justify-between p-2.5">
                <span className="text-xs font-semibold leading-tight text-foreground line-clamp-1">
                  {banner.name}
                </span>
                <span className="mt-0.5 text-[10px] text-muted-foreground truncate">
                  {banner.version ? `v${banner.version}` : label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </Section>
  );
}
