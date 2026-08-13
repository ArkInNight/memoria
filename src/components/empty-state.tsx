import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyContent,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";

function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("p-12", className)}>
      <Empty className="border-0 p-0 text-center">
        {icon && (
          <EmptyMedia variant="icon" className="!size-14 !rounded-full">
            {icon}
          </EmptyMedia>
        )}
        <EmptyHeader>
          <EmptyTitle className="text-lg font-semibold">{title}</EmptyTitle>
          {description && <EmptyDescription className="max-w-md">{description}</EmptyDescription>}
        </EmptyHeader>
        <EmptyContent>{action}</EmptyContent>
      </Empty>
    </Card>
  );
}

export { EmptyState };
