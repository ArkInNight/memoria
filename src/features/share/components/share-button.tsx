import { Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { slugify } from "@/lib/shared";
import { nowString } from "@/lib/shared";
import { ShareDialog } from "./share-dialog";
import type { ShareCardData, ShareHero } from "../lib/share-card-data";
import type { PullRecord } from "@/lib/shared";

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
  pulls,
  filename,
  variant = "outline",
}: {
  data: Omit<ShareCardData, "hero" | "recent">;
  heroes: ShareHero[];
  pulls: PullRecord[];
  filename: string;
  variant?: "outline" | "default" | "ghost" | "secondary";
}) {
  return (
    <ShareDialog
      data={data}
      heroes={heroes}
      pulls={pulls}
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
