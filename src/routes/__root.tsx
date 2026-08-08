import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { LayoutDashboard, History, Archive, Upload, ScrollText, Moon, Sun, Flame, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useActiveProfile, useProfiles, setActive } from "@/lib/store/profiles";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const profiles = useProfiles();
  const activeProfile = useActiveProfile();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark" ||
      (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col h-full shrink-0">
        {/* Logo / Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-wider text-primary">MEMORIA</h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition"
            title="Toggle theme"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {/* Profile switcher */}
        <div className="px-4 pt-4">
          <Select
            value={activeProfile?.id ?? ""}
            onValueChange={(value) => void setActive(value)}
          >
            <SelectTrigger className="w-full">
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
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <Link
            to="/"
            activeProps={{ className: "bg-accent text-accent-foreground" }}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-accent/50 transition"
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/history"
            activeProps={{ className: "bg-accent text-accent-foreground" }}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-accent/50 transition"
          >
            <History size={18} />
            <span>Summon History</span>
          </Link>

          <Link
            to="/banners"
            activeProps={{ className: "bg-accent text-accent-foreground" }}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-accent/50 transition"
          >
            <Archive size={18} />
            <span>Banners Archive</span>
          </Link>

          <Link
            to="/banners/current"
            activeProps={{ className: "bg-accent text-accent-foreground" }}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-accent/50 transition ml-4"
          >
            <Flame size={16} className="text-orange-500" />
            <span>Current Banners</span>
          </Link>

          <Link
            to="/import"
            activeProps={{ className: "bg-accent text-accent-foreground" }}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-accent/50 transition"
          >
            <Upload size={18} />
            <span>Import Summons</span>
          </Link>

          <Link
            to="/import/log"
            activeProps={{ className: "bg-accent text-accent-foreground" }}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-accent/50 transition"
          >
            <ScrollText size={18} />
            <span>Import Log</span>
          </Link>

          <Link
            to="/profiles"
            activeProps={{ className: "bg-accent text-accent-foreground" }}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-accent/50 transition"
          >
            <Users size={18} />
            <span>Profiles</span>
          </Link>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border text-xs text-muted-foreground text-center">
          Memoria v0.2 • Reverse: 1999
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-background">
        <div className="flex-1 overflow-y-auto p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </div>
      </main>

      <Toaster position="top-right" closeButton />
    </div>
  );
}
