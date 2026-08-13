import { cn } from "@/lib/utils";
import { rarityStyle } from "@/lib/shared";

interface EntityImageProps {
  name: string;
  imageUrl?: string;
  rarity?: number;
  variant?: "portrait" | "banner";
  className?: string;
}

export function EntityImage({
  name,
  imageUrl,
  rarity,
  variant = "portrait",
  className,
}: EntityImageProps) {
  if (imageUrl) {
    return (
      <img src={imageUrl} alt={name} loading="lazy" className={cn("object-cover", className)} />
    );
  }

  const initial = name.trim().charAt(0).toUpperCase() || "?";
  const gradient = rarityStyle(rarity).gradient;

  if (variant === "banner") {
    return (
      <div
        className={cn(
          "relative overflow-hidden bg-gradient-to-br from-slate-800 via-indigo-950 to-slate-950",
          className
        )}
        role="img"
        aria-label={name}
      >
        <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-primary/25 blur-2xl" />
        <div className="absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 font-black tracking-tighter text-white/20 text-7xl select-none">
          M
        </div>
        <div className="relative flex h-full flex-col justify-end p-4">
          <span className="text-white text-lg font-bold leading-tight drop-shadow-md line-clamp-2">
            {name}
          </span>
          <span className="mt-1 text-[10px] uppercase tracking-widest text-white/50">
            Reverse: 1999
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-gradient-to-br",
        gradient,
        className
      )}
      role="img"
      aria-label={name}
    >
      <span className="text-white text-2xl font-extrabold drop-shadow-md">{initial}</span>
      {rarity != null && (
        <span className="absolute bottom-0.5 right-1 text-[10px] font-bold text-white/90 drop-shadow">
          {rarity}★
        </span>
      )}
    </div>
  );
}
