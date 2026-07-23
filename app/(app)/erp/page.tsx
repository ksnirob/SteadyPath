"use client";

import { Clock, Info, Pause, Play, Plus, ShieldCheck, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRecoveryData } from "@/lib/recovery-store";

type ActiveSession = {
  exerciseId: string;
  sessionId: string;
  title: string;
  startedAt: number;
};

export default function ErpPage() {
  const { state, actions } = useRecoveryData();
  const [showForm, setShowForm] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [anxietyBefore, setAnxietyBefore] = useState(6);
  const [anxietyAfter, setAnxietyAfter] = useState(3);
  const [successRating, setSuccessRating] = useState(7);
  const [finishNotes, setFinishNotes] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!activeSession) return;
    const interval = window.setInterval(() => {
      setSeconds(Math.max(0, Math.round((Date.now() - activeSession.startedAt) / 1000)));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [activeSession]);

  const timerLabel = useMemo(() => {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
    const remainingSeconds = (seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${remainingSeconds}`;
  }, [seconds]);

  function addExposure(formData: FormData) {
    const title = String(formData.get("title") || "").trim();
    if (!title) return;

    actions.addErpExercise({
      title,
      fearedOutcome: String(formData.get("fearedOutcome") || "").trim(),
      responsePrevention: String(formData.get("responsePrevention") || "").trim(),
      difficulty: Number(formData.get("difficulty") || 5),
      hierarchyRank: state.erpExercises.length + 1,
      notes: String(formData.get("notes") || "").trim()
    });
    setShowForm(false);
    setMessage("Exposure added to your hierarchy.");
  }

  function startExercise(exerciseId: string, title: string) {
    const session = actions.startErpSession(exerciseId, anxietyBefore);
    setActiveSession({ exerciseId, sessionId: session.id, title, startedAt: Date.now() });
    setSeconds(0);
    setMessage(`Started "${title}". Do the exposure and prevent the compulsion.`);
  }

  function completeExercise() {
    if (!activeSession) return;
    actions.completeErpSession(
      activeSession.exerciseId,
      activeSession.sessionId,
      seconds,
      anxietyAfter,
      successRating,
      finishNotes
    );
    setMessage(`Completed "${activeSession.title}". ERP history and dashboard updated.`);
    setActiveSession(null);
    setSeconds(0);
    setFinishNotes("");
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Exposure and response prevention</p>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">ERP hierarchy</h1>
            <button
              type="button"
              className="grid h-9 w-9 place-items-center rounded-md border bg-card text-muted-foreground transition hover:bg-muted hover:text-foreground"
              onClick={() => setShowInfo((value) => !value)}
              aria-label="How ERP works"
              aria-expanded={showInfo}
              aria-controls="erp-info-panel"
            >
              <Info className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>
        <Button onClick={() => setShowForm((value) => !value)}>
          <ShieldCheck className="h-4 w-4" aria-hidden />
          New exposure
        </Button>
      </header>

      {showInfo ? (
        <div className="fixed inset-0 z-50 bg-background/70 p-4 backdrop-blur-sm" onClick={() => setShowInfo(false)}>
          <Card
            id="erp-info-panel"
            className="mx-auto mt-16 w-full max-w-md shadow-lg"
            role="dialog"
            aria-modal="true"
            aria-label="How ERP works"
            onClick={(event) => event.stopPropagation()}
          >
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <CardTitle>How ERP works</CardTitle>
              <button
                type="button"
                className="grid h-9 w-9 place-items-center rounded-md hover:bg-muted"
                onClick={() => setShowInfo(false)}
                aria-label="Close ERP info"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <div className="rounded-md bg-muted p-3">
                <p className="font-medium">1. Pick an obsession trigger</p>
                <p className="mt-1 text-muted-foreground">Choose a feared situation from your hierarchy, starting manageable.</p>
              </div>
              <div className="rounded-md bg-muted p-3">
                <p className="font-medium">2. Expose on purpose</p>
                <p className="mt-1 text-muted-foreground">Let uncertainty and anxiety be present without solving them.</p>
              </div>
              <div className="rounded-md bg-muted p-3">
                <p className="font-medium">3. Prevent response</p>
                <p className="mt-1 text-muted-foreground">Do not check, wash, ask, repeat, confess, review, or neutralize.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {message ? (
        <div className="rounded-md border bg-card p-3 text-sm font-medium" role="status">
          {message}
        </div>
      ) : null}

      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>Create exposure</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={addExposure} className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium">
                Exposure
                <Input name="title" placeholder="Touch doorknob, then wait" required />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Difficulty 0-10
                <Input name="difficulty" type="number" min="0" max="10" defaultValue="5" />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Feared outcome
                <Textarea name="fearedOutcome" placeholder="What does OCD say will happen?" />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Response prevention plan
                <Textarea name="responsePrevention" placeholder="Which compulsion will you not do?" />
              </label>
              <label className="grid gap-2 text-sm font-medium md:col-span-2">
                Notes
                <Textarea name="notes" placeholder="Starting duration, safety behaviors to avoid, next step..." />
              </label>
              <div className="flex gap-2 md:col-span-2">
                <Button type="submit">
                  <Plus className="h-4 w-4" aria-hidden />
                  Add exposure
                </Button>
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {activeSession ? (
        <Card>
          <CardContent className="grid gap-4 p-4 lg:grid-cols-[1fr_320px]">
            <div>
              <p className="text-sm text-muted-foreground">Active ERP session</p>
              <p className="text-xl font-semibold">{activeSession.title}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Stay with the trigger. Let anxiety move on its own. The goal is resisting the compulsion, not feeling calm instantly.
              </p>
            </div>
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-3xl font-semibold">{timerLabel}</span>
                <Button variant="secondary" onClick={() => setActiveSession(null)}>
                  <Pause className="h-4 w-4" aria-hidden />
                  Pause
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="grid gap-1 text-sm font-medium">
                  Anxiety after
                  <Input type="number" min="0" max="10" value={anxietyAfter} onChange={(event) => setAnxietyAfter(Number(event.target.value))} />
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Success 0-10
                  <Input type="number" min="0" max="10" value={successRating} onChange={(event) => setSuccessRating(Number(event.target.value))} />
                </label>
              </div>
              <Textarea value={finishNotes} onChange={(event) => setFinishNotes(event.target.value)} placeholder="What did you resist? What did you learn?" />
              <Button onClick={completeExercise}>
                <ShieldCheck className="h-4 w-4" aria-hidden />
                Complete session
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-3">
        {state.erpExercises.map((exercise) => (
          <Card key={exercise.id}>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle>{exercise.title}</CardTitle>
                <Badge>{exercise.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Difficulty {exercise.difficulty}/10</span>
                <span>{exercise.completion}% complete</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-2 rounded-full bg-primary" style={{ width: `${exercise.completion}%` }} />
              </div>
              <div className="rounded-md bg-muted p-3 text-sm">
                <p className="font-medium">Response prevention</p>
                <p className="mt-1 text-muted-foreground">{exercise.responsePrevention || "No response prevention plan yet."}</p>
              </div>
              <label className="grid gap-2 text-sm font-medium">
                Anxiety before
                <Input type="number" min="0" max="10" value={anxietyBefore} onChange={(event) => setAnxietyBefore(Number(event.target.value))} />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary" onClick={() => startExercise(exercise.id, exercise.title)}>
                  <Clock className="h-4 w-4" aria-hidden />
                  Timer
                </Button>
                <Button onClick={() => startExercise(exercise.id, exercise.title)}>
                  <Play className="h-4 w-4" aria-hidden />
                  Start
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">{exercise.history.filter((session) => session.completedAt).length} completed session(s)</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
