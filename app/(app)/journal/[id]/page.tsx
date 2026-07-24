"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CalendarDays, Edit3, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { formatDateLabel, formatTimeLabel, useRecoveryData } from "@/lib/recovery-store";

export default function JournalDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { state, actions } = useRecoveryData();
  const toast = useToast();
  const entry = state.journals.find((journal) => journal.id === params.id);

  function deleteEntry() {
    if (!entry) return;
    const confirmed = window.confirm("Delete this journal entry? This removes it from Journal, Dashboard, Calendar, and Insights.");
    if (!confirmed) return;

    actions.deleteJournal(entry.id);
    toast.destructive("Journal deleted", "Connected views were updated.");
    router.push("/journal");
  }

  if (!entry) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Link href="/journal" className="inline-flex items-center gap-2 text-sm font-medium text-primary">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to journal
        </Link>
        <Card>
          <CardContent className="p-6">
            <p className="font-medium">Journal entry not found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              It may have been deleted, or this browser does not have that local entry saved.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/journal" className="inline-flex items-center gap-2 text-sm font-medium text-primary">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to journal
          </Link>
          <h1 className="mt-3 text-2xl font-semibold">{entry.wins || entry.gratitude || "Journal entry"}</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" aria-hidden />
            {formatDateLabel(entry.date)} at {formatTimeLabel(entry.date)}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Link
            href={`/journal?edit=${entry.id}`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-muted px-3 text-sm font-medium text-foreground transition hover:bg-muted/80"
          >
            <Edit3 className="h-4 w-4" aria-hidden />
            Edit
          </Link>
          <Button type="button" variant="secondary" onClick={deleteEntry}>
            <Trash2 className="h-4 w-4" aria-hidden />
            Delete
          </Button>
        </div>
      </header>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>Journal details</CardTitle>
            <Badge>{entry.mood.replace("_", " ")}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-md border p-3">
              <p className="text-xs font-medium text-muted-foreground">Gratitude</p>
              <p className="mt-1 text-sm">{entry.gratitude || "Not added"}</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-xs font-medium text-muted-foreground">Win</p>
              <p className="mt-1 text-sm">{entry.wins || "Not added"}</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-xs font-medium text-muted-foreground">Challenge</p>
              <p className="mt-1 text-sm">{entry.challenges || "Not added"}</p>
            </div>
          </div>
          <div className="rounded-md bg-muted p-4">
            <p className="text-sm font-medium">Notes</p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{entry.body}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
