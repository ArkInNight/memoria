import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { server } from "@/api/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ClipboardList } from "lucide-react";
import type { ImportSession } from "@memoria/shared";

export const Route = createFileRoute("/import/log")({
  component: ImportLogPage,
});

function ImportLogPage() {
  const { data: logs, isLoading } = useQuery<ImportSession[]>({
    queryKey: ["import-log"],
    queryFn: async () => {
      const res = await server.api.import.log.get();
      if (res.error) throw new Error(res.error.value as string);
      return res.data as ImportSession[];
    },
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <ClipboardList className="h-8 w-8 text-primary" />
          Import Log
        </h2>
        <p className="text-muted-foreground mt-1">History of summon logs successfully merged into the permanent archive.</p>
      </div>

      <Card className="shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : logs && logs.length > 0 ? (
          <div className="overflow-x-auto">
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
                {logs.map((log) => (
                  <TableRow key={log.id}>
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
          </div>
        ) : (
          <div className="p-12 text-center text-muted-foreground">
            No imports have been registered yet.
          </div>
        )}
      </Card>
    </div>
  );
}
