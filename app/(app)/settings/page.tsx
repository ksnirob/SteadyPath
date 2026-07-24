"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { useRecoveryData } from "@/lib/recovery-store";

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

  function resetDemo() {
    actions.resetDemoData();
    toast.success("Demo data restored");
  }

  function deleteData() {
    actions.clearAllData();
    toast.destructive("Local data deleted", "All local recovery data was removed from this browser.");
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
          <Button variant="secondary" onClick={exportJson}>Export JSON</Button>
          <Button variant="secondary" onClick={resetDemo}>Reset demo data</Button>
          <Button variant="secondary">Notification preferences</Button>
          <Button variant="destructive" onClick={deleteData}>Delete local data</Button>
        </CardContent>
      </Card>
    </div>
  );
}
