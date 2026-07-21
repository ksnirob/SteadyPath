import { Activity, Flame, Plus, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { MiniLineChart } from "@/components/charts/mini-line-chart";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { erpExercises, journalEntries, recentEpisodes, triggers, weeklyAnxiety } from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Tuesday, July 21</p>
          <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">Today’s recovery dashboard</h1>
        </div>
        <div className="flex gap-2">
          <Link
            href="/episodes"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-muted px-3 text-sm font-medium text-foreground transition hover:bg-muted/80"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Episode
          </Link>
          <Link
            href="/erp"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            <ShieldCheck className="h-4 w-4" aria-hidden />
            Start ERP
          </Link>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard title="Today's anxiety" value="4/10" detail="Down 2 points from yesterday" icon={Activity} />
        <StatCard title="Current streak" value="12 days" detail="Check-ins completed" icon={Flame} />
        <StatCard title="Today's ERP" value="24 min" detail="1 exercise remaining" icon={ShieldCheck} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <CardHeader>
            <CardTitle>Weekly anxiety trend</CardTitle>
          </CardHeader>
          <CardContent>
            <MiniLineChart data={weeklyAnxiety} dataKey="anxiety" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progress summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {erpExercises.map((exercise) => (
              <div key={exercise.title}>
                <div className="mb-2 flex items-center justify-between gap-2 text-sm">
                  <span className="font-medium">{exercise.title}</span>
                  <span className="text-muted-foreground">{exercise.completion}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${exercise.completion}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Recent episodes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentEpisodes.map((episode) => (
              <div key={`${episode.trigger}-${episode.time}`} className="rounded-md bg-muted p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{episode.trigger}</p>
                  <Badge>{episode.anxiety}/10</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{episode.compulsion}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent triggers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {triggers.map((trigger) => (
              <div key={trigger.label} className="flex items-center justify-between rounded-md border p-3">
                <span className="font-medium">{trigger.label}</span>
                <span className="text-sm text-muted-foreground">{trigger.count} logged</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent journal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {journalEntries.map((entry) => (
              <div key={entry.title} className="rounded-md border p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{entry.title}</p>
                  <Badge>{entry.mood}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{entry.date}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
