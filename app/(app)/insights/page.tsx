"use client";

import { MiniLineChart } from "@/components/charts/mini-line-chart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRecoveryStats, RecoveryState, triggerSummary, useRecoveryData, weeklyTrend } from "@/lib/recovery-store";
import { useMemo, useState } from "react";

type ProgressRange = "week" | "month" | "year";
const firstProgressMonth = new Date(2026, 6, 1);
type ProgressItem = ReturnType<typeof periodSummary> & {
  label: string;
  caption: string;
  total: number;
};

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfYear(date: Date) {
  return new Date(date.getFullYear(), 0, 1);
}

function endOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function inPeriod(value: string, start: Date, end: Date) {
  const date = new Date(value);
  return date >= start && date <= end;
}

function periodSummary(state: RecoveryState, start: Date, end: Date) {
  const episodes = state.episodes.filter((item) => inPeriod(item.occurredAt, start, end));
  const checkIns = state.checkIns.filter((item) => inPeriod(item.date, start, end));
  const triggerLogs = state.triggers.filter((item) => inPeriod(item.createdAt, start, end));
  const journals = state.journals.filter((item) => inPeriod(item.date, start, end));
  const erpSessions = state.erpExercises
    .flatMap((exercise) => exercise.history)
    .filter((session) => session.completedAt && inPeriod(session.completedAt, start, end));
  const anxietyValues = [...episodes.map((item) => item.anxietyLevel), ...checkIns.map((item) => item.anxietyLevel)];
  const resisted = episodes.filter((item) => item.resistedCompulsion).length;

  return {
    episodes: episodes.length,
    checkIns: checkIns.length,
    triggerLogs: triggerLogs.length,
    journals: journals.length,
    erpSessions: erpSessions.length,
    erpMinutes: Math.round(erpSessions.reduce((sum, session) => sum + session.durationSeconds, 0) / 60),
    averageAnxiety: anxietyValues.length
      ? Number((anxietyValues.reduce((sum, value) => sum + value, 0) / anxietyValues.length).toFixed(1))
      : 0,
    resistedRate: episodes.length ? Math.round((resisted / episodes.length) * 100) : 0
  };
}

function progressItems(state: RecoveryState, range: ProgressRange, selectedMonth: Date): ProgressItem[] {
  const now = new Date();
  if (range === "month") {
    const start = startOfMonth(selectedMonth);
    const end = endOfMonth(selectedMonth);
    const weeks: Array<{ start: Date; end: Date }> = [];
    const cursor = new Date(start);

    while (cursor <= end) {
      const weekStart = new Date(cursor);
      const weekEnd = new Date(cursor);
      weekEnd.setDate(weekEnd.getDate() + (6 - weekEnd.getDay()));
      const cappedEnd = weekEnd > end ? end : endOfDay(weekEnd);
      weeks.push({ start: weekStart, end: cappedEnd });
      cursor.setTime(cappedEnd.getTime());
      cursor.setDate(cursor.getDate() + 1);
      cursor.setHours(0, 0, 0, 0);
    }

    return weeks.map((week, index) => {
      const summary = periodSummary(state, week.start, week.end);
      const total = summary.checkIns + summary.erpSessions + summary.episodes + summary.journals + summary.triggerLogs;
      return {
        label: `Week ${index + 1}`,
        caption: `${new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(week.start)} - ${new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(week.end)}`,
        total,
        ...summary
      };
    });
  }

  const length = range === "week" ? 7 : 12;

  return Array.from({ length }, (_, index) => {
    const date =
      range === "week"
        ? new Date(now.getFullYear(), now.getMonth(), now.getDate() - (length - 1 - index))
        : new Date(now.getFullYear(), now.getMonth() - (length - 1 - index), 1);
    const start = range === "week" ? new Date(date.getFullYear(), date.getMonth(), date.getDate()) : date;
    const end =
      range === "week"
        ? endOfDay(date)
        : endOfMonth(date);
    const summary = periodSummary(state, start, end);
    const total = summary.checkIns + summary.erpSessions + summary.episodes + summary.journals + summary.triggerLogs;

    return {
      label:
        range === "week"
          ? new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(date)
          : new Intl.DateTimeFormat(undefined, { month: "short" }).format(date),
      caption:
        range === "week"
          ? new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date)
          : String(date.getFullYear()),
      total,
      ...summary
    };
  });
}

export default function InsightsPage() {
  const { state } = useRecoveryData();
  const [range, setRange] = useState<ProgressRange>("month");
  const [selectedMonthKey, setSelectedMonthKey] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth()).padStart(2, "0")}`;
  });
  const trend = weeklyTrend(state);
  const stats = getRecoveryStats(state);
  const triggers = triggerSummary(state);
  const now = new Date();
  const [selectedYear, selectedMonthIndex] = selectedMonthKey.split("-").map(Number);
  const selectedMonth = new Date(selectedYear, selectedMonthIndex, 1);
  const monthOptions = useMemo(
    () => {
      const months =
        (now.getFullYear() - firstProgressMonth.getFullYear()) * 12 + now.getMonth() - firstProgressMonth.getMonth() + 1;
      return Array.from({ length: Math.max(1, months) }, (_, index) => {
        const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
        return {
          value: `${date.getFullYear()}-${String(date.getMonth()).padStart(2, "0")}`,
          label: new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(date)
        };
      });
    },
    [now]
  );
  const progressStart =
    range === "week" ? new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6) : range === "month" ? startOfMonth(selectedMonth) : startOfYear(now);
  const progressEnd = range === "month" ? endOfMonth(selectedMonth) : now;
  const rangeStats = periodSummary(state, progressStart, progressEnd);
  const progress = useMemo(() => progressItems(state, range, selectedMonth), [state, range, selectedMonth]);
  const maxProgress = Math.max(1, ...progress.map((item) => item.total));
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
        <CardHeader className="gap-4">
          <div>
            <CardTitle>Progress</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">Check-ins, ERP work, episodes, triggers, and journal activity.</p>
          </div>
          <div className="flex flex-col gap-3 rounded-md border bg-background p-2 md:flex-row md:items-center md:justify-between">
            <div className="grid grid-cols-3 rounded-md bg-muted p-1 text-sm md:w-80">
              {[
                ["week", "Week"],
                ["month", "Month"],
                ["year", "Year"]
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={`rounded-md px-3 py-2 font-medium transition ${
                    range === value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setRange(value as ProgressRange)}
                >
                  {label}
                </button>
              ))}
            </div>
            {range === "month" ? (
              <select
                className="h-10 rounded-md border bg-background px-3 text-sm md:w-48"
                value={selectedMonthKey}
                onChange={(event) => setSelectedMonthKey(event.target.value)}
              >
                {monthOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Check-ins", rangeStats.checkIns],
              ["ERP sessions", rangeStats.erpSessions],
              ["Avg anxiety", `${rangeStats.averageAnxiety}/10`],
              ["Resistance", `${rangeStats.resistedRate}%`]
            ].map(([title, value]) => (
              <div key={title} className="rounded-md border bg-background p-4">
                <p className="text-sm text-muted-foreground">{title}</p>
                <p className="mt-2 text-2xl font-semibold">{value}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {[
              ["bg-primary", "Check-in"],
              ["bg-amber-500", "ERP"],
              ["bg-red-600", "Episode"],
              ["bg-sky-600", "Trigger"],
              ["bg-slate-500", "Journal"]
            ].map(([color, label]) => (
              <span key={label} className="inline-flex items-center gap-1.5">
                <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
                {label}
              </span>
            ))}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {progress.map((item) => (
              <div key={`${item.label}-${item.caption}`} className="rounded-md border bg-background p-4 transition hover:border-primary/50 hover:shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{item.caption}</p>
                  </div>
                  <Badge className={item.total ? "bg-primary text-primary-foreground" : undefined}>
                    {item.total ? `${item.total} activity` : "No activity"}
                  </Badge>
                </div>
                <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-muted">
                  {item.total ? (
                    <div className="flex h-full rounded-full" style={{ width: `${Math.max(10, (item.total / maxProgress) * 100)}%` }}>
                      {[
                        ["bg-primary", item.checkIns],
                        ["bg-amber-500", item.erpSessions],
                        ["bg-red-600", item.episodes],
                        ["bg-sky-600", item.triggerLogs],
                        ["bg-slate-500", item.journals]
                      ].map(([color, count]) =>
                        count ? (
                          <span
                            key={`${color}-${count}`}
                            className={`${color} h-full min-w-2`}
                            style={{ width: `${(Number(count) / item.total) * 100}%` }}
                          />
                        ) : null
                      )}
                    </div>
                  ) : null}
                </div>
                <div className="mt-3 grid grid-cols-5 gap-1.5 text-center text-[11px] text-muted-foreground">
                  <span className="rounded-md bg-muted px-1.5 py-1">{item.checkIns} C</span>
                  <span className="rounded-md bg-muted px-1.5 py-1">{item.erpSessions} E</span>
                  <span className="rounded-md bg-muted px-1.5 py-1">{item.episodes} Ep</span>
                  <span className="rounded-md bg-muted px-1.5 py-1">{item.triggerLogs} T</span>
                  <span className="rounded-md bg-muted px-1.5 py-1">{item.journals} J</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
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
