"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { FileText, MoreHorizontal, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { formatDateLabel, formatTimeLabel, type JournalEntry, useRecoveryData } from "@/lib/recovery-store";
import { type JournalInput, journalSchema } from "@/lib/validation";

const storageKey = "journal-draft";

export default function JournalPage() {
  const { state, actions } = useRecoveryData();
  const toast = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const form = useForm<JournalInput>({
    resolver: zodResolver(journalSchema),
    defaultValues: { mood: "NEUTRAL", gratitude: "", wins: "", challenges: "", body: "" }
  });

  useEffect(() => {
    const draft = localStorage.getItem(storageKey);
    if (draft) form.reset(JSON.parse(draft));
  }, [form]);

  useEffect(() => {
    const subscription = form.watch((value) => localStorage.setItem(storageKey, JSON.stringify(value)));
    return () => subscription.unsubscribe();
  }, [form]);

  useEffect(() => {
    if (editingId || typeof window === "undefined") return;

    const editId = new URLSearchParams(window.location.search).get("edit");
    const entry = state.journals.find((journal) => journal.id === editId);
    if (entry) editJournal(entry);
  }, [state.journals, editingId]);

  function onSubmit(data: JournalInput) {
    if (editingId) {
      actions.updateJournal(editingId, data);
      toast.success("Journal updated", "Dashboard and calendar now show the edited entry.");
      setEditingId(null);
    } else {
      actions.addJournal(data);
      toast.success("Journal created", "Open it below, from Dashboard recent journal, or by tapping its date in Calendar.");
    }
    setShowEditor(false);
    form.reset({ mood: "NEUTRAL", gratitude: "", wins: "", challenges: "", body: "" });
    localStorage.removeItem(storageKey);
  }

  function editJournal(entry: JournalEntry) {
    setEditingId(entry.id);
    setShowEditor(true);
    toast.info("Editing journal", `${formatDateLabel(entry.date)} at ${formatTimeLabel(entry.date)}.`);
    form.reset({
      mood: entry.mood,
      gratitude: entry.gratitude || "",
      wins: entry.wins || "",
      challenges: entry.challenges || "",
      body: entry.body
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setShowEditor(false);
    form.reset({ mood: "NEUTRAL", gratitude: "", wins: "", challenges: "", body: "" });
    localStorage.removeItem(storageKey);
    toast.info("Edit cancelled");
  }

  function startNewJournal() {
    setEditingId(null);
    form.reset({ mood: "NEUTRAL", gratitude: "", wins: "", challenges: "", body: "" });
    setShowEditor(true);
  }

  function deleteJournal(entry: JournalEntry) {
    actions.deleteJournal(entry.id);
    setOpenMenuId(null);
    toast.destructive("Journal deleted", "Dashboard, calendar, and insights updated.");
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Autosaved offline</p>
          <h1 className="text-2xl font-semibold">Daily journal</h1>
        </div>
        <Button type="button" onClick={startNewJournal}>
          <Plus className="h-4 w-4" aria-hidden />
          New journal
        </Button>
      </header>

      {showEditor ? (
        <div className="fixed inset-0 z-50 bg-background/70 p-3 backdrop-blur-sm sm:p-4" onClick={cancelEdit}>
          <Card
            className="mx-auto mt-6 max-h-[calc(100dvh-3rem)] w-full max-w-3xl overflow-y-auto shadow-lg sm:mt-10"
            role="dialog"
            aria-modal="true"
            aria-label={editingId ? "Edit journal" : "New journal"}
            onClick={(event) => event.stopPropagation()}
          >
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <CardTitle>{editingId ? "Edit reflection" : "New reflection"}</CardTitle>
              <button
                type="button"
                className="grid h-9 w-9 place-items-center rounded-md hover:bg-muted"
                onClick={cancelEdit}
                aria-label="Close journal editor"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
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
                <div className="grid gap-4 md:grid-cols-3">
                  <label className="grid gap-2 text-sm font-medium">
                    Gratitude
                    <Input {...form.register("gratitude")} />
                  </label>
                  <label className="grid gap-2 text-sm font-medium">
                    Wins
                    <Input {...form.register("wins")} />
                  </label>
                  <label className="grid gap-2 text-sm font-medium">
                    Challenges
                    <Input {...form.register("challenges")} />
                  </label>
                </div>
                <label className="grid gap-2 text-sm font-medium">
                  Notes
                  <Textarea className="min-h-64" {...form.register("body")} placeholder="Markdown-friendly notes..." />
                </label>
                <div className="grid gap-2 sm:flex">
                  <Button type="submit" className="w-full sm:w-fit">
                    <Save className="h-4 w-4" aria-hidden />
                    {editingId ? "Update journal" : "Save journal"}
                  </Button>
                  <Button type="button" variant="secondary" onClick={cancelEdit}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" aria-hidden />
            Saved journals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {state.journals.length ? (
            state.journals.map((entry) => (
              <div key={entry.id} className="group relative overflow-visible rounded-md border bg-card transition hover:border-primary hover:bg-muted/50 hover:shadow-sm">
                <Link href={`/journal/${entry.id}`} className="block focus-visible:outline-primary">
                <article className="relative p-3">
                  <span className="absolute inset-y-0 left-0 w-1 bg-primary opacity-0 transition group-hover:opacity-100" aria-hidden />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2 pr-10">
                      <p className="font-medium">{entry.wins || entry.gratitude || "Journal entry"}</p>
                      <Badge>{entry.mood.replace("_", " ")}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDateLabel(entry.date)} at {formatTimeLabel(entry.date)}
                    </p>
                  </div>
                  {entry.gratitude ? <p className="mt-3 text-sm text-muted-foreground">Gratitude: {entry.gratitude}</p> : null}
                  {entry.challenges ? <p className="mt-1 text-sm text-muted-foreground">Challenge: {entry.challenges}</p> : null}
                  <p className="mt-3 line-clamp-3 whitespace-pre-wrap text-sm">{entry.body}</p>
                  <p className="mt-3 text-xs font-medium text-primary opacity-0 transition group-hover:opacity-100">Open details</p>
                </article>
                </Link>
                <div className="absolute right-2 top-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setOpenMenuId((current) => (current === entry.id ? null : entry.id))}
                    aria-label={`More actions for journal ${formatDateLabel(entry.date)}`}
                  >
                    <MoreHorizontal className="h-5 w-5" aria-hidden />
                  </Button>
                  {openMenuId === entry.id ? (
                    <div className="absolute right-0 top-10 z-20 grid w-36 gap-1 rounded-md border bg-card p-1 shadow-lg">
                      <button
                        type="button"
                        className="flex h-9 items-center gap-2 rounded-md px-3 text-left text-sm hover:bg-muted"
                        onClick={() => {
                          setOpenMenuId(null);
                          editJournal(entry);
                        }}
                      >
                        <Pencil className="h-4 w-4" aria-hidden />
                        Edit
                      </button>
                      <button
                        type="button"
                        className="flex h-9 items-center gap-2 rounded-md px-3 text-left text-sm text-destructive hover:bg-destructive/10"
                        onClick={() => deleteJournal(entry)}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                        Delete
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-md bg-muted p-4 text-sm text-muted-foreground">
              No journals yet. Save a reflection and it will appear here, on Dashboard, and inside Calendar for that date.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
