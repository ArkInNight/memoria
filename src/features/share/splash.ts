import { slugify } from "@/shared";

export interface SplashFrame {
  src: string;
  focalPoint: { x: number; y: number };
}

export const DEFAULT_SPLASH_FOCAL_POINT = { x: 0.5, y: 0.38 } as const;

/** Splash-art URL for a character, by convention `/images/splash/{slug}.webp`. */
export function splashUrlOf(name: string): string {
  return `/images/splash/${slugify(name)}.webp`;
}

export function splashFrameOf(name: string): SplashFrame {
  return {
    src: splashUrlOf(name),
    focalPoint: DEFAULT_SPLASH_FOCAL_POINT,
  };
}
