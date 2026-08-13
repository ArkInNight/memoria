import { useMemo, useState } from "react";
import { Copy, Download, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Slider } from "@/components/ui/slider";
import { Field, FieldLabel } from "@/components/ui/field";
import { canShareImageFile } from "../lib/share-capabilities";
import { DEFAULT_SPLASH_FOCAL_POINT } from "../lib/splash";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShareCard, CARD_WIDTH, CARD_HEIGHT } from "./share-card";
import type { ShareCardData, ShareHero } from "../lib/share-card-data";
import { recent6StarOf } from "../lib/share-card-data";
import { useShareCard } from "../hooks/use-share-card";
import type { PullRecord } from "@/lib/shared";

const PREVIEW_SCALE = 0.48;
const PREVIEW_WIDTH = Math.round(CARD_WIDTH * PREVIEW_SCALE);
const PREVIEW_HEIGHT = Math.round(CARD_HEIGHT * PREVIEW_SCALE);

/**
 * Share dialog: hero picker, scaled live preview, and PNG download /
 * clipboard copy / native share actions.
 */
function ShareDialog({
  data,
  heroes,
  pulls,
  filename,
  trigger,
}: {
  data: Omit<ShareCardData, "hero" | "recent">;
  heroes: ShareHero[];
  pulls: PullRecord[];
  filename: string;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [heroName, setHeroName] = useState<string | undefined>(heroes[0]?.name);
  const [framing, setFraming] = useState<{ x: number; y: number }>(DEFAULT_SPLASH_FOCAL_POINT);
  const { cardRef, capturing, download, copy, share } = useShareCard();

  const hero = heroes.find((h) => h.name === heroName) ?? heroes[0];
  const frameKey = hero?.name ? `memoria.share.frame.v3.${hero.name}` : "";
  const defaultFrame = DEFAULT_SPLASH_FOCAL_POINT;
  const effectiveFraming = useMemo(() => {
    if (!frameKey) return framing;
    const stored = localStorage.getItem(frameKey);
    if (!stored) return framing;
    try {
      const parsed = JSON.parse(stored) as { x?: number; y?: number };
      return {
        x: typeof parsed.x === "number" ? parsed.x : framing.x,
        y: typeof parsed.y === "number" ? parsed.y : framing.y,
      };
    } catch {
      return framing;
    }
  }, [frameKey, framing]);
  const recent = useMemo(() => recent6StarOf(pulls, 12), [pulls]);
  const cardData: ShareCardData = {
    ...data,
    hero,
    recent,
  };

  const updateFraming = (next: { x: number; y: number }) => {
    setFraming(next);
    if (frameKey) localStorage.setItem(frameKey, JSON.stringify(next));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Share Summon Results</DialogTitle>
          <DialogDescription>
            Pick your featured character, then download or share the image.
          </DialogDescription>
        </DialogHeader>

        <div className="grid min-h-0 gap-6 md:grid-cols-[minmax(14rem,0.72fr)_minmax(0,1.28fr)]">
          <div className="flex min-w-0 flex-col gap-6 md:border-r md:pr-6">
            {heroes.length > 0 && (
              <Field>
                <Label htmlFor="share-hero">Featured character</Label>
                <Select
                  value={hero?.name}
                  onValueChange={(value) => {
                    setHeroName(value);
                    setFraming(DEFAULT_SPLASH_FOCAL_POINT);
                  }}
                  aria-label="Select featured character"
                >
                  <SelectTrigger id="share-hero" className="w-full">
                    <SelectValue placeholder="Select character" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {heroes.map((h) => (
                        <SelectItem key={h.name} value={h.name}>
                          {h.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            )}

            <div className="flex flex-col gap-5">
              <div>
                <h3 className="font-medium">Image focus</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Reposition the featured character inside the card.
                </p>
              </div>
              <Field>
                <div className="flex items-center justify-between gap-3">
                  <FieldLabel htmlFor="share-frame-x">Horizontal focus</FieldLabel>
                  <span className="tabular-nums text-xs text-muted-foreground">
                    {Math.round(effectiveFraming.x * 100)}%
                  </span>
                </div>
                <Slider
                  id="share-frame-x"
                  min={35}
                  max={65}
                  step={1}
                  value={[Math.round(effectiveFraming.x * 100)]}
                  onValueChange={([value]) =>
                    updateFraming({ ...effectiveFraming, x: (value ?? 50) / 100 })
                  }
                  aria-label="Horizontal focus"
                />
              </Field>
              <Field>
                <div className="flex items-center justify-between gap-3">
                  <FieldLabel htmlFor="share-frame-y">Vertical focus</FieldLabel>
                  <span className="tabular-nums text-xs text-muted-foreground">
                    {Math.round(effectiveFraming.y * 100)}%
                  </span>
                </div>
                <Slider
                  id="share-frame-y"
                  min={20}
                  max={60}
                  step={1}
                  value={[Math.round(effectiveFraming.y * 100)]}
                  onValueChange={([value]) =>
                    updateFraming({ ...effectiveFraming, y: (value ?? 38) / 100 })
                  }
                  aria-label="Vertical focus"
                />
              </Field>
              <Button variant="outline" size="sm" onClick={() => updateFraming(defaultFrame)}>
                Reset framing
              </Button>
            </div>

            <div className="mt-auto grid gap-2 pt-2">
              <Button onClick={() => download(filename)} disabled={capturing}>
                {capturing ? (
                  <Spinner data-icon="inline-start" />
                ) : (
                  <Download data-icon="inline-start" />
                )}
                Download PNG
              </Button>
              <Button variant="outline" onClick={() => copy(filename)} disabled={capturing}>
                {capturing ? (
                  <Spinner data-icon="inline-start" />
                ) : (
                  <Copy data-icon="inline-start" />
                )}
                Copy
              </Button>
              {canShareImageFile() && (
                <Button variant="outline" onClick={() => share(filename)} disabled={capturing}>
                  <Share2 data-icon="inline-start" />
                  Share
                </Button>
              )}
            </div>
          </div>

          <div className="min-w-0 overflow-hidden rounded-lg border bg-muted/40">
            <div className="mb-2 flex items-center justify-between gap-3">
              <Label className="px-3 pt-3">Preview</Label>
              <span className="px-3 pt-3 text-xs text-muted-foreground">1080 × 1350 PNG</span>
            </div>
            <div className="overflow-auto md:max-h-[calc(100vh-11rem)]">
              <div
                style={{
                  width: PREVIEW_WIDTH,
                  height: PREVIEW_HEIGHT,
                  overflow: "hidden",
                  marginLeft: "auto",
                }}
              >
                <div
                  style={{
                    width: CARD_WIDTH,
                    height: CARD_HEIGHT,
                    transform: `scale(${PREVIEW_SCALE})`,
                    transformOrigin: "top left",
                  }}
                >
                  <ShareCard cardRef={cardRef} data={cardData} focalPoint={effectiveFraming} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { ShareDialog };
