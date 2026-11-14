import { Flame, ShieldCheck, Sparkles, Target, Coins } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PityHeroStatus } from "@/core/summon-stats";
import { formatNumber } from "@/shared";

interface PityHeroCardProps {
  status: PityHeroStatus;
  bannerName?: string;
  className?: string;
}

export function PityHeroCard({ status, bannerName, className }: PityHeroCardProps) {
  const { currentPity, maxPity, softPity, distanceToSoft, guaranteed, pool } = status;
  const progressPercent = Math.min(100, Math.round((currentPity / maxPity) * 100));
  const softPercent = Math.round((softPity / maxPity) * 100);
  const isInSoftPity = currentPity >= softPity;
  const pullsToHardPity = Math.max(0, maxPity - currentPity);
  const clearDropsToHardPity = pullsToHardPity * 160;

  return (
    <Card
      className={cn(
        "relative overflow-hidden border border-border bg-gradient-to-br from-card via-card to-primary/5 p-5 shadow-sm backdrop-blur-[14px] sm:p-6",
        className
      )}
    >
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative flex flex-col gap-5">
        {/* Top Header: Pool Context & Guarantee Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary">
              <Sparkles size={16} />
            </span>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                6★ Pity Tracker
              </h2>
              <p className="text-sm font-medium leading-none text-foreground">
                {bannerName ? `${bannerName} (${pool})` : `${pool} Pool`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {guaranteed === true && (
              <Badge className="bg-info text-info-foreground flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold shadow-xs">
                <ShieldCheck size={13} />
                Guaranteed Next 6★
              </Badge>
            )}
            {guaranteed === false && (
              <Badge
                variant="outline"
                className="border-border/80 bg-background/50 px-2.5 py-1 text-xs font-semibold"
              >
                50/50 Next 6★
              </Badge>
            )}
            {guaranteed === null && (
              <Badge
                variant="secondary"
                className="px-2.5 py-1 text-xs font-medium text-muted-foreground"
              >
                Standard Pool (No Rate-Up)
              </Badge>
            )}
          </div>
        </div>

        {/* Hero Section: Big Numbers & Key Metrics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-end">
          {/* Main Pity Counter */}
          <div className="flex flex-col">
            <span className="text-xs font-medium text-muted-foreground">Current Pity</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                {currentPity}
              </span>
              <span className="text-lg font-bold text-muted-foreground sm:text-xl">
                / {maxPity}
              </span>
            </div>
          </div>

          {/* Distance to Soft Pity */}
          <div className="flex flex-col sm:border-l sm:border-border sm:pl-4">
            <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <Target size={13} />
              Soft Pity (at {softPity})
            </span>
            {isInSoftPity ? (
              <div className="mt-1 flex items-center gap-1.5 text-success">
                <Flame size={16} className="animate-pulse" />
                <span className="text-sm font-bold sm:text-base">
                  In Soft Pity Zone (+2.5%/pull)
                </span>
              </div>
            ) : (
              <span className="text-lg font-bold text-foreground sm:text-xl">
                {distanceToSoft}{" "}
                <span className="text-xs font-normal text-muted-foreground">pulls away</span>
              </span>
            )}
          </div>

          {/* Hard Pity Cost */}
          <div className="flex flex-col sm:border-l sm:border-border sm:pl-4">
            <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <Coins size={13} />
              Guaranteed Cap (at {maxPity})
            </span>
            <span className="text-lg font-bold text-foreground sm:text-xl">
              {pullsToHardPity}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                pulls ({formatNumber(clearDropsToHardPity)} drops)
              </span>
            </span>
          </div>
        </div>

        {/* Progress Bar with Soft Pity Marker */}
        <div className="flex flex-col gap-1.5">
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted/60">
            {/* Soft pity indicator line */}
            <div
              className="absolute top-0 bottom-0 z-10 w-0.5 bg-foreground/30"
              style={{ left: `${softPercent}%` }}
              title={`Soft Pity threshold: ${softPity} pulls`}
            />
            {/* Filled progress */}
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                isInSoftPity
                  ? "bg-gradient-to-r from-primary to-orange-500 shadow-sm"
                  : "bg-primary"
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>0</span>
            <span
              className="font-medium text-foreground/70"
              style={{ marginLeft: `${Math.max(0, softPercent - 8)}%` }}
            >
              Soft ({softPity})
            </span>
            <span>Hard ({maxPity})</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
