import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EntityImage } from "@/components/ui/entity-image";
import { Text } from "@/components/typography";
import { formatDateTime } from "@/shared";
import { recentSixStar } from "@/core/summon-stats";
import type { SummonRecord } from "@/shared";

const LIMIT = 20;

function Recent6StarSection({
  summons,
  imageUrlOf,
}: {
  summons: SummonRecord[];
  imageUrlOf: (name: string) => string | undefined;
}) {
  const recent = recentSixStar(summons, LIMIT);

  return (
    <Card className="shadow-sm h-fit">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Recent 6★</CardTitle>
      </CardHeader>
      <CardContent>
        {recent.length > 0 ? (
          <ul className="flex flex-wrap gap-x-3 gap-y-3">
            {recent.map((summon) => (
              <li
                key={summon.id}
                title={`${summon.name} · ${summon.poolName} · ${formatDateTime(summon.createTime)}`}
                className="flex w-14 flex-col items-center gap-1 text-center"
              >
                <EntityImage
                  name={summon.name}
                  imageUrl={imageUrlOf(summon.name)}
                  rarity={6}
                  className="h-9 w-9 rounded-full"
                />
                <span className="text-[10px] font-semibold leading-none text-muted-foreground">
                  Pity {summon.pity}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <Text size="sm" variant="muted">
            No 6★ yet.
          </Text>
        )}
      </CardContent>
    </Card>
  );
}

export { Recent6StarSection };
