"use client";

import { Plus, Zap } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatDateLabel, triggerSummary, useRecoveryData } from "@/lib/recovery-store";

export default function TriggersPage() {
  const { state, actions } = useRecoveryData();
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const summary = triggerSummary(state);

  function addTrigger(formData: FormData) {
    const label = String(formData.get("label") || "").trim();
    if (!label) return;

    actions.addTrigger({
      label,
      intensity: Number(formData.get("intensity") || 5),
      context: String(formData.get("context") || "").trim()
    });
    setShowForm(false);
    setMessage("Trigger added. Dashboard and Insights updated.");
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
        {summary.map((trigger) => (
          <Card key={trigger.label}>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle>{trigger.label}</CardTitle>
                <Badge>{trigger.count} logged</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{trigger.averageIntensity}/10</p>
              <p className="mt-1 text-sm text-muted-foreground">Average intensity from trigger logs and episodes</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Recent trigger events</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {state.triggers.slice(0, 8).map((trigger) => (
            <div key={trigger.id} className="rounded-md border p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">{trigger.label}</p>
                <Badge>{trigger.intensity}/10</Badge>
              </div>
              {trigger.context ? <p className="mt-1 text-sm text-muted-foreground">{trigger.context}</p> : null}
              <p className="mt-2 text-xs text-muted-foreground">{formatDateLabel(trigger.createdAt)}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
