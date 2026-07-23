"use client";

import { ClipboardCheck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { type Mood, useRecoveryData } from "@/lib/recovery-store";

export default function CheckInPage() {
  const { actions } = useRecoveryData();
  const [message, setMessage] = useState("");

  function saveCheckIn(formData: FormData) {
    actions.addCheckIn({
      anxietyLevel: Number(formData.get("anxietyLevel") || 0),
      energyLevel: Number(formData.get("energyLevel") || 0),
      sleepHours: Number(formData.get("sleepHours") || 0),
      mood: String(formData.get("mood") || "NEUTRAL") as Mood,
      notes: String(formData.get("notes") || "")
    });
    setMessage("Check-in saved. Dashboard, streak, calendar, and insights updated.");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <p className="text-sm font-medium text-muted-foreground">Morning or evening check-in</p>
        <h1 className="text-2xl font-semibold">Today's check-in</h1>
      </header>
      {message ? (
        <div className="rounded-md border bg-card p-3 text-sm font-medium" role="status">
          {message}
        </div>
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle>How are you doing?</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={saveCheckIn} className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium">
                Anxiety 0-10
                <Input name="anxietyLevel" type="number" min="0" max="10" defaultValue="4" />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Energy 0-10
                <Input name="energyLevel" type="number" min="0" max="10" defaultValue="6" />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Sleep hours
                <Input name="sleepHours" type="number" min="0" step="0.5" defaultValue="7" />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Mood
                <select name="mood" className="h-11 rounded-md border bg-background px-3 text-sm" defaultValue="GOOD">
                  <option value="VERY_LOW">Very low</option>
                  <option value="LOW">Low</option>
                  <option value="NEUTRAL">Neutral</option>
                  <option value="GOOD">Good</option>
                  <option value="GREAT">Great</option>
                </select>
              </label>
            </div>
            <label className="grid gap-2 text-sm font-medium">
              Notes
              <Textarea name="notes" placeholder="What affected symptoms today?" />
            </label>
            <Button className="w-full sm:w-fit">
              <ClipboardCheck className="h-4 w-4" aria-hidden />
              Save check-in
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
