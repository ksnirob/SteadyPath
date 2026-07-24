import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function StatCard({
  title,
  value,
  detail,
  icon: Icon
}: {
  title: string;
  value: string;
  detail: string;
  icon: LucideIcon;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
        <span className="grid h-9 w-9 place-items-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold">{value}</div>
        <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
        <div className="mt-4 h-1 rounded-full bg-muted">
          <div className="h-1 w-2/3 rounded-full bg-primary" />
        </div>
      </CardContent>
    </Card>
  );
}
