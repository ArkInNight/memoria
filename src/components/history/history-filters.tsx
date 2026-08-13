import { Search } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Grid } from "@/components/layout/grid";
import { XStack } from "@/components/layout/stack";
import { Text } from "@/components/typography";

export interface BannerOption {
  runId: string;
  label: string;
}

export interface HistoryFiltersValues {
  search: string;
  bannerFilter: string;
  rarityFilter: string;
  total: number;
}

function HistoryFilters({
  values,
  banners,
  hideBannerFilter = false,
  onSearchChange,
  onBannerChange,
  onRarityChange,
}: {
  values: HistoryFiltersValues;
  banners: BannerOption[];
  hideBannerFilter?: boolean;
  onSearchChange: (value: string) => void;
  onBannerChange: (value: string) => void;
  onRarityChange: (value: string) => void;
}) {
  return (
    <Card className="p-4 shadow-sm">
      <Grid md={hideBannerFilter ? 3 : 4} gap={16}>
        <XStack gap={0} className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            aria-label="Search summon history"
            placeholder="Search character name..."
            value={values.search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </XStack>

        {!hideBannerFilter && (
          <Select value={values.bannerFilter} onValueChange={onBannerChange}>
            <SelectTrigger aria-label="Filter by banner">
              <SelectValue placeholder="All Banners" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Banners</SelectItem>
                {banners.map((b) => (
                  <SelectItem key={b.runId} value={b.runId}>
                    {b.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        )}

        <Select value={values.rarityFilter} onValueChange={onRarityChange}>
          <SelectTrigger aria-label="Filter by rarity">
            <SelectValue placeholder="All Rarities" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All Rarities</SelectItem>
              <SelectItem value="6">6★ Rarity</SelectItem>
              <SelectItem value="5">5★ Rarity</SelectItem>
              <SelectItem value="4">4★ Rarity</SelectItem>
              <SelectItem value="3">3★ Rarity</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <XStack gap={8} className="justify-end items-center">
          <Text size="sm" variant="muted" weight="medium">
            {`${values.total} records found`}
          </Text>
        </XStack>
      </Grid>
    </Card>
  );
}

export { HistoryFilters };
