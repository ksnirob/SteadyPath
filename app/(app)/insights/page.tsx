"use client";

import { MiniLineChart } from "@/components/charts/mini-line-chart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRecoveryStats, triggerSummary, useRecoveryData, weeklyTrend } from "@/lib/recovery-store";

export default function InsightsPage() {
  const { state } = useRecoveryData();
  const trend = weeklyTrend(state);
  const stats = getRecoveryStats(state);
  const triggers = triggerSummary(state);
  const recoveryScore = Math.max(
    0,
    Math.min(100, Math.round(50 + stats.resistedRate * 0.25 + stats.completedErp * 5 - stats.averageAnxiety * 2))
  );

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
            <MiniLineChart data={trend} dataKey="anxiety" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Mood trend</CardTitle>
          </CardHeader>
          <CardContent>
            <MiniLineChart data={trend} dataKey="mood" color="hsl(var(--accent))" />
          </CardContent>
        </Card>
      </section>
      <section className="grid gap-4 md:grid-cols-4">
        {[
          ["Recovery score", `${recoveryScore}`, "From ERP, resistance, anxiety"],
          ["Current streak", `${stats.currentStreak}`, "Daily check-ins"],
          ["Average anxiety", `${stats.averageAnxiety.toFixed(1)}/10`, "Across logged episodes"],
          ["Resistance rate", `${stats.resistedRate}%`, "Compulsions resisted"]
        ].map(([title, value, detail]) => (
          <Card key={title}>
            <CardContent className="flex min-h-28 flex-col justify-center !p-5">
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
          {triggers.length ? (
            triggers.map((trigger) => (
              <div key={trigger.label} className="rounded-md border p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{trigger.label}</p>
                  <Badge>{trigger.averageIntensity}/10</Badge>
                </div>
                <p className="mt-3 text-2xl font-semibold">{trigger.count}</p>
                <p className="mt-1 text-sm text-muted-foreground">Logged event(s)</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Log episodes or triggers to build frequency insights.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
