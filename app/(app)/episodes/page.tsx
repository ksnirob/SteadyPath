"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoPopover } from "@/components/ui/info-popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { triggerSummary, useRecoveryData } from "@/lib/recovery-store";
import { type EpisodeInput, episodeSchema } from "@/lib/validation";

function formatLocalDateTimeInput(date = new Date()) {
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export default function EpisodesPage() {
  const { state, actions } = useRecoveryData();
  const toast = useToast();
  const existingTriggerLabels = triggerSummary(state).map((trigger) => trigger.label);
  const form = useForm<EpisodeInput>({
    resolver: zodResolver(episodeSchema),
    defaultValues: {
      occurredAt: formatLocalDateTimeInput(),
      anxietyLevel: 5,
      resistedCompulsion: false,
      mood: "NEUTRAL"
    }
  });

  function onSubmit(data: EpisodeInput) {
    actions.addEpisode({
      ...data,
      occurredAt: new Date(data.occurredAt).toISOString(),
      durationMinutes: data.durationMinutes || undefined
    });
    toast.success("Episode saved", "Dashboard, triggers, insights, and calendar updated.");
    form.reset({
      occurredAt: formatLocalDateTimeInput(),
      anxietyLevel: 5,
      resistedCompulsion: false,
      mood: "NEUTRAL",
      intrusiveThought: "",
      trigger: "",
      compulsion: "",
      notes: ""
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <p className="text-sm font-medium text-muted-foreground">OCD episode tracker</p>
        <h1 className="text-2xl font-semibold">Log what happened without judgment</h1>
      </header>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>Episode details</CardTitle>
          <InfoPopover label="What is an episode?" title="What episode means">
            An episode is one OCD loop event: intrusive thought, anxiety, urge to perform a compulsion, and either doing
            or resisting that compulsion.
          </InfoPopover>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <label className="grid gap-2 text-sm font-medium">
              Date and time
              <Input type="datetime-local" {...form.register("occurredAt")} />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Intrusive thought
              <Textarea {...form.register("intrusiveThought")} placeholder="What thought or image showed up?" />
              {form.formState.errors.intrusiveThought && <span className="text-sm text-destructive">{form.formState.errors.intrusiveThought.message}</span>}
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium">
                Trigger
                <Input {...form.register("trigger")} list="existing-triggers" placeholder="Type or choose an existing trigger" />
                <datalist id="existing-triggers">
                  {existingTriggerLabels.map((label) => (
                    <option key={label} value={label} />
                  ))}
                </datalist>
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Compulsion
                <Input {...form.register("compulsion")} placeholder="Checking, washing, reassurance..." />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="grid gap-2 text-sm font-medium">
                Anxiety 0-10
                <Input type="number" min="0" max="10" {...form.register("anxietyLevel")} />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Duration minutes
                <Input type="number" min="0" {...form.register("durationMinutes")} />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Mood
                <select className="h-11 rounded-md border bg-background px-3 text-sm" {...form.register("mood")}>
                  <option value="VERY_LOW">Very low</option>
                  <option value="LOW">Low</option>
                  <option value="NEUTRAL">Neutral</option>
                  <option value="GOOD">Good</option>
                  <option value="GREAT">Great</option>
                </select>
              </label>
            </div>
            <label className="flex items-center gap-3 text-sm font-medium">
              <input type="checkbox" className="h-5 w-5 accent-primary" {...form.register("resistedCompulsion")} />
              Resisted or delayed the compulsion
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Notes
              <Textarea {...form.register("notes")} placeholder="What helped? What would you try next time?" />
            </label>
            <Button type="submit" className="w-full sm:w-fit">
              <Save className="h-4 w-4" aria-hidden />
              Save episode
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
