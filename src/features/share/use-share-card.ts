import { useCallback, useRef, useState } from "react";
import { toBlob } from "html-to-image";
import { toast } from "sonner";

import { CARD_WIDTH, CARD_HEIGHT } from "./share-card";
import { canShareImageFile } from "./share-capabilities";

async function waitForImages(node: HTMLElement): Promise<void> {
  const images = [...node.querySelectorAll("img")];
  await Promise.all(
    images.map(async (image) => {
      if (!image.complete) {
        await new Promise<void>((resolve) => {
          image.addEventListener("load", () => resolve(), { once: true });
          image.addEventListener("error", () => resolve(), { once: true });
        });
      }
      if (image.complete && image.naturalWidth > 0) {
        await image.decode().catch(() => undefined);
      }
    })
  );
}

/**
 * Captures the rendered share card to a PNG and hands it off to the
 * browser's download, clipboard, or native share. Falls back to download
 * when a capability is unsupported.
 */
export function useShareCard() {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const inFlightRef = useRef(false);
  const [capturing, setCapturing] = useState(false);

  const runWithCapture = useCallback(async (action: (blob: Blob) => Promise<void> | void) => {
    if (inFlightRef.current) return;
    const node = cardRef.current;
    if (!node) return;

    inFlightRef.current = true;
    setCapturing(true);
    try {
      await waitForImages(node);
      const blob = await toBlob(node, { width: CARD_WIDTH, height: CARD_HEIGHT, pixelRatio: 1 });
      if (!blob) throw new Error("Image capture returned no data.");
      await action(blob);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate image");
    } finally {
      inFlightRef.current = false;
      setCapturing(false);
    }
  }, []);

  const downloadBlob = useCallback((blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }, []);

  const download = useCallback(
    async (filename: string) => {
      await runWithCapture((blob) => {
        downloadBlob(blob, filename);
        toast.success("Image downloaded");
      });
    },
    [downloadBlob, runWithCapture]
  );

  const copy = useCallback(
    async (filename: string) => {
      await runWithCapture(async (blob) => {
        try {
          await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
          toast.success("Image copied to clipboard");
        } catch {
          downloadBlob(blob, filename);
          toast.info("Clipboard not supported — image downloaded instead");
        }
      });
    },
    [downloadBlob, runWithCapture]
  );

  const share = useCallback(
    async (filename: string) => {
      await runWithCapture(async (blob) => {
        if (!canShareImageFile()) throw new Error("Native image sharing is unavailable.");
        const file = new File([blob], filename, { type: "image/png" });
        try {
          await navigator.share({ files: [file], title: "Memoria — Summon Archive" });
        } catch (error) {
          if ((error as DOMException).name !== "AbortError") throw error;
        }
      });
    },
    [runWithCapture]
  );

  return { cardRef, capturing, download, copy, share };
}
