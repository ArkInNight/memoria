import { Link } from "@tanstack/react-router";
import { Check, Pencil, Download, Trash2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { XStack, YStack } from "@/components/layout/stack";
import { Heading, Text, Strong } from "@/components/typography";
import { usePullRecords } from "@/lib/store/summons";
import { useSessions } from "@/lib/store/sessions";

function ProfileCard(props: {
  profile: { id: string; name: string; note?: string; createdAt: string };
  isActive: boolean;
  onSetActive: () => void;
  onRename: () => void;
  onExport: () => void;
  onDelete: () => void;
}) {
  const pulls = usePullRecords(props.profile.id);
  const sessions = useSessions(props.profile.id);
  const sortedSessions = [...sessions].sort((a, b) => b.createTime.localeCompare(a.createTime));

  return (
    <Card className="flex flex-col gap-3 p-5 shadow-sm">
      <XStack gap={8} className="justify-between items-start">
        <YStack gap={4} className="min-w-0">
          <XStack gap={8}>
            <Heading level={3} className="truncate font-bold">
              {props.profile.name}
            </Heading>
            {props.isActive && (
              <Badge className="bg-emerald-600 text-white text-[10px] shrink-0">Aktif</Badge>
            )}
          </XStack>
          <Text size="xs" variant="muted">
            Dibuat {new Date(props.profile.createdAt).toLocaleDateString()}
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
          Import terakhir:{" "}
          <Strong className="text-foreground">
            {sortedSessions[0] ? sortedSessions[0].createTime.split(" ")[0] : "—"}
          </Strong>
        </Text>
      </XStack>

      <XStack gap={8} className="flex-wrap mt-auto pt-2 border-t border-border">
        {!props.isActive && (
          <Button size="sm" variant="outline" onClick={props.onSetActive}>
            <Check className="mr-1.5 h-4 w-4" />
            Aktifkan
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={props.onRename}>
          <Pencil className="mr-1.5 h-4 w-4" />
          Ubah
        </Button>
        <Button size="sm" variant="ghost" onClick={props.onExport}>
          <Download className="mr-1.5 h-4 w-4" />
          Export
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-destructive hover:text-destructive"
          onClick={props.onDelete}
        >
          <Trash2 className="mr-1.5 h-4 w-4" />
          Hapus
        </Button>
      </XStack>

      {props.isActive && (
        <Link to="/" className="text-xs text-primary hover:underline">
          Lihat dashboard profile ini →
        </Link>
      )}
    </Card>
  );
}

export { ProfileCard };
