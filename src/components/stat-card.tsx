import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Text } from "@/components/typography";

function StatCard({
  label,
  icon,
  value,
  valueClassName,
  hint,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  value?: React.ReactNode;
  valueClassName?: string;
  hint?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {value !== undefined && (
          <Text size="3xl" weight="bold" className={valueClassName}>
            {value}
          </Text>
        )}
        {hint !== undefined && (
          <Text size="xs" variant="muted" className="mt-1">
            {hint}
          </Text>
        )}
        {children}
      </CardContent>
    </Card>
  );
}

export { StatCard };
