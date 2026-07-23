"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useRecoveryData } from "@/lib/recovery-store";

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

export default function CalendarPage() {
  const { state } = useRecoveryData();
  const cells = monthCells();
  const monthLabel = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(new Date());

  function activityFor(date: Date) {
    const key = date.toDateString();
    return {
      episodes: state.episodes.filter((item) => new Date(item.occurredAt).toDateString() === key).length,
      checkIns: state.checkIns.filter((item) => new Date(item.date).toDateString() === key).length,
      journals: state.journals.filter((item) => new Date(item.date).toDateString() === key).length,
      erp: state.erpExercises
        .flatMap((exercise) => exercise.history)
        .filter((session) => session.completedAt && new Date(session.completedAt).toDateString() === key).length
    };
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium text-muted-foreground">Recovery activity calendar</p>
        <h1 className="text-2xl font-semibold">{monthLabel}</h1>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Monthly overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 text-center text-sm">
            {weekDays.map((day, index) => (
              <div key={`${day}-${index}`} className="py-2 font-medium text-muted-foreground">
                {day}
              </div>
            ))}
            {cells.map((date, index) => {
              const activity = date ? activityFor(date) : null;
              const total = activity ? activity.episodes + activity.checkIns + activity.journals + activity.erp : 0;
              return (
                <div
                  key={`calendar-cell-${index}`}
                  className={cn("min-h-24 rounded-md border p-2 text-left", !date && "bg-muted/40")}
                >
                  {date ? (
                    <>
                      <span className="text-sm font-medium">{date.getDate()}</span>
                      {total ? (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {activity?.checkIns ? <Badge>Check-in</Badge> : null}
                          {activity?.episodes ? <Badge>{activity.episodes} episode</Badge> : null}
                          {activity?.erp ? <Badge>{activity.erp} ERP</Badge> : null}
                          {activity?.journals ? <Badge>Journal</Badge> : null}
                        </div>
                      ) : null}
                    </>
                  ) : null}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
