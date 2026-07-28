"use client";

import { ArrowDownToLine, ArrowRight, ArrowUpToLine, BookOpen, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { saveRecoveryState, type RecoveryState, useRecoveryData } from "@/lib/recovery-store";

const workflowItems: { href: "/triggers" | "/erp" | "/episodes" | "/insights"; title: string; text: string }[] = [
  {
    href: "/triggers",
    title: "1. Identify triggers",
    text: "Recurring fears and situations feed trigger averages."
  },
  {
    href: "/erp",
    title: "2. Build ERP plan",
    text: "Turn triggers into hierarchy items and response prevention."
  },
  {
    href: "/episodes",
    title: "3. Log episodes",
    text: "Episodes update calendar, trigger counts, and anxiety trends."
  },
  {
    href: "/insights",
    title: "4. Review progress",
    text: "Completed sessions and check-ins become progress signals."
  }
];

export default function SettingsPage() {
  const { setTheme } = useTheme();
  const { state, actions } = useRecoveryData();
  const toast = useToast();

  function exportJson() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `steady-path-export-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Export downloaded");
  }

  function deleteData() {
    actions.clearAllData();
    toast.destructive("Local data deleted", "All local recovery data was removed from this browser.");
  }

  async function pushLocalToDatabase() {
    const response = await fetch("/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state)
    });

    if (!response.ok) {
      toast.destructive("Database push failed", "Check DATABASE_URL and redeploy/server logs.");
      return;
    }

    const result = (await response.json()) as {
      counts: { episodes: number; checkIns: number; erpExercises: number; triggers: number; journals: number };
    };

    toast.success(
      "Local data pushed",
      `${result.counts.triggers} triggers, ${result.counts.episodes} episodes, ${result.counts.erpExercises} ERP items, ${result.counts.journals} journals, and ${result.counts.checkIns} check-ins saved to DB.`
    );
  }

  async function loadFromDatabase() {
    const response = await fetch("/api/sync");

    if (!response.ok) {
      toast.destructive("Database load failed", "Check DATABASE_URL and redeploy/server logs.");
      return;
    }

    const remoteState = (await response.json()) as RecoveryState;
    saveRecoveryState(remoteState);
    toast.success(
      "Database loaded",
      `${remoteState.triggers.length} triggers, ${remoteState.episodes.length} episodes, ${remoteState.erpExercises.length} ERP items, ${remoteState.journals.length} journals, and ${remoteState.checkIns.length} check-ins loaded.`
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <p className="text-sm font-medium text-muted-foreground">Privacy, access, and preferences</p>
        <h1 className="text-2xl font-semibold">Settings</h1>
      </header>
      <Card>
        <CardHeader><CardTitle>Theme</CardTitle></CardHeader>
        <CardContent className="flex gap-2">
          <Button variant="secondary" onClick={() => setTheme("light")}><Sun className="h-4 w-4" aria-hidden />Light</Button>
          <Button variant="secondary" onClick={() => setTheme("dark")}><Moon className="h-4 w-4" aria-hidden />Dark</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Data and privacy</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Button onClick={pushLocalToDatabase}>
            <ArrowUpToLine className="h-4 w-4" aria-hidden />
            Push local to DB
          </Button>
          <Button variant="secondary" onClick={loadFromDatabase}>
            <ArrowDownToLine className="h-4 w-4" aria-hidden />
            Load from DB
          </Button>
          <Button variant="secondary" onClick={exportJson}>Export JSON</Button>
          <Button variant="secondary">Notification preferences</Button>
          <Button variant="destructive" onClick={deleteData}>Delete local data</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" aria-hidden />
            Recovery workflow
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
          {workflowItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex min-h-28 flex-col justify-between rounded-md border bg-card p-4 transition hover:border-primary hover:bg-muted/50"
            >
              <span>
                <span className="block font-medium">{item.title}</span>
                <span className="mt-2 block text-muted-foreground">{item.text}</span>
              </span>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">
                Open <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" aria-hidden />
              </span>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
