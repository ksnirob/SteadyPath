"use client";

import Link from "next/link";
import { CalendarDays, ClipboardCheck, FileText, Gauge, ShieldCheck, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatTimeLabel, useRecoveryData } from "@/lib/recovery-store";

const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

function monthCells(date = new Date()) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const leading = first.getDay();
  const totalCells = Math.ceil((leading + last.getDate()) / 7) * 7;

  return Array.from({ length: totalCells }, (_, index) => {
    const day = index - leading + 1;
    return day > 0 && day <= last.getDate() ? new Date(date.getFullYear(), date.getMonth(), day) : null;
  });
}

function sameDay(left: string, right: Date) {
  return new Date(left).toDateString() === right.toDateString();
}

export default function CalendarPage() {
  const { state } = useRecoveryData();
  const cells = monthCells();
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const monthLabel = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(today);

  function activityFor(date: Date) {
    const episodes = state.episodes.filter((item) => sameDay(item.occurredAt, date));
    const checkIns = state.checkIns.filter((item) => sameDay(item.date, date));
    const journals = state.journals.filter((item) => sameDay(item.date, date));
    const erp = state.erpExercises.flatMap((exercise) =>
      exercise.history
        .filter((session) => session.completedAt && sameDay(session.completedAt, date))
        .map((session) => ({ ...session, title: exercise.title }))
    );

    return { episodes, checkIns, journals, erp };
  }

  const selectedActivity = selectedDate ? activityFor(selectedDate) : null;
  const selectedTotal = selectedActivity
    ? selectedActivity.episodes.length + selectedActivity.checkIns.length + selectedActivity.journals.length + selectedActivity.erp.length
    : 0;

  const activityTypes = [
    { key: "checkIns", label: "Check-in", className: "bg-primary", icon: ClipboardCheck },
    { key: "episodes", label: "Episode", className: "bg-destructive", icon: Gauge },
    { key: "erp", label: "ERP", className: "bg-accent", icon: ShieldCheck },
    { key: "journals", label: "Journal", className: "bg-muted-foreground", icon: FileText }
  ] as const;

  useEffect(() => {
    if (!selectedDate) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedDate(null);
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selectedDate]);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium text-muted-foreground">Recovery activity calendar</p>
        <h1 className="text-2xl font-semibold">{monthLabel}</h1>
      </header>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" aria-hidden />
            Monthly overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-7 gap-1.5 text-center text-sm sm:gap-2">
            {weekDays.map((day, index) => (
              <div key={`${day}-${index}`} className="py-1 text-xs font-medium text-muted-foreground sm:py-2 sm:text-sm">
                {day}
              </div>
            ))}
            {cells.map((date, index) => {
              const activity = date ? activityFor(date) : null;
              const total = activity ? activity.episodes.length + activity.checkIns.length + activity.journals.length + activity.erp.length : 0;
              const isToday = date?.toDateString() === today.toDateString();
              const hasCheckIn = Boolean(activity?.checkIns.length);

              return (
                <button
                  key={`calendar-cell-${index}`}
                  type="button"
                  disabled={!date}
                  onClick={() => date && setSelectedDate(date)}
                  className={cn(
                    "flex aspect-square min-h-11 flex-col rounded-md border p-1 text-left transition sm:min-h-24 sm:p-2",
                    date && "hover:border-primary hover:bg-muted/60 focus-visible:outline-primary",
                    total > 0 &&
                      "border-background bg-primary text-primary-foreground outline outline-2 outline-background shadow-inner ring-1 ring-primary hover:bg-primary/90",
                    hasCheckIn && "bg-primary text-primary-foreground",
                    isToday && "border-primary ring-1 ring-primary",
                    !date && "cursor-default bg-muted/40"
                  )}
                >
                  {date ? (
                    <>
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-xs font-semibold sm:text-sm">{date.getDate()}</span>
                        {total ? (
                          <span className={cn("text-[10px] font-semibold sm:hidden", total > 0 ? "text-primary-foreground" : "text-muted-foreground")}>
                            {total}
                          </span>
                        ) : null}
                      </div>
                      {total ? (
                        <div className="mt-auto flex flex-wrap gap-0.5 sm:mt-2 sm:gap-1">
                          {activityTypes.map((type) => {
                            const count = activity?.[type.key].length || 0;
                            return count ? (
                              <span
                                key={type.key}
                                className={cn(
                                  "h-1.5 w-1.5 rounded-full sm:h-auto sm:w-auto sm:rounded-full sm:border sm:border-primary-foreground/30 sm:bg-primary-foreground/15 sm:px-2 sm:py-1 sm:text-[11px] sm:font-medium sm:text-primary-foreground",
                                  type.className
                                )}
                                title={`${type.label}: ${count}`}
                              >
                                <span className="hidden sm:inline">
                                  {count > 1 ? `${count} ` : ""}
                                  {type.label}
                                </span>
                              </span>
                            ) : null;
                          })}
                        </div>
                      ) : null}
                    </>
                  ) : null}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {activityTypes.map((type) => (
              <span key={type.key} className="inline-flex items-center gap-1.5">
                <span className={cn("h-2.5 w-2.5 rounded-full", type.className)} />
                {type.label}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedDate ? (
        <div className="fixed inset-0 z-50 bg-background/70 p-3 backdrop-blur-sm sm:p-4" onClick={() => setSelectedDate(null)}>
          <Card
            className="fixed inset-x-3 bottom-[calc(1rem+env(safe-area-inset-bottom))] max-h-[calc(100dvh-5rem)] overflow-y-auto shadow-lg sm:static sm:mx-auto sm:mt-10 sm:w-full sm:max-w-lg"
            role="dialog"
            aria-modal="true"
            aria-label="Calendar day details"
            onClick={(event) => event.stopPropagation()}
          >
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Selected day</p>
                <CardTitle>
                  {new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" }).format(selectedDate)}
                </CardTitle>
              </div>
              <button
                type="button"
                className="grid h-9 w-9 place-items-center rounded-md hover:bg-muted"
                onClick={() => setSelectedDate(null)}
                aria-label="Close calendar details"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-2">
                {activityTypes.map((type) => {
                  const Icon = type.icon;
                  const count = selectedActivity?.[type.key].length || 0;
                  return (
                    <div key={type.key} className="rounded-md border p-2 text-center">
                      <Icon className="mx-auto h-4 w-4 text-primary" aria-hidden />
                      <p className="mt-1 text-lg font-semibold">{count}</p>
                      <p className="text-[11px] text-muted-foreground">{type.label}</p>
                    </div>
                  );
                })}
              </div>

              {selectedTotal ? (
                <div className="space-y-3">
                  {selectedActivity?.checkIns.map((checkIn) => (
                    <div key={checkIn.id} className="rounded-md border p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium">Check-in</p>
                        <Badge>Anxiety {checkIn.anxietyLevel}/10</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">Mood: {checkIn.mood.replace("_", " ")}</p>
                    </div>
                  ))}
                  {selectedActivity?.episodes.map((episode) => (
                    <div key={episode.id} className="rounded-md border p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium">{episode.trigger || "Episode"}</p>
                        <Badge>{episode.anxietyLevel}/10</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{episode.compulsion || episode.intrusiveThought}</p>
                      <p className="mt-2 text-xs text-muted-foreground">{formatTimeLabel(episode.occurredAt)}</p>
                    </div>
                  ))}
                  {selectedActivity?.erp.map((session) => (
                    <div key={session.id} className="rounded-md border p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium">{session.title}</p>
                        <Badge>{Math.round(session.durationSeconds / 60)} min</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">ERP session completed</p>
                    </div>
                  ))}
                  {selectedActivity?.journals.map((journal) => (
                    <div key={journal.id} className="rounded-md border p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium">{journal.wins || journal.gratitude || "Journal"}</p>
                        <Badge>{journal.mood.replace("_", " ")}</Badge>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{journal.body}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-md bg-muted p-4 text-sm text-muted-foreground">
                  No recovery activity logged for this day yet.
                </div>
              )}

              <div className="grid gap-2 sm:grid-cols-3">
                <Link href="/check-in" className="inline-flex h-10 items-center justify-center rounded-md bg-muted px-3 text-sm font-medium">
                  Check-in
                </Link>
                <Link href="/episodes" className="inline-flex h-10 items-center justify-center rounded-md bg-muted px-3 text-sm font-medium">
                  Episode
                </Link>
                <Link href="/erp" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground">
                  ERP
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
