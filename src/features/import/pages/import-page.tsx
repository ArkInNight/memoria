import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Upload,
  HelpCircle,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  ClipboardList,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { importPulls } from "@/lib/domain/importSummons";
import type { RawPull } from "@/lib/domain/summonParser";
import { extractPageData } from "@/lib/domain/extractPageData";
import { useActiveProfile } from "@/lib/store/profiles";
import { YStack, XStack } from "@/components/layout/stack";
import { Grid } from "@/components/layout/grid";
import { Text, Strong } from "@/components/typography";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Form } from "@/components/form";

const PROXY_URL = import.meta.env.VITE_PROXY_URL || "/api/proxy";

export function ImportPage() {
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
    <YStack gap={24} className="max-w-3xl">
      <PageHeader
        title="Import Summons"
        description="Permanently archive your summon history from the game."
      />

      {!profile ? (
        <EmptyState
          icon={<UserPlus className="h-7 w-7 text-primary" />}
          title="Belum ada profile"
          description="Data summon diimport ke dalam profile akun game. Buat profile dulu sebelum import."
          action={
            <Button asChild>
              <Link to="/profiles">Buat Profile</Link>
            </Button>
          }
        />
      ) : (
        <Grid md={3}>
          {/* Instructions Panel */}
          <Card className="md:col-span-1 shadow-sm h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <HelpCircle size={16} className="text-primary" />
                How to Import
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-3 text-muted-foreground leading-relaxed">
              <Text size="xs" variant="muted" as="p">
                1. Open Reverse: 1999 and go to the <Strong>Summon History</Strong> screen.
              </Text>
              <Text size="xs" variant="muted" as="p">
                2. Run the <Strong>Link Grabber</Strong> script to extract the authentication URL.
              </Text>
              <Text size="xs" variant="muted" as="p">
                3. Copy the URL and paste it in the <Strong>Link tab</Strong>.
              </Text>
              <Text size="xs" variant="muted" as="p">
                4. If the link fails due to timeout or expiry, open the link in a browser, copy the
                full JSON response, and paste it in the <Strong>Raw JSON tab</Strong>.
              </Text>
              <Text
                size="xs"
                className="border-t border-border pt-3"
                as="p"
                style={{ color: "rgba(144, 75, 16, 0.8)" }}
              >
                Target profile: <Strong>{profile.name}</Strong>
              </Text>
            </CardContent>
          </Card>

          {/* Action Panel */}
          <Card className="md:col-span-2 shadow-sm">
            <CardContent className="pt-6">
              <Form onSubmit={handleSubmit}>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="url">Link URL</TabsTrigger>
                    <TabsTrigger value="json">Raw JSON</TabsTrigger>
                  </TabsList>

                  <TabsContent value="url" className="space-y-4">
                    <YStack gap={8}>
                      <Label className="text-sm font-medium">Link Grabber URL</Label>
                      <Input
                        placeholder="https://reverse1999-game-api.com/querySummon?..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        disabled={isPending}
                      />
                    </YStack>
                  </TabsContent>

                  <TabsContent value="json" className="space-y-4">
                    <YStack gap={8}>
                      <Label className="text-sm font-medium">Raw JSON Response</Label>
                      <Textarea
                        placeholder='{ "code": 200, "data": { "pageData": [...] } }'
                        rows={8}
                        value={jsonText}
                        onChange={(e) => setJsonText(e.target.value)}
                        disabled={isPending}
                        className="font-mono text-xs"
                      />
                    </YStack>
                  </TabsContent>
                </Tabs>

                {result && (
                  <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle className="font-semibold">Import Complete</AlertTitle>
                    <AlertDescription className="text-xs mt-1">
                      Successfully merged <Strong>{result.importedCount}</Strong> new pulls. Skipped{" "}
                      {result.duplicateCount} duplicates.
                    </AlertDescription>
                  </Alert>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle className="font-semibold">Import Error</AlertTitle>
                    <AlertDescription className="text-xs mt-1">{error}</AlertDescription>
                  </Alert>
                )}

                <XStack gap={16} className="flex-col md:flex-row md:items-center justify-between">
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
                </XStack>
              </Form>
            </CardContent>
          </Card>
        </Grid>
      )}
    </YStack>
  );
}
