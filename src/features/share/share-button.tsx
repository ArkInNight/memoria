import { Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { slugify, nowString } from "@/shared";
import { ShareDialog } from "./share-dialog";
import type { ShareCardData, ShareHero } from "./share-card-data";
import type { SummonRecord } from "@/shared";

function shareFilename(prefix: string): string {
  const date = nowString().slice(0, 10);
  return `memoria-${slugify(prefix)}-${date}.png`;
}

/**
 * Share card trigger rendered in page headers. Opens a dialog with the
 * poster preview, hero picker, and PNG actions.
 */
function ShareButton({
  data,
  heroes,
  summons,
  filename,
  variant = "outline",
}: {
  data: Omit<ShareCardData, "hero" | "recent">;
  heroes: ShareHero[];
  summons: SummonRecord[];
  filename: string;
  variant?: "outline" | "default" | "ghost" | "secondary";
}) {
  return (
    <ShareDialog
      data={data}
      heroes={heroes}
      summons={summons}
      filename={shareFilename(filename)}
      trigger={
        <Button variant={variant} className="max-sm:min-h-11">
          <Share2 data-icon="inline-start" />
          Share
        </Button>
      }
    />
  );
}

export { ShareButton, shareFilename };
