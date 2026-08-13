import { Pie, PieChart } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { RARITY_ORDER, rarityStyle } from "@/lib/shared";
import { Empty, EmptyDescription, EmptyHeader } from "@/components/ui/empty";

interface Slice {
  rarity: number;
  name: string;
  value: number;
  fill: string;
}

function RarityPieChart({ data }: { data: { rarity: number; count: number }[] }) {
  const slices: Slice[] = RARITY_ORDER.reduce<Slice[]>((result, rarity) => {
    const item = data.find((d) => d.rarity === rarity);

    if (item?.count) {
      result.push({
        rarity,
        name: `${rarity} Star`,
        value: item.count,
        fill: rarityStyle(rarity).hex,
      });
    }

    return result;
  }, []);
  const chartConfig: ChartConfig = Object.fromEntries(
    slices.map((slice) => [
      slice.name,
      {
        label: slice.name,
        color: slice.fill,
      },
    ])
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rarity</CardTitle>
      </CardHeader>

      <CardContent>
        {slices.length > 0 ? (
          <ChartContainer config={chartConfig}>
            <PieChart>
              <Pie data={slices} dataKey="value" nameKey="name" strokeWidth={2} />

              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent nameKey="name" />} />
            </PieChart>
          </ChartContainer>
        ) : (
          <Empty className="min-h-50 p-0">
            <EmptyHeader>
              <EmptyDescription>No summon data yet.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  );
}

export { RarityPieChart };
