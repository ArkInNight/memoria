import { EntityImage } from "@/components/ui/entity-image";
import { recentSixStar } from "@/lib/domain/stats";
import type { PullRecord } from "@/lib/shared";

const LIMIT = 6;

/**
 * Compact "Recent 6★" strip for a banner card: small portraits of the most
 * recent 6★ pulls on that banner, each labeled with its pity.
 */
function BannerRecent6Star({
  pulls,
  imageUrlOf,
}: {
  pulls: PullRecord[];
  imageUrlOf: (name: string) => string | undefined;
}) {
  const recent = recentSixStar(pulls, LIMIT);

  if (recent.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        Recent 6★
      </span>
      <ul className="flex flex-wrap gap-x-1.5 gap-y-1">
        {recent.map((pull) => (
          <li
            key={pull.id}
            title={`${pull.name} · ${pull.poolName} · P${pull.pity}`}
            className="flex w-8 flex-col items-center gap-0.5"
          >
            <EntityImage
              name={pull.name}
              imageUrl={imageUrlOf(pull.name)}
              rarity={6}
              className="h-7 w-7 rounded-full"
            />
            <span className="text-[9px] font-semibold leading-none text-muted-foreground">
              P{pull.pity}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export { BannerRecent6Star };
