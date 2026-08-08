import { Link } from "@tanstack/react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, UserPlus } from "lucide-react";
import { useActiveProfile } from "@/lib/store/profiles";
import { useSessions } from "@/lib/store/sessions";
import { YStack } from "@/components/layout/stack";
import { Text } from "@/components/typography";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Empty, EmptyContent } from "@/components/ui/empty";

export function ImportLogPage() {
  const profile = useActiveProfile();
  const logs = useSessions(profile?.id);

  const sorted = [...logs].sort((a, b) => b.createTime.localeCompare(a.createTime));

  return (
    <YStack gap={24} className="max-w-4xl">
      <PageHeader
        title="Import Log"
        description="History of summon logs successfully merged into the permanent archive."
        icon={<ClipboardList className="h-8 w-8 text-primary" />}
      />

      {!profile ? (
        <EmptyState
          icon={<UserPlus className="h-7 w-7 text-primary" />}
          title="Belum ada profile"
          description="Log import disimpan per profile. Buat profile dulu."
          action={
            <Button asChild>
              <Link to="/profiles">Buat Profile</Link>
            </Button>
          }
        />
      ) : (
        <Card className="shadow-sm overflow-hidden">
          {sorted.length > 0 ? (
            <YStack gap={0} className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Import Session ID</TableHead>
                    <TableHead>Import Time</TableHead>
                    <TableHead className="text-center">New Records</TableHead>
                    <TableHead className="text-center">Duplicates Skipped</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.map((log) => (
                    <TableRow key={`${profile.id}-${log.id}`}>
                      <TableCell className="font-mono text-xs font-semibold text-primary">
                        {log.id}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {log.createTime.split(".")[0]}
                      </TableCell>
                      <TableCell className="text-center font-bold text-emerald-600 dark:text-emerald-400">
                        +{log.importedCount}
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {log.duplicateCount}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-emerald-600 text-white font-medium hover:bg-emerald-600">
                          Success
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </YStack>
          ) : (
            <Empty className="border-0 p-12">
              <EmptyContent>
                <Text variant="muted">No imports have been registered yet.</Text>
              </EmptyContent>
            </Empty>
          )}
        </Card>
      )}
    </YStack>
  );
}
