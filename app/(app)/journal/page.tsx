"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRecoveryData } from "@/lib/recovery-store";
import { type JournalInput, journalSchema } from "@/lib/validation";

const storageKey = "journal-draft";

export default function JournalPage() {
  const { actions } = useRecoveryData();
  const [message, setMessage] = useState("");
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

  function onSubmit(data: JournalInput) {
    actions.addJournal(data);
    setMessage("Journal saved. Dashboard and calendar updated.");
    localStorage.removeItem(storageKey);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <p className="text-sm font-medium text-muted-foreground">Autosaved offline</p>
        <h1 className="text-2xl font-semibold">Daily journal</h1>
      </header>
      {message ? (
        <div className="rounded-md border bg-card p-3 text-sm font-medium" role="status">
          {message}
        </div>
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle>Reflection</CardTitle>
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
            <Button type="submit" className="w-full sm:w-fit">
              <Save className="h-4 w-4" aria-hidden />
              Save journal
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
