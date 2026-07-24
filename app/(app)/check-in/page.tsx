"use client";

import { ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoPopover } from "@/components/ui/info-popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { type Mood, useRecoveryData } from "@/lib/recovery-store";

export default function CheckInPage() {
  const { actions } = useRecoveryData();
  const toast = useToast();

  function saveCheckIn(formData: FormData) {
    actions.addCheckIn({
      anxietyLevel: Number(formData.get("anxietyLevel") || 0),
      energyLevel: Number(formData.get("energyLevel") || 0),
      sleepHours: Number(formData.get("sleepHours") || 0),
      mood: String(formData.get("mood") || "NEUTRAL") as Mood,
      notes: String(formData.get("notes") || "")
    });
    toast.success("Check-in saved", "Dashboard, streak, calendar, and insights updated.");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <p className="text-sm font-medium text-muted-foreground">Morning or evening check-in</p>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold">Today's check-in</h1>
          <InfoPopover label="What check-in means" title="Daily check-in">
            A check-in is a quick snapshot of your day. Example: anxiety 6, mood neutral, sleep 7 hours, energy 4,
            notes like "checking was stronger after poor sleep." It updates Dashboard, Calendar, Insights, and streaks.
          </InfoPopover>
        </div>
      </header>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>How are you doing?</CardTitle>
          <InfoPopover label="How to fill check-in" title="How to fill this">
            Use your best estimate. The goal is pattern tracking, not perfect accuracy. Example: if anxiety was mostly
            manageable but spiked once, you might enter 4 or 5.
          </InfoPopover>
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
