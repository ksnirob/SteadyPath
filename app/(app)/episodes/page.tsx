"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MoreHorizontal, Pencil, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoPopover } from "@/components/ui/info-popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { formatDateLabel, formatTimeLabel, triggerSummary, type Episode, useRecoveryData } from "@/lib/recovery-store";
import { type EpisodeInput, episodeSchema } from "@/lib/validation";

function formatLocalDateTimeInput(date = new Date()) {
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export default function EpisodesPage() {
  const { state, actions } = useRecoveryData();
  const toast = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
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
    const input = {
      ...data,
      occurredAt: new Date(data.occurredAt).toISOString(),
      durationMinutes: data.durationMinutes || undefined
    };

    if (editingId) {
      actions.updateEpisode(editingId, input);
      toast.success("Episode updated", "Dashboard, triggers, insights, and calendar updated.");
      setEditingId(null);
    } else {
      actions.addEpisode(input);
      toast.success("Episode saved", "Dashboard, triggers, insights, and calendar updated.");
    }
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

  function editEpisode(episode: Episode) {
    setEditingId(episode.id);
    setOpenMenuId(null);
    form.reset({
      occurredAt: formatLocalDateTimeInput(new Date(episode.occurredAt)),
      intrusiveThought: episode.intrusiveThought,
      trigger: episode.trigger || "",
      compulsion: episode.compulsion || "",
      anxietyLevel: episode.anxietyLevel,
      resistedCompulsion: episode.resistedCompulsion,
      durationMinutes: episode.durationMinutes,
      mood: episode.mood,
      notes: episode.notes || ""
    });
    toast.info("Editing episode", `${formatDateLabel(episode.occurredAt)} at ${formatTimeLabel(episode.occurredAt)}.`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
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

  function deleteEpisode(episode: Episode) {
    actions.deleteEpisode(episode.id);
    setOpenMenuId(null);
    if (editingId === episode.id) cancelEdit();
    toast.destructive("Episode deleted", "Dashboard, triggers, insights, and calendar updated.");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <p className="text-sm font-medium text-muted-foreground">OCD episode tracker</p>
        <h1 className="text-2xl font-semibold">Log what happened without judgment</h1>
      </header>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>{editingId ? "Edit episode" : "Episode details"}</CardTitle>
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
            <div className="flex gap-2">
              <Button type="submit" className="w-full sm:w-fit">
                <Save className="h-4 w-4" aria-hidden />
                {editingId ? "Update episode" : "Save episode"}
              </Button>
              {editingId ? (
                <Button type="button" variant="secondary" onClick={cancelEdit}>
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Saved episodes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {state.episodes.length ? (
            state.episodes.map((episode) => (
              <article key={episode.id} className="relative rounded-md border bg-card p-3 pr-12 transition hover:border-primary hover:bg-muted/50">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{episode.trigger || "Episode"}</p>
                  <Badge>{episode.anxietyLevel}/10</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{episode.intrusiveThought}</p>
                {episode.compulsion ? <p className="mt-1 text-sm text-muted-foreground">Compulsion: {episode.compulsion}</p> : null}
                <p className="mt-2 text-xs text-muted-foreground">
                  {formatDateLabel(episode.occurredAt)} at {formatTimeLabel(episode.occurredAt)}
                </p>
                <div className="absolute right-2 top-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setOpenMenuId((current) => (current === episode.id ? null : episode.id))}
                    aria-label={`More actions for episode ${episode.trigger || episode.id}`}
                  >
                    <MoreHorizontal className="h-5 w-5" aria-hidden />
                  </Button>
                  {openMenuId === episode.id ? (
                    <div className="absolute right-0 top-10 z-20 grid w-36 gap-1 rounded-md border bg-card p-1 shadow-lg">
                      <button
                        type="button"
                        className="flex h-9 items-center gap-2 rounded-md px-3 text-left text-sm hover:bg-muted"
                        onClick={() => editEpisode(episode)}
                      >
                        <Pencil className="h-4 w-4" aria-hidden />
                        Edit
                      </button>
                      <button
                        type="button"
                        className="flex h-9 items-center gap-2 rounded-md px-3 text-left text-sm text-destructive hover:bg-destructive/10"
                        onClick={() => deleteEpisode(episode)}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                        Delete
                      </button>
                    </div>
                  ) : null}
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-md bg-muted p-4 text-sm text-muted-foreground">
              No episodes yet. Saved episodes will appear here with edit and delete actions.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
