import { Flame, LayoutGrid } from "lucide-react";

import { EntityImage } from "@/components/ui/entity-image";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Section } from "@/components/layout/section";
import { Heading } from "@/components/typography";
import { cn } from "@/lib/utils";
import type { BannerInstance } from "@/shared";
import { catalogStore } from "@/stores/catalog-store";
import { getPityPoolForRun } from "@/core/summon-engine";

function SelectorTile({
  selected,
  onClick,
  label,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          aria-label={label}
          aria-pressed={selected}
          className={cn(
            "group aspect-video min-h-11 w-full overflow-hidden rounded-lg border transition",
            selected
              ? "border-primary ring-2 ring-primary/60"
              : "border-border hover:border-primary/50 hover:shadow-sm"
          )}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function ActiveBannersSection({
  banners,
  selected,
  onSelect,
}: {
  banners: BannerInstance[];
  selected: string;
  onSelect: (pool: string) => void;
}) {
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
          Select a banner to filter by its type — every edition of that pool is included.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
        <SelectorTile
          selected={selected === "all"}
          onClick={() => onSelect("all")}
          label="All Banners"
        >
          <span className="flex h-full w-full items-center justify-center bg-muted/40 text-muted-foreground transition group-hover:bg-muted/60">
            <LayoutGrid size={18} />
          </span>
        </SelectorTile>

        {banners.map((banner) => {
          const pool = poolOf(banner);
          const isSelected = selected === pool;
          return (
            <SelectorTile
              key={banner.instanceId}
              selected={isSelected}
              onClick={() => onSelect(pool)}
              label={`${catalogStore.getInstanceLabel(banner)} — filter by ${pool}`}
            >
              <EntityImage
                variant="banner"
                name={banner.name}
                imageUrl={banner.imageUrl ?? undefined}
                className="h-full w-full"
              />
            </SelectorTile>
          );
        })}
      </div>
    </Section>
  );
}

export { ActiveBannersSection };
