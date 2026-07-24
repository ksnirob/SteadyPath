"use client";

import { Clock, Keyboard, Pause, Play, Plus, ShieldCheck, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoPopover } from "@/components/ui/info-popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { useRecoveryData } from "@/lib/recovery-store";

type ActiveSession = {
  exerciseId: string;
  sessionId: string;
  title: string;
  startedAt: number;
  accumulatedSeconds: number;
  paused: boolean;
};

const magicalThinkingTypingPlan = {
  title: "Type D once without retyping",
  fearedOutcome: "Seeing or typing the letter D may trigger the thought dementia, and OCD may demand certainty that it means nothing.",
  responsePrevention:
    "Type the letter or D-word one time, do not delete/retype it for a good feeling, do not replace the word, do not check symptoms, and continue the sentence while allowing uncertainty.",
  difficulty: 4,
  notes:
    "Start with 5 minutes. Type simple D-words once: day, door, done, dream. Then practice harder words or phrases like dementia, maybe I have dementia maybe I do not. The win is preventing the ritual, not making the thought disappear."
};

export default function ErpPage() {
  const { state, actions } = useRecoveryData();
  const toast = useToast();
  const [showForm, setShowForm] = useState(false);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [anxietyBefore, setAnxietyBefore] = useState(6);
  const [anxietyAfter, setAnxietyAfter] = useState(3);
  const [successRating, setSuccessRating] = useState(7);
  const [finishNotes, setFinishNotes] = useState("");
  const activeSessionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!activeSession || activeSession.paused) return;
    const interval = window.setInterval(() => {
      setSeconds(
        Math.max(0, activeSession.accumulatedSeconds + Math.round((Date.now() - activeSession.startedAt) / 1000))
      );
    }, 1000);
    return () => window.clearInterval(interval);
  }, [activeSession]);

  useEffect(() => {
    if (activeSession) return;

    const exercise = state.erpExercises.find((item) => item.history.some((session) => !session.completedAt));
    const session = exercise?.history.find((item) => !item.completedAt);
    if (!exercise || !session) return;

    const restoredSeconds = session.pausedAt
      ? session.durationSeconds
      : Math.max(0, session.durationSeconds + Math.round((Date.now() - new Date(session.startedAt).getTime()) / 1000));

    setActiveSession({
      exerciseId: exercise.id,
      sessionId: session.id,
      title: exercise.title,
      startedAt: new Date(session.startedAt).getTime(),
      accumulatedSeconds: session.durationSeconds,
      paused: Boolean(session.pausedAt)
    });
    setSeconds(restoredSeconds);
    setAnxietyBefore(session.anxietyBefore);
  }, [activeSession, state.erpExercises]);

  useEffect(() => {
    if (!activeSession) return;
    window.setTimeout(() => {
      activeSessionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
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
    toast.success("Exposure added", "It is now in your ERP hierarchy.");
  }

  function addMagicalThinkingPlan() {
    const alreadyAdded = state.erpExercises.some((exercise) => exercise.title === magicalThinkingTypingPlan.title);

    if (alreadyAdded) {
      toast.info("Plan already added", "You can start it from your ERP hierarchy.");
      return;
    }

    actions.addTrigger({
      label: "Magical thinking with letter D",
      intensity: 6,
      context: "Typing D or D-words triggers dementia fear and the urge to retype until it feels right."
    });

    actions.addErpExercise({
      ...magicalThinkingTypingPlan,
      hierarchyRank: state.erpExercises.length + 1
    });

    toast.success("Action plan added", "Trigger and ERP hierarchy updated.");
  }

  function startExercise(exerciseId: string, title: string) {
    const session = actions.startErpSession(exerciseId, anxietyBefore);
    setActiveSession({ exerciseId, sessionId: session.id, title, startedAt: Date.now(), accumulatedSeconds: 0, paused: false });
    setSeconds(0);
    toast.info("ERP session started", `"${title}" is active.`);
  }

  function togglePause() {
    if (!activeSession) return;

    if (activeSession.paused) {
      actions.resumeErpSession(activeSession.exerciseId, activeSession.sessionId);
      setActiveSession({ ...activeSession, startedAt: Date.now(), paused: false });
      toast.info("Session resumed", "Keep preventing the response until you complete the session.");
      return;
    }

    const elapsed = activeSession.accumulatedSeconds + Math.round((Date.now() - activeSession.startedAt) / 1000);
    setSeconds(elapsed);
    actions.pauseErpSession(activeSession.exerciseId, activeSession.sessionId, elapsed);
    setActiveSession({ ...activeSession, accumulatedSeconds: elapsed, paused: true });
    toast.info("Session paused", "Paused time is not counted or saved until you resume or complete.");
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
    toast.success("ERP session completed", "ERP history, dashboard, calendar, and insights updated.");
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
            <InfoPopover label="How ERP works" title="How ERP works">
              <span className="grid gap-3">
                <span className="block rounded-md bg-muted p-3">
                  <span className="block font-medium text-foreground">1. Pick an obsession trigger</span>
                  <span className="mt-1 block">Choose a feared situation from your hierarchy, starting manageable.</span>
                </span>
                <span className="block rounded-md bg-muted p-3">
                  <span className="block font-medium text-foreground">2. Expose on purpose</span>
                  <span className="mt-1 block">Let uncertainty and anxiety be present without solving them.</span>
                </span>
                <span className="block rounded-md bg-muted p-3">
                  <span className="block font-medium text-foreground">3. Prevent response</span>
                  <span className="mt-1 block">Do not check, wash, ask, repeat, confess, review, or neutralize.</span>
                </span>
              </span>
            </InfoPopover>
          </div>
        </div>
        <Button onClick={() => setShowForm((value) => !value)}>
          <ShieldCheck className="h-4 w-4" aria-hidden />
          New exposure
        </Button>
      </header>

      {showForm ? (
        <div className="fixed inset-0 z-50 bg-background/70 p-4 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <Card
            className="mx-auto mt-10 max-h-[calc(100vh-5rem)] w-full max-w-2xl overflow-y-auto shadow-lg"
            role="dialog"
            aria-modal="true"
            aria-label="Create exposure"
            onClick={(event) => event.stopPropagation()}
          >
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <CardTitle>Create exposure</CardTitle>
              <button
                type="button"
                className="grid h-9 w-9 place-items-center rounded-md hover:bg-muted"
                onClick={() => setShowForm(false)}
                aria-label="Close create exposure"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
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
                  <Button type="submit" className="flex-1 sm:flex-none">
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
        </div>
      ) : null}

      {activeSession ? (
        <div ref={activeSessionRef} className="scroll-mt-24 lg:scroll-mt-4">
          <Card className="border-primary/40 shadow-md shadow-primary/10">
            <CardContent className="grid gap-4 p-4 lg:grid-cols-[1fr_320px]">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">Active ERP session</p>
                  <InfoPopover label="Active ERP guidance" title="During ERP">
                    Stay with the trigger. Let anxiety move on its own. The goal is resisting the compulsion, not feeling
                    calm instantly.
                  </InfoPopover>
                </div>
                <p className="mt-2 text-xl font-semibold">{activeSession.title}</p>
              </div>
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-3xl font-semibold">{timerLabel}</span>
                  <Button variant="secondary" onClick={togglePause}>
                    {activeSession.paused ? <Play className="h-4 w-4" aria-hidden /> : <Pause className="h-4 w-4" aria-hidden />}
                    {activeSession.paused ? "Resume" : "Pause"}
                  </Button>
                </div>
                {activeSession.paused ? (
                  <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                    Session paused. The timer is stopped, and nothing is saved as completed until you press Complete session.
                  </div>
                ) : null}
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
        </div>
      ) : null}

      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="flex items-center gap-2 text-sm font-medium text-primary">
                <Keyboard className="h-4 w-4" aria-hidden />
                Suggested plan for magical thinking OCD
              </p>
              <CardTitle className="mt-2">Typing D without retyping</CardTitle>
            </div>
            <Button onClick={addMagicalThinkingPlan}>
              <Plus className="h-4 w-4" aria-hidden />
              Add action plan
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-3">
          <div className="rounded-md border bg-card p-3">
            <p className="font-medium">Trigger</p>
            <p className="mt-1 text-muted-foreground">Typing D or D-words brings the thought dementia.</p>
          </div>
          <div className="rounded-md border bg-card p-3">
            <p className="font-medium">Exposure</p>
            <p className="mt-1 text-muted-foreground">Type D once, then type D-words once, and leave them unchanged.</p>
          </div>
          <div className="rounded-md border bg-card p-3">
            <p className="font-medium">Response prevention</p>
            <p className="mt-1 text-muted-foreground">No retyping, replacing, checking, symptom searching, or waiting for a good thought.</p>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 lg:grid-cols-3">
        {state.erpExercises.map((exercise) => (
          <Card key={exercise.id} className="overflow-hidden transition hover:border-primary hover:shadow-sm">
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
                <p className="flex items-center gap-2 font-medium">
                  <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
                  Response prevention
                </p>
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
