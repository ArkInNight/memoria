import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { server } from "@/api/client";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, HelpCircle, CheckCircle, AlertTriangle, RefreshCw, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import type { ImportResult } from "@memoria/shared";

export const Route = createFileRoute("/import/")({
  component: ImportIndexPage,
});

function ImportIndexPage() {
  const queryClient = useQueryClient();
  const [url, setUrl] = useState("");
  const [jsonText, setJsonText] = useState("");
  const [activeTab, setActiveTab] = useState("url");

  const mutation = useMutation<ImportResult, Error, { url?: string; json?: string }>({
    mutationFn: async (payload) => {
      const res = await server.api.import.post(payload);
      if (res.error) {
        throw new Error(res.error.value.message);
      }
      return res.data as ImportResult;
    },
    onSuccess: (data) => {
      // Invalidate queries to refresh stats and history
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["summons"] });
      queryClient.invalidateQueries({ queryKey: ["import-log"] });

      toast.success("Import successful!", {
        description: `Imported ${data.importedCount} new pulls. Skipped ${data.duplicateCount} duplicates.`,
      });

      // Clear fields on success
      setUrl("");
      setJsonText("");
    },
    onError: (err) => {
      toast.error("Import failed", {
        description: err.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "url") {
      if (!url.trim()) {
        toast.error("Please enter a link first.");
        return;
      }
      mutation.mutate({ url: url.trim() });
    } else {
      if (!jsonText.trim()) {
        toast.error("Please enter JSON data first.");
        return;
      }
      mutation.mutate({ json: jsonText.trim() });
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Import Summons</h2>
        <p className="text-muted-foreground mt-1">Permanently archive your summon history from the game.</p>
      </div>

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
                      disabled={mutation.isPending}
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
                      disabled={mutation.isPending}
                      className="font-mono text-xs"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              {mutation.isSuccess && mutation.data && (
                <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle className="font-semibold">Import Complete</AlertTitle>
                  <AlertDescription className="text-xs mt-1">
                    Successfully merged <strong>{mutation.data.importedCount}</strong> new pulls.{" "}
                    Skipped {mutation.data.duplicateCount} duplicates.
                  </AlertDescription>
                </Alert>
              )}

              {mutation.isError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="font-semibold">Import Error</AlertTitle>
                  <AlertDescription className="text-xs mt-1">
                    {mutation.error.message}
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
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? (
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
    </div>
  );
}
