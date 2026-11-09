import { CodeXml, ExternalLink } from "lucide-react";

const DATA_SOURCES = [
  {
    label: "Prydwen banner history",
    href: "https://www.prydwen.gg/re1999/guides/banner-history-cn",
  },
  {
    label: "Reverse: 1999 Wiki (EN)",
    href: "https://reverse1999.fandom.com/wiki/Reverse:_1999_Wiki",
  },
  {
    label: "Reverse: 1999 Wiki (CN)",
    href: "https://res1999.huijiwiki.com/wiki/%E9%A6%96%E9%A1%B5",
  },
] as const;

const INSPIRATIONS = [
  { label: "Timekeeper", href: "https://timekeeper.top/" },
  { label: "Kornblume", href: "https://windbow27.github.io/kornblume/" },
] as const;

function ExternalLinks({ links }: { links: ReadonlyArray<{ label: string; href: string }> }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-2">
      {links.map((link) => (
        <li key={link.href}>
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-foreground/80 underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            {link.label}
            <ExternalLink aria-hidden="true" size={12} />
          </a>
        </li>
      ))}
    </ul>
  );
}

function AppFooter() {
  return (
    <footer className="mx-auto mb-4 w-[calc(100%-1rem)] max-w-[1600px] rounded-md border border-sidebar-border bg-sidebar p-4 text-sm text-muted-foreground shadow-sm sm:mb-6 sm:w-[85%] sm:p-5">
      <div className="grid gap-5 sm:grid-cols-[auto_1fr_1fr] sm:gap-8">
        <div>
          <p className="mb-2 font-medium text-foreground">Open source</p>
          <a
            href="https://github.com/ArkInNight/memoria"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-foreground/80 underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            <CodeXml aria-hidden="true" size={14} />
            GitHub project
          </a>
        </div>

        <div>
          <p className="mb-2 font-medium text-foreground">Data sources</p>
          <ExternalLinks links={DATA_SOURCES} />
        </div>

        <div>
          <p className="mb-2 font-medium text-foreground">Inspired by</p>
          <ExternalLinks links={INSPIRATIONS} />
        </div>
      </div>
    </footer>
  );
}

export { AppFooter };
