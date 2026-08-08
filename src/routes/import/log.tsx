import { createFileRoute, Link } from "@tanstack/react-router";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, UserPlus } from "lucide-react";
import { useActiveProfile } from "@/lib/store/profiles";
import { useSessions } from "@/lib/store/sessions";

export const Route = createFileRoute("/import/log")({
  component: ImportLogPage,
});

function ImportLogPage() {
  const profile = useActiveProfile();
  const logs = useSessions(profile?.id);

  const sorted = [...logs].sort((a, b) => b.createTime.localeCompare(a.createTime));

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <ClipboardList className="h-8 w-8 text-primary" />
          Import Log
        </h2>
        <p className="text-muted-foreground mt-1">
          History of summon logs successfully merged into the permanent archive.
        </p>
      </div>

      {!profile ? (
        <Card className="p-12 text-center space-y-4">
          <div className="mx-auto w-14 h-14 rounded-full bg-muted flex items-center justify-center">
            <UserPlus className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Belum ada profile</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              Log import disimpan per profile. Buat profile dulu.
            </p>
          </div>
          <Button asChild>
            <Link to="/profiles">Buat Profile</Link>
          </Button>
        </Card>
      ) : (
        <Card className="shadow-sm overflow-hidden">
          {sorted.length > 0 ? (
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
            </div>
          ) : (
            <div className="p-12 text-center text-muted-foreground">
              No imports have been registered yet.
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
