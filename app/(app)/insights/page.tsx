import { MiniLineChart } from "@/components/charts/mini-line-chart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { triggers, weeklyAnxiety } from "@/lib/mock-data";

export default function InsightsPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium text-muted-foreground">Patterns and recovery signals</p>
        <h1 className="text-2xl font-semibold">Insights</h1>
      </header>
      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weekly anxiety</CardTitle>
          </CardHeader>
          <CardContent>
            <MiniLineChart data={weeklyAnxiety} dataKey="anxiety" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Mood trend</CardTitle>
          </CardHeader>
          <CardContent>
            <MiniLineChart data={weeklyAnxiety} dataKey="mood" color="hsl(var(--accent))" />
          </CardContent>
        </Card>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["Recovery score", "78", "+9 this month"],
          ["Best streak", "21 days", "Check-ins"],
          ["Average anxiety", "5.4/10", "-1.2 vs last month"]
        ].map(([title, value, detail]) => (
          <Card key={title}>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className="mt-2 text-3xl font-semibold">{value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
            </CardContent>
          </Card>
        ))}
      </section>
      <Card>
        <CardHeader>
          <CardTitle>Trigger frequency</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {triggers.map((trigger) => (
            <div key={trigger.label} className="rounded-md border p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">{trigger.label}</p>
                <Badge>{trigger.change}</Badge>
              </div>
              <p className="mt-3 text-2xl font-semibold">{trigger.count}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
