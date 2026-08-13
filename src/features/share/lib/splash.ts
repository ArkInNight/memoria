import { slugify } from "@/lib/shared";
import splashCatalog from "../../../../assets/splash.json";

export interface SplashFrame {
  src: string;
  focalPoint: { x: number; y: number };
}

/** Splash-art URL for a character, by convention `/images/splash/{slug}.webp`. */
export function splashUrlOf(name: string): string {
  return `/images/splash/${slugify(name)}.webp`;
}

export function splashFrameOf(name: string): SplashFrame {
  const slug = slugify(name);
  const frame = splashCatalog[slug as keyof typeof splashCatalog];
  return {
    src: splashUrlOf(name),
    focalPoint: frame ? { x: frame.x, y: frame.y } : { x: 0.5, y: 0.18 },
  };
}
