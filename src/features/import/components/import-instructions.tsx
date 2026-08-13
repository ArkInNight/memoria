import { HelpCircle } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Text, Strong } from "@/components/typography";

function ImportInstructions({ targetProfileName }: { targetProfileName: string }) {
  return (
    <Card className="md:col-span-1 shadow-sm h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold flex items-center gap-1.5">
          <HelpCircle size={16} className="text-primary" />
          How to Import
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-xs leading-relaxed text-muted-foreground">
        <Text size="xs" variant="muted" as="p">
          1. Open Reverse: 1999 and go to the <Strong>Summon History</Strong> screen.
        </Text>
        <Text size="xs" variant="muted" as="p">
          2. Run the <Strong>Link Grabber</Strong> script to extract the authentication URL.
        </Text>
        <Text size="xs" variant="muted" as="p">
          3. Copy the URL and paste it in the <Strong>Link URL tab</Strong>.
        </Text>
        <Text size="xs" variant="muted" as="p">
          4. If the link fails due to timeout or expiry, open the link in a browser, copy the full
          JSON response, and paste it in the <Strong>Raw JSON tab</Strong>.
        </Text>
        <Separator />
        <Text size="xs" as="p" className="text-primary/80">
          Target profile: <Strong>{targetProfileName}</Strong>
        </Text>
      </CardContent>
    </Card>
  );
}

export { ImportInstructions };
