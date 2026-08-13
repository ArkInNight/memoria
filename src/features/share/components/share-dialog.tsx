import { useMemo, useState } from "react";
import { Copy, Download, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Slider } from "@/components/ui/slider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Field, FieldLabel } from "@/components/ui/field";
import { canShareImageFile } from "../lib/share-capabilities";
import { splashFrameOf } from "../lib/splash";
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

const PREVIEW_SCALE = 0.45;
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
  const [framingOpen, setFramingOpen] = useState(false);
  const [framing, setFraming] = useState<{ x: number; y: number }>(
    () => splashFrameOf(heroes[0]?.name ?? "").focalPoint
  );
  const { cardRef, capturing, download, copy, share } = useShareCard();

  const hero = heroes.find((h) => h.name === heroName) ?? heroes[0];
  const frameKey = hero?.name ? `memoria.share.frame.${hero.name}` : "";
  const defaultFrame = hero ? splashFrameOf(hero.name).focalPoint : { x: 0.5, y: 0.18 };
  const effectiveFraming = useMemo(() => {
    if (!frameKey) return framing;
    const stored = localStorage.getItem(frameKey);
    if (!stored) return framing;
    try {
      return JSON.parse(stored) as { x: number; y: number };
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
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Share Summon Results</DialogTitle>
          <DialogDescription>
            Pick your featured character, then download or share the image.
          </DialogDescription>
        </DialogHeader>

        {heroes.length > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            <Label htmlFor="share-hero" className="shrink-0">
              Featured character
            </Label>
            <Select
              value={hero?.name}
              onValueChange={(value) => setHeroName(value)}
              aria-label="Select featured character"
            >
              <SelectTrigger id="share-hero" className="w-fit">
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
          </div>
        )}

        <Collapsible open={framingOpen} onOpenChange={setFramingOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              Adjust framing
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="flex flex-col gap-3 pt-2">
            <Field>
              <FieldLabel htmlFor="share-frame-x">Horizontal focus</FieldLabel>
              <Slider
                id="share-frame-x"
                min={15}
                max={85}
                step={1}
                value={[Math.round(effectiveFraming.x * 100)]}
                onValueChange={([value]) =>
                  updateFraming({ ...effectiveFraming, x: (value ?? 50) / 100 })
                }
                aria-label="Horizontal focus"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="share-frame-y">Vertical focus</FieldLabel>
              <Slider
                id="share-frame-y"
                min={10}
                max={72}
                step={1}
                value={[Math.round(effectiveFraming.y * 100)]}
                onValueChange={([value]) =>
                  updateFraming({ ...effectiveFraming, y: (value ?? 18) / 100 })
                }
                aria-label="Vertical focus"
              />
            </Field>
            <Button variant="outline" size="sm" onClick={() => updateFraming(defaultFrame)}>
              Reset framing
            </Button>
          </CollapsibleContent>
        </Collapsible>

        <div className="max-h-[62vh] overflow-auto rounded-lg bg-muted/40 p-3">
          <div
            style={{
              width: PREVIEW_WIDTH,
              height: PREVIEW_HEIGHT,
              overflow: "hidden",
              margin: "0 auto",
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

        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={() => copy(filename)} disabled={capturing}>
            {capturing ? <Spinner data-icon="inline-start" /> : <Copy data-icon="inline-start" />}
            Copy
          </Button>
          {canShareImageFile() && (
            <Button variant="outline" onClick={() => share(filename)} disabled={capturing}>
              <Share2 data-icon="inline-start" />
              Share
            </Button>
          )}
          <Button onClick={() => download(filename)} disabled={capturing}>
            {capturing ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <Download data-icon="inline-start" />
            )}
            Download PNG
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { ShareDialog };
