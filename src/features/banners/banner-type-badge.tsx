import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const BANNER_TYPE_COLOR: Record<string, string> = {
  debut: "bg-amber-600 text-white",
  rerun: "bg-purple-600 text-white",
  limited: "bg-orange-600 text-white",
  collaboration: "bg-red-600 text-white",
  ripples: "bg-cyan-600 text-white",
  promise: "bg-emerald-600 text-white",
  revelation: "bg-emerald-600 text-white",
  boon: "bg-emerald-600 text-white",
  invitation: "bg-emerald-600 text-white",
  covenant: "bg-emerald-600 text-white",
  snow: "bg-emerald-600 text-white",
  yearning: "bg-emerald-600 text-white",
  beginner: "bg-teal-600 text-white",
  standard: "bg-gray-600 text-white",
};

function BannerTypeBadge({ type, className }: { type?: string | null; className?: string }) {
  const color = BANNER_TYPE_COLOR[type ?? "other"] ?? "bg-blue-600 text-white";
  return <Badge className={cn(color, className)}>{(type ?? "other").replace("-", " ")}</Badge>;
}

export { BannerTypeBadge };
