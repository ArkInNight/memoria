import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EntityImage } from "@/components/ui/entity-image";
import { Text } from "@/components/typography";
import { formatDateTime } from "@/lib/shared";
import { recentSixStar } from "@/lib/domain/stats";
import type { PullRecord } from "@/lib/shared";

const LIMIT = 20;

function Recent6StarSection({
  pulls,
  charImageByName,
}: {
  pulls: PullRecord[];
  charImageByName: Map<string, string | undefined>;
}) {
  const recent = recentSixStar(pulls, LIMIT);

  return (
    <Card className="shadow-sm h-fit">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Recent 6★</CardTitle>
      </CardHeader>
      <CardContent>
        {recent.length > 0 ? (
          <ul className="flex flex-wrap gap-x-3 gap-y-3">
            {recent.map((pull) => (
              <li
                key={pull.id}
                title={`${pull.name} · ${pull.poolName} · ${formatDateTime(pull.createTime)}`}
                className="flex w-12 flex-col items-center gap-1"
              >
                <EntityImage
                  name={pull.name}
                  imageUrl={charImageByName.get(pull.name)}
                  rarity={6}
                  className="h-9 w-9 rounded-full"
                />
                <span className="text-[10px] font-semibold leading-none text-muted-foreground">
                  P{pull.pity}
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
