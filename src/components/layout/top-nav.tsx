import { Link } from "@tanstack/react-router";
import { LayoutDashboard, Archive, Upload, Moon, Sun, Flame, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { profileStore } from "@/stores/profile-store";
import { Button } from "../ui/button";

const NAV_ITEMS = [
  { to: "/", icon: <LayoutDashboard size={18} />, label: "Dashboard" },
  { to: "/banners", icon: <Archive size={18} />, label: "Banners Archive" },
  { to: "/import", icon: <Upload size={18} />, label: "Import Summons" },
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
      aria-label={label}
      title={label}
      activeProps={{ className: "bg-primary/15 text-primary" }}
      className={cn(
        "flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-sm px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground sm:min-h-0 sm:justify-start",
        className
      )}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}

function TopNav({ darkMode, onToggleTheme }: { darkMode: boolean; onToggleTheme: () => void }) {
  const profiles = profileStore.useProfiles();
  const activeProfile = profileStore.useActiveProfile();

  return (
    <header className="relative z-10 grid shrink-0 grid-cols-[1fr_auto_auto] items-center gap-x-2 gap-y-1 border-b border-sidebar-border bg-sidebar px-3 py-2 sm:flex sm:h-16 sm:gap-4 sm:px-6 sm:py-0">
      <Link to="/" className="flex min-h-11 shrink-0 items-center gap-2">
        <Flame size={20} className="text-primary" />
        <span className="text-base font-bold tracking-[0.18em] text-primary sm:text-lg sm:tracking-[0.25em]">
          MEMORIA
        </span>
      </Link>

      <nav className="order-last col-span-3 flex w-full items-center justify-center gap-1 sm:order-none sm:col-span-1 sm:flex-1 sm:justify-start sm:overflow-x-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} icon={item.icon} label={item.label} />
        ))}
      </nav>

      <Select
        value={activeProfile?.id ?? ""}
        onValueChange={(value) => void profileStore.setActive(value)}
      >
        <SelectTrigger aria-label="Active profile" className="w-32 sm:w-44">
          <SelectValue placeholder="Select profile" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {profiles.map((profile) => (
              <SelectItem key={profile.id} value={profile.id}>
                {profile.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Button
        onClick={onToggleTheme}
        variant="ghost"
        size="icon"
        aria-label={darkMode ? "Use light theme" : "Use dark theme"}
        title={darkMode ? "Use light theme" : "Use dark theme"}
      >
        {darkMode ? <Sun size={18} /> : <Moon size={18} />}
      </Button>
    </header>
  );
}

export { TopNav };
