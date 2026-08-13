import { Link } from "@tanstack/react-router";
import { Archive, Check, Download, Pencil, RotateCcw } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { XStack, YStack } from "@/components/layout/stack";
import { Heading, Text, Strong } from "@/components/typography";
import { usePullRecords } from "@/lib/store/summons";
import { useSessions } from "@/lib/store/sessions";
import { formatDate } from "@/lib/shared";

function ProfileCard(props: {
  profile: { id: string; name: string; note?: string; createdAt: string };
  isActive: boolean;
  onSetActive: () => void;
  onRename: () => void;
  onExport: () => void;
  onArchive: () => void;
  onRestore: () => void;
  isArchived: boolean;
}) {
  const pulls = usePullRecords(props.profile.id);
  const sessions = useSessions(props.profile.id);
  const sortedSessions = [...sessions].sort((a, b) => b.createTime.localeCompare(a.createTime));

  return (
    <Card className="flex flex-col gap-3 p-5 shadow-sm">
      <XStack gap={8} className="justify-between items-start">
        <YStack gap={4} className="min-w-0">
          <XStack gap={8}>
            <Heading level={2} className="truncate font-bold">
              {props.profile.name}
            </Heading>
            {props.isActive && (
              <Badge className="shrink-0 bg-success text-success-foreground">Active</Badge>
            )}
          </XStack>
          <Text size="xs" variant="muted">
            Created {new Date(props.profile.createdAt).toLocaleDateString()}
          </Text>
        </YStack>
      </XStack>

      {props.profile.note && (
        <Text size="xs" variant="muted" className="line-clamp-2">
          {props.profile.note}
        </Text>
      )}

      <XStack gap={16} className="text-sm">
        <Text variant="muted">
          <Strong className="text-foreground">{pulls.length}</Strong> summon
        </Text>
        <Text variant="muted">
          Last import:{" "}
          <Strong className="text-foreground">
            {sortedSessions[0] ? formatDate(sortedSessions[0].createTime) : "—"}
          </Strong>
        </Text>
      </XStack>

      <XStack gap={8} className="flex-wrap mt-auto pt-2 border-t border-border">
        {!props.isArchived && !props.isActive && (
          <Button size="sm" variant="outline" onClick={props.onSetActive}>
            <Check data-icon="inline-start" />
            Set Active
          </Button>
        )}
        {!props.isArchived && (
          <>
            <Button size="sm" variant="ghost" onClick={props.onRename}>
              <Pencil data-icon="inline-start" />
              Edit
            </Button>
            <Button size="sm" variant="ghost" onClick={props.onExport}>
              <Download data-icon="inline-start" />
              Export
            </Button>
            <Button size="sm" variant="ghost" onClick={props.onArchive}>
              <Archive data-icon="inline-start" />
              Archive
            </Button>
          </>
        )}
        {props.isArchived && (
          <>
            <Button size="sm" variant="ghost" onClick={props.onExport}>
              <Download data-icon="inline-start" />
              Export
            </Button>
            <Button size="sm" variant="outline" onClick={props.onRestore}>
              <RotateCcw data-icon="inline-start" />
              Restore
            </Button>
          </>
        )}
      </XStack>

      {props.isActive && !props.isArchived && (
        <Link to="/" className="flex min-h-11 items-center text-xs text-primary hover:underline">
          View this profile's dashboard →
        </Link>
      )}
    </Card>
  );
}

export { ProfileCard };
