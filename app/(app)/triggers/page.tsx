"use client";

import { MoreHorizontal, Pencil, Plus, Repeat2, ShieldCheck, Trash2, X, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoPopover } from "@/components/ui/info-popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { formatDateLabel, triggerSummary, useRecoveryData } from "@/lib/recovery-store";

export default function TriggersPage() {
  const { state, actions } = useRecoveryData();
  const toast = useToast();
  const [showForm, setShowForm] = useState(false);
  const [showLogExisting, setShowLogExisting] = useState(false);
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [openMenuLabel, setOpenMenuLabel] = useState<string | null>(null);
  const summary = triggerSummary(state);
  const existingTriggerLabels = summary.map((trigger) => trigger.label);
  const editingTrigger = editingLabel
    ? state.triggers.find((trigger) => trigger.label.trim().toLowerCase() === editingLabel.trim().toLowerCase())
    : null;

  function addTrigger(formData: FormData) {
    const label = String(formData.get("label") || "").trim();
    if (!label) return;

    actions.addTrigger({
      label,
      intensity: Number(formData.get("intensity") || 5),
      context: String(formData.get("context") || "").trim()
    });
    setShowForm(false);
    toast.success("Trigger added", "Dashboard and Insights updated.");
  }

  function logExistingTrigger(formData: FormData) {
    const label = String(formData.get("existingLabel") || "").trim();
    if (!label) return;

    actions.addTrigger({
      label,
      intensity: Number(formData.get("existingIntensity") || 5),
      context: String(formData.get("existingContext") || "").trim()
    });
    setShowLogExisting(false);
    toast.success("Trigger logged", `${label} count and average intensity updated.`);
  }

  function updateTrigger(formData: FormData) {
    if (!editingLabel) return;
    const label = String(formData.get("label") || "").trim();
    if (!label) return;

    actions.updateTriggerLabel(editingLabel, {
      label,
      intensity: Number(formData.get("intensity") || editingTrigger?.intensity || 5),
      context: String(formData.get("context") || "").trim()
    });
    setEditingLabel(null);
    toast.success("Trigger updated", "Trigger logs, episodes, and ERP plans were updated.");
  }

  function deleteTrigger(label: string) {
    actions.deleteTriggerLabel(label);
    toast.destructive("Trigger deleted", "Matching trigger logs were removed and linked episode/ERP labels were cleared.");
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Pattern library</p>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">Triggers</h1>
            <InfoPopover label="How trigger intensity is calculated" title="Average intensity">
              Average intensity is calculated from manual trigger logs and episode trigger anxiety ratings.
            </InfoPopover>
          </div>
        </div>
        <div className="grid gap-2 sm:flex">
          <Button onClick={() => setShowForm((value) => !value)}>
            <Zap className="h-4 w-4" aria-hidden />
            Add trigger
          </Button>
          <Button variant="secondary" onClick={() => setShowLogExisting(true)} disabled={!existingTriggerLabels.length}>
            <Repeat2 className="h-4 w-4" aria-hidden />
            Log existing
          </Button>
        </div>
      </header>

      {showForm ? (
        <div className="fixed inset-0 z-50 bg-background/70 p-4 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <Card
            className="mx-auto mt-10 max-h-[calc(100vh-5rem)] w-full max-w-md overflow-y-auto shadow-lg"
            role="dialog"
            aria-modal="true"
            aria-label="New trigger"
            onClick={(event) => event.stopPropagation()}
          >
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <CardTitle>New trigger</CardTitle>
              <button
                type="button"
                className="grid h-9 w-9 place-items-center rounded-md hover:bg-muted"
                onClick={() => setShowForm(false)}
                aria-label="Close new trigger"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </CardHeader>
            <CardContent>
              <form action={addTrigger} className="grid gap-4">
                <label className="grid gap-2 text-sm font-medium">
                  Trigger label
                  <Input name="label" placeholder="Example: uncertainty at work" required />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Intensity
                  <Input name="intensity" type="number" min="1" max="10" defaultValue="5" />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Context
                  <Textarea name="context" placeholder="Where did it happen? What made it stronger or easier?" />
                </label>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
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
        </div>
      ) : null}

      {showLogExisting ? (
        <div className="fixed inset-0 z-50 bg-background/70 p-4 backdrop-blur-sm" onClick={() => setShowLogExisting(false)}>
          <Card
            className="mx-auto mt-16 w-full max-w-md shadow-lg"
            role="dialog"
            aria-modal="true"
            aria-label="Log existing trigger"
            onClick={(event) => event.stopPropagation()}
          >
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <CardTitle>Log existing trigger</CardTitle>
              <button
                type="button"
                className="grid h-9 w-9 place-items-center rounded-md hover:bg-muted"
                onClick={() => setShowLogExisting(false)}
                aria-label="Close log existing trigger"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </CardHeader>
            <CardContent>
              <form action={logExistingTrigger} className="grid gap-4">
                <label className="grid gap-2 text-sm font-medium">
                  Existing trigger
                  <select name="existingLabel" className="h-11 rounded-md border bg-background px-3 text-sm">
                    {existingTriggerLabels.map((label) => (
                      <option key={label} value={label}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Intensity
                  <Input name="existingIntensity" type="number" min="1" max="10" defaultValue="5" />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Context
                  <Textarea name="existingContext" placeholder="What happened this time?" />
                </label>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    <Zap className="h-4 w-4" aria-hidden />
                    Log again
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => setShowLogExisting(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {editingLabel ? (
        <div className="fixed inset-0 z-50 bg-background/70 p-4 backdrop-blur-sm" onClick={() => setEditingLabel(null)}>
          <Card
            className="mx-auto mt-10 max-h-[calc(100vh-5rem)] w-full max-w-md overflow-y-auto shadow-lg"
            role="dialog"
            aria-modal="true"
            aria-label="Edit trigger"
            onClick={(event) => event.stopPropagation()}
          >
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <CardTitle>Edit trigger</CardTitle>
              <button
                type="button"
                className="grid h-9 w-9 place-items-center rounded-md hover:bg-muted"
                onClick={() => setEditingLabel(null)}
                aria-label="Close edit trigger"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </CardHeader>
            <CardContent>
              <form action={updateTrigger} className="grid gap-4">
                <label className="grid gap-2 text-sm font-medium">
                  Trigger label
                  <Input name="label" defaultValue={editingLabel} required />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Intensity
                  <Input name="intensity" type="number" min="1" max="10" defaultValue={editingTrigger?.intensity || 5} />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Context
                  <Textarea name="context" defaultValue={editingTrigger?.context || ""} />
                </label>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    <Pencil className="h-4 w-4" aria-hidden />
                    Update trigger
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => setEditingLabel(null)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2">
        {summary.map((trigger) => (
          <Card key={trigger.label} className="overflow-hidden transition hover:border-primary hover:shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle>{trigger.label}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge>{trigger.count} logged</Badge>
                  <div className="relative">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => setOpenMenuLabel((current) => (current === trigger.label ? null : trigger.label))}
                      aria-label={`More actions for ${trigger.label}`}
                    >
                      <MoreHorizontal className="h-5 w-5" aria-hidden />
                    </Button>
                    {openMenuLabel === trigger.label ? (
                      <div className="absolute right-0 top-10 z-20 grid w-36 gap-1 rounded-md border bg-card p-1 shadow-lg">
                        <button
                          type="button"
                          className="flex h-9 items-center gap-2 rounded-md px-3 text-left text-sm hover:bg-muted"
                          onClick={() => {
                            setEditingLabel(trigger.label);
                            setOpenMenuLabel(null);
                          }}
                        >
                          <Pencil className="h-4 w-4" aria-hidden />
                          Edit
                        </button>
                        <button
                          type="button"
                          className="flex h-9 items-center gap-2 rounded-md px-3 text-left text-sm text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            deleteTrigger(trigger.label);
                            setOpenMenuLabel(null);
                          }}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                          Delete
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-end justify-between gap-3">
                <p className="text-3xl font-semibold">{trigger.averageIntensity}/10</p>
                <p className="pb-1 text-xs text-muted-foreground">Average intensity</p>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-2 rounded-full bg-primary" style={{ width: `${trigger.averageIntensity * 10}%` }} />
              </div>
              <Link
                href={`/erp?trigger=${encodeURIComponent(trigger.label)}`}
                className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-md bg-muted px-3 text-sm font-medium transition hover:bg-muted/80"
              >
                <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
                Plan ERP
              </Link>
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
            <div key={trigger.id} className="rounded-md border bg-card p-3 transition hover:border-primary hover:bg-muted/50">
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
