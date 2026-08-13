import { Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { AppShell, Main } from "@/components/layout/app-shell";
import { Container } from "@/components/layout/container";
import { BackgroundArt } from "@/components/layout/background-art";
import { TopNav } from "@/components/layout/top-nav";

export function RootLayout() {
  const [darkMode, setDarkMode] = useState(() => {
    return (
      localStorage.getItem("theme") === "dark" ||
      (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
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
    <AppShell>
      <BackgroundArt darkMode={darkMode} />

      {/* Top nav — solid bg-nav over art; header + art stay put on scroll */}
      <TopNav darkMode={darkMode} onToggleTheme={() => setDarkMode(!darkMode)} />

      {/* Centered content shell — frosted glass, art visible on both sides.
          Whole page scrolls; shell grows with content. */}
      <Main>
        <Container>
          <Outlet />
        </Container>
      </Main>

      <Toaster position="top-right" closeButton />
    </AppShell>
  );
}
