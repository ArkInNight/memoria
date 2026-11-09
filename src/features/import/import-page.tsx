import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, DownloadCloud } from "lucide-react";
import { profileStore } from "@/stores/profile-store";
import { YStack } from "@/components/layout/stack";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { ManualInputTab } from "./manual-input-tab";
import { UrlImportTab } from "./url-import-tab";
import { JsonImportTab } from "./json-import-tab";
import { ImportInstructions } from "./import-instructions";
import { ImportLogSection } from "./import-log-section";

export function ImportPage() {
  const profile = profileStore.useActiveProfile();
  const [activeTab, setActiveTab] = useState("url");

  return (
    <YStack gap={24}>
      <PageHeader
        title="Import Summons"
        description="Permanently archive your summon history from the game."
      />

      {!profile ? (
        <EmptyState
          icon={<UserPlus className="h-7 w-7 text-primary" />}
          title="No profile yet"
          description="Summon data is imported into a game account profile. Create a profile before importing."
          action={
            <Button asChild>
              <Link to="/profiles">Create Profile</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
          <ImportInstructions targetProfileName={profile.name} />

          <Card className="md:col-span-1 lg:col-span-2 shadow-sm h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <DownloadCloud size={16} className="text-primary" />
                Import Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-6 grid w-full grid-cols-3">
                  <TabsTrigger value="url">Link URL</TabsTrigger>
                  <TabsTrigger value="json">Raw JSON</TabsTrigger>
                  <TabsTrigger value="manual">Manual Input</TabsTrigger>
                </TabsList>

                <TabsContent value="url" forceMount hidden={activeTab !== "url"}>
                  <UrlImportTab profile={profile} />
                </TabsContent>

                <TabsContent value="json" forceMount hidden={activeTab !== "json"}>
                  <JsonImportTab profile={profile} />
                </TabsContent>

                <TabsContent value="manual" forceMount hidden={activeTab !== "manual"}>
                  <ManualInputTab profile={profile} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <ImportLogSection className="md:col-span-2 lg:col-span-2" />
        </div>
      )}
    </YStack>
  );
}
