import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, HelpCircle, CheckCircle, AlertTriangle, RefreshCw, ClipboardList, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { importPulls } from "@/lib/domain/importSummons";
import type { RawPull } from "@/lib/domain/summonParser";
import { extractPageData } from "@/lib/domain/extractPageData";
import { useActiveProfile } from "@/lib/store/profiles";

export const Route = createFileRoute("/import/")({
  component: ImportIndexPage,
});

const PROXY_URL = import.meta.env.VITE_PROXY_URL || "/api/proxy";

function ImportIndexPage() {
  const profile = useActiveProfile();
  const [url, setUrl] = useState("");
  const [jsonText, setJsonText] = useState("");
  const [activeTab, setActiveTab] = useState("url");
  const [isPending, setIsPending] = useState(false);
  const [result, setResult] = useState<{ importedCount: number; duplicateCount: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    setError(null);

    if (!profile) {
      toast.error("Buat profile dulu sebelum import.");
      return;
    }

    const parseSource = async (): Promise<RawPull[]> => {
      if (activeTab === "url") {
        if (!url.trim()) throw new Error("Please enter a link first.");
        const res = await fetch(PROXY_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: url.trim() }),
        });
        const body = await res.json();
        if (!res.ok) {
          throw new Error(body?.error || `Gagal fetch URL (HTTP ${res.status}). Token mungkin kedaluwarsa.`);
        }
        const parsed = Array.isArray(body) ? (body as RawPull[]) : extractPageData(body);
        if (!parsed) throw new Error("Struktur data tidak valid (tidak ada pageData).");
        return parsed;
      }
      if (!jsonText.trim()) throw new Error("Please enter JSON data first.");
      const parsed = extractPageData(JSON.parse(jsonText.trim()));
      if (!parsed) {
        throw new Error("Struktur JSON tidak valid. Harus berisi pageData array atau array mentah.");
      }
      return parsed;
    };

    let pageData: RawPull[];
    try {
      pageData = await parseSource();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan saat memproses data.";
      setError(message);
      toast.error("Import failed", { description: message });
      return;
    }

    setIsPending(true);
    try {
      const res = await importPulls(profile.id, pageData);
      setResult({ importedCount: res.importedCount, duplicateCount: res.duplicateCount });
      toast.success("Import successful!", {
        description: `Imported ${res.importedCount} new pulls. Skipped ${res.duplicateCount} duplicates.`,
      });
      setUrl("");
      setJsonText("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal import.";
      setError(message);
      toast.error("Import failed", { description: message });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Import Summons</h2>
        <p className="text-muted-foreground mt-1">Permanently archive your summon history from the game.</p>
      </div>

      {!profile ? (
        <Card className="p-12 text-center space-y-4">
          <div className="mx-auto w-14 h-14 rounded-full bg-muted flex items-center justify-center">
            <UserPlus className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Belum ada profile</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              Data summon diimport ke dalam profile akun game. Buat profile dulu sebelum import.
            </p>
          </div>
          <Button asChild>
            <Link to="/profiles">Buat Profile</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Instructions Panel */}
          <Card className="md:col-span-1 shadow-sm h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <HelpCircle size={16} className="text-primary" />
                How to Import
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-3 text-muted-foreground leading-relaxed">
              <p>
                1. Open Reverse: 1999 and go to the <strong>Summon History</strong> screen.
              </p>
              <p>
                2. Run the <strong>Link Grabber</strong> script to extract the authentication URL.
              </p>
              <p>
                3. Copy the URL and paste it in the <strong>Link tab</strong>.
              </p>
              <p>
                4. If the link fails due to timeout or expiry, open the link in a browser, copy the full JSON response, and paste it in the <strong>Raw JSON tab</strong>.
              </p>
              <p className="border-t border-border pt-3 text-primary/80">
                Target profile: <strong>{profile.name}</strong>
              </p>
            </CardContent>
          </Card>

          {/* Action Panel */}
          <Card className="md:col-span-2 shadow-sm">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="url">Link URL</TabsTrigger>
                    <TabsTrigger value="json">Raw JSON</TabsTrigger>
                  </TabsList>

                  <TabsContent value="url" className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Link Grabber URL</label>
                      <Input
                        placeholder="https://reverse1999-game-api.com/querySummon?..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        disabled={isPending}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="json" className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Raw JSON Response</label>
                      <Textarea
                        placeholder='{ "code": 200, "data": { "pageData": [...] } }'
                        rows={8}
                        value={jsonText}
                        onChange={(e) => setJsonText(e.target.value)}
                        disabled={isPending}
                        className="font-mono text-xs"
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                {result && (
                  <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle className="font-semibold">Import Complete</AlertTitle>
                    <AlertDescription className="text-xs mt-1">
                      Successfully merged <strong>{result.importedCount}</strong> new pulls. Skipped{" "}
                      {result.duplicateCount} duplicates.
                    </AlertDescription>
                  </Alert>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle className="font-semibold">Import Error</AlertTitle>
                    <AlertDescription className="text-xs mt-1">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <Button asChild variant="outline" size="sm">
                    <Link to="/import/log">
                      <ClipboardList className="mr-2 h-4 w-4" />
                      View Import Log
                    </Link>
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Parsing & Merging...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Import Summon Logs
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
