"use client";

import { MoreHorizontal, Pause, Pencil, Play, Plus, ShieldCheck, Trash2, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
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

export default function ErpPage() {
  return (
    <Suspense fallback={<div className="space-y-6" />}>
      <ErpPageContent />
    </Suspense>
  );
}

function ErpPageContent() {
  const { state, actions } = useRecoveryData();
  const toast = useToast();
  const searchParams = useSearchParams();
  const [showForm, setShowForm] = useState(false);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [anxietyBefore, setAnxietyBefore] = useState(6);
  const [anxietyAfter, setAnxietyAfter] = useState(3);
  const [successRating, setSuccessRating] = useState(7);
  const [finishNotes, setFinishNotes] = useState("");
  const [practiceText, setPracticeText] = useState("");
  const [showPracticeNotes, setShowPracticeNotes] = useState(false);
  const [showMobileResponsePrevention, setShowMobileResponsePrevention] = useState(false);
  const activeSessionRef = useRef<HTMLDivElement | null>(null);
  const triggerLabels = useMemo(
    () => Array.from(new Set(state.triggers.map((trigger) => trigger.label.trim()).filter(Boolean))),
    [state.triggers]
  );
  const selectedTriggerFromUrl = searchParams.get("trigger") || "";
  const editingExercise = editingExerciseId
    ? state.erpExercises.find((exercise) => exercise.id === editingExerciseId)
    : null;
  const activeExercise = activeSession
    ? state.erpExercises.find((exercise) => exercise.id === activeSession.exerciseId)
    : null;

  useEffect(() => {
    if (selectedTriggerFromUrl) setShowForm(true);
  }, [selectedTriggerFromUrl]);

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
    const input = {
      title,
      triggerLabel: String(formData.get("triggerLabel") || "").trim() || undefined,
      fearedOutcome: String(formData.get("fearedOutcome") || "").trim(),
      responsePrevention: String(formData.get("responsePrevention") || "").trim(),
      difficulty: Number(formData.get("difficulty") || 5),
      hierarchyRank: editingExercise?.hierarchyRank || state.erpExercises.length + 1,
      notes: String(formData.get("notes") || "").trim()
    };

    if (editingExerciseId) {
      actions.updateErpExercise(editingExerciseId, input);
      toast.success("Exposure updated", "ERP hierarchy and sync data updated.");
    } else {
      actions.addErpExercise(input);
      toast.success("Exposure added", "It is now in your ERP hierarchy.");
    }
    setEditingExerciseId(null);
    setShowForm(false);
  }

  function closeForm() {
    setEditingExerciseId(null);
    setShowForm(false);
  }

  function editExercise(exerciseId: string) {
    setEditingExerciseId(exerciseId);
    setOpenMenuId(null);
    setShowForm(true);
  }

  function deleteExercise(exerciseId: string) {
    actions.deleteErpExercise(exerciseId);
    setOpenMenuId(null);
    toast.destructive("Exposure deleted", "The ERP item and its sessions were removed.");
  }

  function startExercise(exerciseId: string, title: string) {
    const session = actions.startErpSession(exerciseId, anxietyBefore);
    setActiveSession({ exerciseId, sessionId: session.id, title, startedAt: Date.now(), accumulatedSeconds: 0, paused: false });
    setSeconds(0);
    setPracticeText("");
    setFinishNotes("");
    setShowPracticeNotes(false);
    setShowMobileResponsePrevention(false);
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
    const sessionNotes = [
      practiceText.trim() ? `Practice text:\n${practiceText.trim()}` : "",
      finishNotes.trim() ? `Session notes:\n${finishNotes.trim()}` : ""
    ]
      .filter(Boolean)
      .join("\n\n");
    actions.completeErpSession(
      activeSession.exerciseId,
      activeSession.sessionId,
      seconds,
      anxietyAfter,
      successRating,
      sessionNotes
    );
    toast.success("ERP session completed", "ERP history, dashboard, calendar, and insights updated.");
    setActiveSession(null);
    setSeconds(0);
    setFinishNotes("");
    setPracticeText("");
    setShowPracticeNotes(false);
    setShowMobileResponsePrevention(false);
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
        <Button
          onClick={() => {
            setEditingExerciseId(null);
            setShowForm((value) => !value);
          }}
        >
          <ShieldCheck className="h-4 w-4" aria-hidden />
          New exposure
        </Button>
      </header>

      {showForm ? (
        <div className="fixed inset-0 z-50 bg-background/70 p-4 backdrop-blur-sm" onClick={closeForm}>
          <Card
            className="mx-auto mt-10 max-h-[calc(100vh-5rem)] w-full max-w-2xl overflow-y-auto shadow-lg"
            role="dialog"
            aria-modal="true"
            aria-label="Create exposure"
            onClick={(event) => event.stopPropagation()}
          >
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <CardTitle>{editingExerciseId ? "Edit exposure" : "Create exposure"}</CardTitle>
              <button
                type="button"
                className="grid h-9 w-9 place-items-center rounded-md hover:bg-muted"
                onClick={closeForm}
                aria-label="Close create exposure"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </CardHeader>
            <CardContent>
              <form action={addExposure} className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium md:col-span-2">
                  Trigger this exposure practices
                  <select
                    name="triggerLabel"
                    className="h-11 rounded-md border bg-background px-3 text-sm"
                    defaultValue={editingExercise?.triggerLabel || selectedTriggerFromUrl}
                  >
                    <option value="">No trigger selected</option>
                    {triggerLabels.map((label) => (
                      <option key={label} value={label}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <span className="text-xs font-normal text-muted-foreground">
                    ERP is often planned from a trigger. This link is for planning only; trigger counts still come from trigger logs and episodes.
                  </span>
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Exposure
                  <Input name="title" placeholder="Touch doorknob, then wait" defaultValue={editingExercise?.title || ""} required />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Difficulty 0-10
                  <Input name="difficulty" type="number" min="0" max="10" defaultValue={editingExercise?.difficulty || 5} />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Feared outcome
                  <Textarea name="fearedOutcome" placeholder="What does OCD say will happen?" defaultValue={editingExercise?.fearedOutcome || ""} />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Response prevention plan
                  <Textarea name="responsePrevention" placeholder="Which compulsion will you not do?" defaultValue={editingExercise?.responsePrevention || ""} />
                </label>
                <label className="grid gap-2 text-sm font-medium md:col-span-2">
                  Notes
                  <Textarea name="notes" placeholder="Starting duration, safety behaviors to avoid, next step..." defaultValue={editingExercise?.notes || ""} />
                </label>
                <div className="flex gap-2 md:col-span-2">
                  <Button type="submit" className="flex-1 sm:flex-none">
                    <Plus className="h-4 w-4" aria-hidden />
                    {editingExerciseId ? "Update exposure" : "Add exposure"}
                  </Button>
                  <Button type="button" variant="secondary" onClick={closeForm}>
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
          <Card className="overflow-hidden border-primary/40 shadow-md shadow-primary/10">
            <CardContent className="!p-0">
              <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
                <div className="grid h-full gap-4 bg-primary/5 p-4 sm:gap-5 sm:p-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-primary text-primary-foreground">Active ERP</Badge>
                      <InfoPopover label="Active ERP guidance" title="During ERP">
                        Stay with the trigger. Let anxiety move on its own. The goal is resisting the compulsion, not feeling
                        calm instantly.
                      </InfoPopover>
                    </div>
                    <h2 className="mt-3 max-w-2xl text-xl font-semibold leading-tight sm:mt-4 sm:text-2xl">
                      {activeSession.title}
                    </h2>
                  </div>
                  {activeExercise?.responsePrevention ? (
                    <>
                      <div className="grid grid-cols-2 gap-2 md:hidden">
                        <button
                          type="button"
                          className="flex min-h-10 items-center justify-between gap-2 rounded-md bg-background/70 px-3 py-2 text-left text-sm font-medium"
                          onClick={() => setShowMobileResponsePrevention((value) => !value)}
                          aria-expanded={showMobileResponsePrevention}
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            <ShieldCheck className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                            <span className="truncate">{showMobileResponsePrevention ? "Hide Response" : "Show Response"}</span>
                          </span>
                        </button>
                        <label className="flex min-h-10 cursor-pointer items-center gap-2 rounded-md bg-background/70 px-3 py-2 text-sm font-medium">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-border accent-primary"
                            checked={showPracticeNotes}
                            onChange={(event) => setShowPracticeNotes(event.target.checked)}
                          />
                          <span className="truncate">Practice notes</span>
                        </label>
                      </div>
                      <div
                        className={
                          showMobileResponsePrevention
                            ? "rounded-md border bg-background/80 p-4 text-sm"
                            : "hidden rounded-md border bg-background/80 p-4 text-sm md:block"
                        }
                      >
                        <p className="hidden items-center gap-2 font-medium md:flex">
                          <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
                          Response prevention
                        </p>
                        <p className="text-muted-foreground md:mt-1">{activeExercise.responsePrevention}</p>
                      </div>
                    </>
                  ) : (
                    <div className="rounded-md border bg-background/80 p-4 text-sm text-muted-foreground">
                      Keep doing the exposure and prevent the ritual. You do not need a good thought before moving on.
                    </div>
                  )}
                  <Textarea
                    className="hidden min-h-36 resize-y bg-background text-base leading-relaxed md:block"
                    value={practiceText}
                    onChange={(event) => setPracticeText(event.target.value)}
                    placeholder="Practice notes"
                  />
                </div>
                <div className="grid gap-3 border-t p-4 sm:gap-4 sm:p-6 lg:border-l lg:border-t-0">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Timer</p>
                      <span className="mt-1 block font-mono text-4xl font-semibold leading-none">{timerLabel}</span>
                    </div>
                    <Button variant="secondary" onClick={togglePause}>
                      {activeSession.paused ? <Play className="h-4 w-4" aria-hidden /> : <Pause className="h-4 w-4" aria-hidden />}
                      {activeSession.paused ? "Resume" : "Pause"}
                    </Button>
                  </div>
                  {activeSession.paused ? (
                    <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                      Session paused. The timer is stopped, and nothing is saved as completed until you press Complete
                      session.
                    </div>
                  ) : null}
                  <label className="hidden cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-sm">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-border accent-primary"
                      checked={showPracticeNotes}
                      onChange={(event) => setShowPracticeNotes(event.target.checked)}
                    />
                    <span className="font-medium">Add practice notes</span>
                  </label>
                  {showPracticeNotes ? (
                    <Textarea
                      className="min-h-32 resize-y bg-background text-base leading-relaxed md:hidden"
                      value={practiceText}
                      onChange={(event) => setPracticeText(event.target.value)}
                      placeholder="Practice notes"
                    />
                  ) : null}
                  <div className="grid grid-cols-2 gap-3">
                    <label className="grid gap-1.5 text-sm font-medium">
                      Anxiety after
                      <Input type="number" min="0" max="10" value={anxietyAfter} onChange={(event) => setAnxietyAfter(Number(event.target.value))} />
                    </label>
                    <label className="grid gap-1.5 text-sm font-medium">
                      Success 0-10
                      <Input type="number" min="0" max="10" value={successRating} onChange={(event) => setSuccessRating(Number(event.target.value))} />
                    </label>
                  </div>
                  <Textarea
                    className="min-h-28"
                    value={finishNotes}
                    onChange={(event) => setFinishNotes(event.target.value)}
                    placeholder="What did you resist? What did you learn?"
                  />
                  <Button className="h-11" onClick={completeExercise}>
                    <ShieldCheck className="h-4 w-4" aria-hidden />
                    Complete session
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {state.erpExercises.map((exercise) => (
          <Card
            key={exercise.id}
            className="group overflow-hidden border-border/80 transition hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md hover:shadow-primary/10"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <CardTitle className="line-clamp-2 leading-snug">{exercise.title}</CardTitle>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge className="capitalize">{exercise.status}</Badge>
                    <span className="rounded-full bg-muted px-2.5 py-1">Difficulty {exercise.difficulty}/10</span>
                    <span className="rounded-full bg-muted px-2.5 py-1">
                      {exercise.history.filter((session) => session.completedAt).length} done
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <div className="relative">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => setOpenMenuId((current) => (current === exercise.id ? null : exercise.id))}
                      aria-label={`More actions for ${exercise.title}`}
                    >
                      <MoreHorizontal className="h-5 w-5" aria-hidden />
                    </Button>
                    {openMenuId === exercise.id ? (
                      <div className="absolute right-0 top-10 z-20 grid w-36 gap-1 rounded-md border bg-card p-1 shadow-lg">
                        <button
                          type="button"
                          className="flex h-9 items-center gap-2 rounded-md px-3 text-left text-sm hover:bg-muted"
                          onClick={() => editExercise(exercise.id)}
                        >
                          <Pencil className="h-4 w-4" aria-hidden />
                          Edit
                        </button>
                        <button
                          type="button"
                          className="flex h-9 items-center gap-2 rounded-md px-3 text-left text-sm text-destructive hover:bg-destructive/10"
                          onClick={() => deleteExercise(exercise.id)}
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
            <CardContent className="space-y-4 pt-0">
              {exercise.triggerLabel ? (
                <div className="rounded-md bg-muted/80 px-3 py-2 text-sm">
                  <span className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">Trigger practiced</span>
                  <span className="mt-0.5 block font-medium text-foreground">{exercise.triggerLabel}</span>
                </div>
              ) : null}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Progress</span>
                <span>{exercise.completion}% complete</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${exercise.completion}%` }} />
                </div>
              </div>
              <details className="group/details rounded-md border bg-background">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 text-sm font-medium">
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
                    Response prevention
                  </span>
                  <span className="text-xs text-muted-foreground group-open/details:hidden">Show</span>
                  <span className="hidden text-xs text-muted-foreground group-open/details:inline">Hide</span>
                </summary>
                <div className="border-t px-3 pb-3 pt-2 text-sm text-muted-foreground">
                  {exercise.responsePrevention || "No response prevention plan yet."}
                </div>
              </details>
              <div className="grid gap-3 rounded-md bg-muted/50 p-3">
                <label className="grid gap-2 text-sm font-medium">
                  Anxiety before
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    value={anxietyBefore}
                    onChange={(event) => setAnxietyBefore(Number(event.target.value))}
                  />
                </label>
                <Button className="h-11" onClick={() => startExercise(exercise.id, exercise.title)}>
                  <Play className="h-4 w-4" aria-hidden />
                  Start ERP session
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
