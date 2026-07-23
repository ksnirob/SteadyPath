"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRecoveryData } from "@/lib/recovery-store";

export default function SettingsPage() {
  const { setTheme } = useTheme();
  const { state, actions } = useRecoveryData();
  const [message, setMessage] = useState("");

  function exportJson() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `steady-path-export-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage("Export downloaded.");
  }

  function resetDemo() {
    actions.resetDemoData();
    setMessage("Demo data restored.");
  }

  function deleteData() {
    actions.clearAllData();
    setMessage("All local recovery data deleted.");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <p className="text-sm font-medium text-muted-foreground">Privacy, access, and preferences</p>
        <h1 className="text-2xl font-semibold">Settings</h1>
      </header>
      {message ? (
        <div className="rounded-md border bg-card p-3 text-sm font-medium" role="status">
          {message}
        </div>
      ) : null}
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
          <Button variant="secondary" onClick={exportJson}>Export JSON</Button>
          <Button variant="secondary" onClick={resetDemo}>Reset demo data</Button>
          <Button variant="secondary">Notification preferences</Button>
          <Button variant="destructive" onClick={deleteData}>Delete local data</Button>
        </CardContent>
      </Card>
    </div>
  );
}
