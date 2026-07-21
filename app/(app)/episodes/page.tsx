"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { type EpisodeInput, episodeSchema } from "@/lib/validation";

export default function EpisodesPage() {
  const [message, setMessage] = useState("");
  const form = useForm<EpisodeInput>({
    resolver: zodResolver(episodeSchema),
    defaultValues: {
      occurredAt: new Date().toISOString().slice(0, 16),
      anxietyLevel: 5,
      resistedCompulsion: false,
      mood: "NEUTRAL"
    }
  });

  function onSubmit(data: EpisodeInput) {
    localStorage.setItem("latest-episode", JSON.stringify(data));
    setMessage("Episode saved locally.");
    form.reset({ ...data, intrusiveThought: "", notes: "" });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <p className="text-sm font-medium text-muted-foreground">OCD episode tracker</p>
        <h1 className="text-2xl font-semibold">Log what happened without judgment</h1>
      </header>
      {message ? (
        <div className="rounded-md border bg-card p-3 text-sm font-medium" role="status">
          {message}
        </div>
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle>Episode details</CardTitle>
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
                <Input {...form.register("trigger")} placeholder="Place, task, feeling..." />
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
