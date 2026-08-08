import { Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  History,
  Archive,
  Upload,
  ScrollText,
  Moon,
  Sun,
  Flame,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useActiveProfile, useProfiles, setActive } from "@/lib/store/profiles";

const NAV_ITEMS = [
  { to: "/", icon: <LayoutDashboard size={18} />, label: "Dashboard" },
  { to: "/history", icon: <History size={18} />, label: "Summon History" },
  { to: "/banners", icon: <Archive size={18} />, label: "Banners Archive" },
  { to: "/banners/current", icon: <Flame size={16} />, label: "Current Banners" },
  { to: "/import", icon: <Upload size={18} />, label: "Import Summons" },
  { to: "/import/log", icon: <ScrollText size={18} />, label: "Import Log" },
  { to: "/profiles", icon: <Users size={18} />, label: "Profiles" },
];

function NavLink({
  to,
  icon,
  label,
  className,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <Link
      to={to}
      activeProps={{ className: "bg-primary/20 text-[#e0a05a]" }}
      className={cn(
        "flex shrink-0 items-center gap-2 rounded-sm px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-white/[0.04] hover:text-foreground",
        className
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

function TopNav({
  darkMode,
  onToggleTheme,
}: {
  darkMode: boolean;
  onToggleTheme: () => void;
}) {
  const profiles = useProfiles();
  const activeProfile = useActiveProfile();

  return (
    <header className="relative z-10 flex h-16 shrink-0 items-center gap-4 border-b border-sidebar-border bg-sidebar px-4 sm:px-6">
      <Link to="/" className="flex shrink-0 items-center gap-2">
        <Flame size={20} className="text-primary" />
        <span className="text-lg font-bold tracking-[0.25em] text-primary">MEMORIA</span>
      </Link>

      <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
          />
        ))}
      </nav>

      <Select
        value={activeProfile?.id ?? ""}
        onValueChange={(value) => void setActive(value)}
      >
        <SelectTrigger className="w-44 shrink-0 border-sidebar-border bg-white/[0.02]">
          <SelectValue placeholder="Pilih profile" />
        </SelectTrigger>
        <SelectContent>
          {profiles.map((profile) => (
            <SelectItem key={profile.id} value={profile.id}>
              {profile.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <button
        onClick={onToggleTheme}
        className="shrink-0 rounded-sm p-2 text-muted-foreground transition hover:bg-white/[0.04] hover:text-foreground"
        title="Toggle theme"
      >
        {darkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </header>
  );
}

export { TopNav };
