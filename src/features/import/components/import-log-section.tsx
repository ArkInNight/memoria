import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList } from "lucide-react";
import { useActiveProfile } from "@/lib/store/profiles";
import { useSessions } from "@/lib/store/sessions";
import { YStack } from "@/components/layout/stack";
import { Text } from "@/components/typography";
import { formatDateTime } from "@/lib/shared";
import { Empty, EmptyContent } from "@/components/ui/empty";

/** Recent import sessions table, embedded next to the import form. */
function ImportLogSection({ className }: { className?: string }) {
  const profile = useActiveProfile();
  const logs = useSessions(profile?.id);

  const sorted = [...logs].sort((a, b) => b.createTime.localeCompare(a.createTime));

  return (
    <Card className={`${className ?? ""} shadow-sm h-full`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold flex items-center gap-1.5">
          <ClipboardList size={16} className="text-primary" />
          Import Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sorted.length > 0 ? (
          <YStack gap={0} className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Import Time</TableHead>
                  <TableHead className="text-center">New Records</TableHead>
                  <TableHead className="text-center">Duplicates Skipped</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((log) => (
                  <TableRow key={`${profile?.id}-${log.id}`}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {formatDateTime(log.createTime)}
                    </TableCell>
                    <TableCell className="text-center font-bold text-success">
                      +{log.importedCount}
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {log.duplicateCount}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-success text-success-foreground font-medium">
                        Success
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </YStack>
        ) : (
          <Empty className="border-0 p-8">
            <EmptyContent>
              <Text variant="muted">No imports have been registered yet.</Text>
            </EmptyContent>
          </Empty>
        )}
      </CardContent>
    </Card>
  );
}

export { ImportLogSection };
