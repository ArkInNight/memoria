import { useState } from "react";
import {
  HelpCircle,
  Terminal,
  Gamepad2,
  ClipboardPaste,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Clock,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Strong } from "@/components/typography";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface StepScreenshotProps {
  primarySrc: string;
  fallbackSrc?: string;
  alt: string;
  stepNumber: number;
  label: string;
  expectedFile: string;
}

function StepScreenshot({
  primarySrc,
  fallbackSrc,
  alt,
  stepNumber,
  label,
  expectedFile,
}: StepScreenshotProps) {
  const [currentSrc, setCurrentSrc] = useState<string | null>(primarySrc);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (currentSrc === primarySrc && fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    } else {
      setHasError(true);
      setCurrentSrc(null);
    }
  };

  if (currentSrc && !hasError) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted/40 shadow-xs">
        <img
          src={currentSrc}
          alt={alt}
          onError={handleError}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute bottom-1.5 left-1.5 rounded-sm bg-black/75 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-xs">
          Step {stepNumber}
        </div>
      </div>
    );
  }

  // Graceful mockup placeholder when user hasn't added the screenshot file yet
  return (
    <div
      className={cn(
        "group relative flex aspect-video w-full flex-col items-center justify-center gap-1.5 overflow-hidden rounded-lg border-2 border-dashed border-border/80 bg-muted/20 p-3 text-center transition-colors",
        "hover:border-primary/50 hover:bg-muted/30"
      )}
      role="img"
      aria-label={label}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
        <ImageIcon size={16} />
      </div>
      <span className="text-xs font-semibold text-foreground/90">{label}</span>
      <span className="text-[10px] text-muted-foreground line-clamp-1">
        Save file to{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-foreground/80">{expectedFile}</code>
      </span>
      <div className="absolute top-1.5 left-1.5">
        <Badge variant="outline" className="h-5 px-1.5 text-[9px]">
          Step {stepNumber} Mockup
        </Badge>
      </div>
    </div>
  );
}

export function ImportInstructions({ targetProfileName }: { targetProfileName: string }) {
  const [isOpen, setIsOpen] = useState(true);
  const [os, setOs] = useState<"windows" | "linux">("windows");
  const [copied, setCopied] = useState(false);

  const windowsCommand =
    "irm https://raw.githubusercontent.com/ArkInNight/marconi/main/scripts/get.ps1 | iex";
  const linuxCommand =
    "curl -fsSL https://raw.githubusercontent.com/ArkInNight/marconi/main/scripts/get.sh | sh";

  const activeCommand = os === "windows" ? windowsCommand : linuxCommand;

  const handleCopyCommand = async (command: string) => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      toast.success("Command copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy command");
    }
  };

  return (
    <Card className="relative overflow-hidden border border-border bg-card shadow-sm">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary">
            <HelpCircle size={16} />
          </span>
          <div>
            <CardTitle className="text-base font-bold text-foreground">
              Import Tutorial & Guide
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Follow these 3 simple steps to capture and archive your summons from Reverse: 1999.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="px-2.5 py-1 text-xs font-normal">
            Target profile: <Strong className="ml-1 text-primary">{targetProfileName}</Strong>
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="h-8 gap-1 text-xs"
          >
            {isOpen ? (
              <>
                Hide Guide <ChevronUp size={14} />
              </>
            ) : (
              <>
                Show Guide <ChevronDown size={14} />
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleContent>
          <CardContent className="flex flex-col gap-6 pt-1">
            {/* 3 Step Cards Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Step 1 */}
              <div className="flex flex-col gap-3 rounded-xl border border-border bg-card/60 p-4 transition hover:border-border/80 hover:shadow-xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      1
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      In-Game Setup
                    </span>
                  </div>
                  <Gamepad2 size={16} className="text-muted-foreground" />
                </div>

                <StepScreenshot
                  primarySrc="/images/tutorial/step-1.webp"
                  fallbackSrc="/images/tutorial/step-1.png"
                  alt="Open Summon Review screen in Reverse: 1999"
                  stepNumber={1}
                  label="Summon Review in Reverse: 1999"
                  expectedFile="public/images/tutorial/step-1.webp"
                />

                <div className="flex flex-col gap-1 text-xs">
                  <h3 className="font-semibold text-foreground">Open Summon Review</h3>
                  <p className="leading-relaxed text-muted-foreground">
                    Launch Reverse: 1999 on PC. Go to the <Strong>Summon</Strong> screen and click
                    the <Strong>Summon Review</Strong> (history) icon at the bottom left. Keep the
                    game running.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col gap-3 rounded-xl border border-border bg-card/60 p-4 transition hover:border-border/80 hover:shadow-xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      2
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Capture URL
                    </span>
                  </div>
                  <Terminal size={16} className="text-muted-foreground" />
                </div>

                <StepScreenshot
                  primarySrc="/images/tutorial/step-2.webp"
                  fallbackSrc="/images/tutorial/step-2.png"
                  alt="Run Marconi Link Grabber command in terminal"
                  stepNumber={2}
                  label="Run Marconi Link Grabber"
                  expectedFile="public/images/tutorial/step-2.webp"
                />

                <div className="flex flex-col gap-2 text-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">Run Marconi (Link Grabber)</h3>
                    {/* OS Toggle */}
                    <div className="flex rounded-md bg-muted/60 p-0.5 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setOs("windows")}
                        className={cn(
                          "rounded-sm px-1.5 py-0.5 font-medium transition",
                          os === "windows"
                            ? "bg-background text-foreground shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        Windows
                      </button>
                      <button
                        type="button"
                        onClick={() => setOs("linux")}
                        className={cn(
                          "rounded-sm px-1.5 py-0.5 font-medium transition",
                          os === "linux"
                            ? "bg-background text-foreground shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        Linux
                      </button>
                    </div>
                  </div>

                  <p className="leading-relaxed text-muted-foreground">
                    Open {os === "windows" ? "PowerShell" : "Terminal"} and run this one-liner
                    command:
                  </p>

                  <div className="group relative flex items-center rounded-md border border-border bg-muted/60 p-2 font-mono text-[11px]">
                    <span className="truncate pr-7 text-foreground/90 select-all">
                      {activeCommand}
                    </span>
                    <button
                      type="button"
                      onClick={() => void handleCopyCommand(activeCommand)}
                      title="Copy command"
                      className="absolute right-1.5 rounded-sm p-1 text-muted-foreground hover:bg-background hover:text-foreground transition"
                    >
                      {copied ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                    </button>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    Marconi automatically finds the game, grabs the URL, and copies it to your
                    clipboard.
                  </span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col gap-3 rounded-xl border border-border bg-card/60 p-4 transition hover:border-border/80 hover:shadow-xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      3
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Import to Archive
                    </span>
                  </div>
                  <ClipboardPaste size={16} className="text-muted-foreground" />
                </div>

                <StepScreenshot
                  primarySrc="/images/tutorial/step-3.webp"
                  fallbackSrc="/images/tutorial/step-3.png"
                  alt="Paste URL and click Import Summon Logs in Memoria"
                  stepNumber={3}
                  label="Paste URL & Click Import"
                  expectedFile="public/images/tutorial/step-3.webp"
                />

                <div className="flex flex-col gap-1 text-xs">
                  <h3 className="font-semibold text-foreground">Paste URL & Click Import</h3>
                  <p className="leading-relaxed text-muted-foreground">
                    Return here, paste the URL into the <Strong>Link Grabber URL</Strong> field
                    below, and click <Strong>Import Summon Logs</Strong>. Your summons are
                    permanently archived in your browser.
                  </p>
                </div>
              </div>
            </div>

            {/* Helpful Notes & Fallbacks Alert Box */}
            <div className="rounded-xl border border-border/80 bg-muted/30 p-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Note 1: Expiry */}
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
                    <Clock size={14} />
                  </div>
                  <div className="flex flex-col gap-0.5 text-xs">
                    <span className="font-semibold text-foreground">Token Expiry (~5 Minutes)</span>
                    <p className="text-muted-foreground leading-relaxed">
                      Reverse: 1999 summon tokens expire after ~290 seconds. If you see an expired
                      error or <code>code: -6</code>, close and reopen Summon Review in-game, then
                      run Marconi again.
                    </p>
                  </div>
                </div>

                {/* Note 2: Direct JSON mode & Privacy */}
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <Sparkles size={14} />
                  </div>
                  <div className="flex flex-col gap-0.5 text-xs">
                    <span className="font-semibold text-foreground">
                      Direct JSON Mode (Bypass Expiry)
                    </span>
                    <p className="text-muted-foreground leading-relaxed">
                      To skip token expiry completely, run{" "}
                      <code className="rounded bg-muted px-1 py-0.5 text-[11px]">
                        marconi --json &gt; history.json
                      </code>
                      , then paste the file contents into the <Strong>Raw JSON</Strong> tab.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
