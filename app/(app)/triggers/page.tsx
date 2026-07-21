"use client";

import { Plus, Zap } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { triggers as initialTriggers } from "@/lib/mock-data";

type TriggerItem = {
  label: string;
  count: number;
  change: string;
  context?: string;
};

export default function TriggersPage() {
  const [triggers, setTriggers] = useState<TriggerItem[]>(initialTriggers);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");

  function addTrigger(formData: FormData) {
    const label = String(formData.get("label") || "").trim();
    if (!label) return;

    setTriggers((current) => [
      {
        label,
        count: Number(formData.get("intensity") || 1),
        change: "New",
        context: String(formData.get("context") || "")
      },
      ...current
    ]);
    setShowForm(false);
    setMessage("Trigger added.");
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Pattern library</p>
          <h1 className="text-2xl font-semibold">Triggers</h1>
        </div>
        <Button onClick={() => setShowForm((value) => !value)}>
          <Zap className="h-4 w-4" aria-hidden />
          Add trigger
        </Button>
      </header>

      {message ? (
        <div className="rounded-md border bg-card p-3 text-sm font-medium" role="status">
          {message}
        </div>
      ) : null}

      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>New trigger</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={addTrigger} className="grid gap-4 md:grid-cols-[1fr_160px]">
              <label className="grid gap-2 text-sm font-medium">
                Trigger label
                <Input name="label" placeholder="Example: uncertainty at work" required />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Intensity
                <Input name="intensity" type="number" min="1" max="10" defaultValue="5" />
              </label>
              <label className="grid gap-2 text-sm font-medium md:col-span-2">
                Context
                <Textarea name="context" placeholder="Where did it happen? What made it stronger or easier?" />
              </label>
              <div className="flex gap-2 md:col-span-2">
                <Button type="submit">
                  <Plus className="h-4 w-4" aria-hidden />
                  Save trigger
                </Button>
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2">
        {triggers.map((trigger) => (
          <Card key={trigger.label}>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle>{trigger.label}</CardTitle>
                <Badge>{trigger.change}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{trigger.count}</p>
              <p className="mt-1 text-sm text-muted-foreground">Logged in the last 30 days</p>
              {trigger.context ? <p className="mt-3 text-sm text-muted-foreground">{trigger.context}</p> : null}
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
