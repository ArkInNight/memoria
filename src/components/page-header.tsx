import { XStack, YStack } from "@/components/layout/stack";
import { Heading, Text } from "@/components/typography";

function PageHeader({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <XStack gap={16} className="flex-col md:flex-row md:items-center justify-between">
      <YStack gap={4} className="min-w-0">
        <XStack gap={8} className="flex-wrap">
          {icon}
          <Heading level={2}>{title}</Heading>
        </XStack>
        {description && <Text variant="muted">{description}</Text>}
      </YStack>
      {children}
    </XStack>
  );
}

export { PageHeader };
