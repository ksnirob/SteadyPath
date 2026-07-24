"use client";

import { Activity, Brain, Flame, Plus, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { MiniLineChart } from "@/components/charts/mini-line-chart";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoPopover } from "@/components/ui/info-popover";
import {
  formatDateLabel,
  formatTimeLabel,
  getRecoveryStats,
  triggerSummary,
  useRecoveryData,
  weeklyTrend
} from "@/lib/recovery-store";

export default function DashboardPage() {
  const { state } = useRecoveryData();
  const stats = getRecoveryStats(state);
  const trend = weeklyTrend(state);
  const triggers = triggerSummary(state).slice(0, 4);
  const recentEpisodes = state.episodes.slice(0, 3);
  const recentJournal = state.journals.slice(0, 3);
  const activeErp = state.erpExercises.slice(0, 3);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" }).format(new Date())}
          </p>
          <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">Today's recovery dashboard</h1>
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
        <StatCard title="Today's anxiety" value={`${stats.todayAnxiety}/10`} detail={`${stats.todayEpisodes} episode(s) today`} icon={Activity} />
        <StatCard title="Current streak" value={`${stats.currentStreak} day${stats.currentStreak === 1 ? "" : "s"}`} detail="Check-ins completed" icon={Flame} />
        <StatCard title="Today's ERP" value={`${stats.todayErpMinutes} min`} detail={`${stats.completedErp} completed session(s)`} icon={ShieldCheck} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <CardHeader>
            <CardTitle>Weekly anxiety trend</CardTitle>
          </CardHeader>
          <CardContent>
            <MiniLineChart data={trend} dataKey="anxiety" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <CardTitle>Recovery loop</CardTitle>
            <div className="flex gap-2">
              <InfoPopover label="What is the OCD loop?" title="OCD loop">
                Intrusive thought leads to anxiety, then a compulsion, then short relief, then stronger doubt later.
              </InfoPopover>
              <InfoPopover label="How ERP breaks the loop" title="ERP breaks the loop">
                Choose a trigger on purpose, allow anxiety, and prevent the compulsion until the urge changes.
              </InfoPopover>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-md border p-3">
              <span>Compulsion resistance</span>
              <Badge>{stats.resistedRate}%</Badge>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Recent episodes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentEpisodes.length ? (
              recentEpisodes.map((episode) => (
                <div key={episode.id} className="rounded-md border bg-muted/50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{episode.trigger || "No trigger logged"}</p>
                    <Badge>{episode.anxietyLevel}/10</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{episode.compulsion || episode.intrusiveThought}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{formatTimeLabel(episode.occurredAt)}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No episodes logged yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top triggers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {triggers.length ? (
              triggers.map((trigger) => (
                <div key={trigger.label} className="flex items-center justify-between rounded-md border bg-card p-3">
                  <span className="font-medium">{trigger.label}</span>
                  <span className="text-sm text-muted-foreground">{trigger.count} logged</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Triggers will appear after episodes or trigger logs.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent journal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentJournal.length ? (
              recentJournal.map((entry) => (
                <Link key={entry.id} href={`/journal/${entry.id}`} className="block rounded-md border p-3 transition hover:border-primary hover:bg-muted/50">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{entry.wins || entry.gratitude || "Journal entry"}</p>
                    <Badge>{entry.mood.replace("_", " ")}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{formatDateLabel(entry.date)}</p>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No journal entries yet.</p>
            )}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" aria-hidden />
            ERP progress
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {activeErp.map((exercise) => (
            <div key={exercise.id}>
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
    </div>
  );
}
