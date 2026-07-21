"use client";

import { Clock, Pause, Play, Plus, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { erpExercises as initialExercises } from "@/lib/mock-data";

type Exercise = {
  title: string;
  difficulty: number;
  completion: number;
  status: string;
  notes?: string;
};

export default function ErpPage() {
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises);
  const [showForm, setShowForm] = useState(false);
  const [activeTitle, setActiveTitle] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!activeTitle) return;
    const interval = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(interval);
  }, [activeTitle]);

  const timerLabel = useMemo(() => {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
    const remainingSeconds = (seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${remainingSeconds}`;
  }, [seconds]);

  function addExposure(formData: FormData) {
    const title = String(formData.get("title") || "").trim();
    if (!title) return;

    const nextExercise: Exercise = {
      title,
      difficulty: Number(formData.get("difficulty") || 5),
      completion: 0,
      status: "Planned",
      notes: String(formData.get("notes") || "")
    };

    setExercises((current) => [nextExercise, ...current]);
    setShowForm(false);
    setMessage("Exposure added.");
  }

  function startExercise(title: string) {
    setActiveTitle(title);
    setSeconds(0);
    setExercises((current) =>
      current.map((exercise) => (exercise.title === title ? { ...exercise, status: "In progress" } : exercise))
    );
    setMessage(`Started "${title}".`);
  }

  function completeExercise(title: string) {
    setActiveTitle(null);
    setExercises((current) =>
      current.map((exercise) =>
        exercise.title === title ? { ...exercise, completion: 100, status: "Completed" } : exercise
      )
    );
    setMessage(`Completed "${title}".`);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Exposure and response prevention</p>
          <h1 className="text-2xl font-semibold">ERP hierarchy</h1>
        </div>
        <Button onClick={() => setShowForm((value) => !value)}>
          <ShieldCheck className="h-4 w-4" aria-hidden />
          New exposure
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
            <CardTitle>Create exposure</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={addExposure} className="grid gap-4 md:grid-cols-[1fr_160px]">
              <label className="grid gap-2 text-sm font-medium">
                Exposure
                <Input name="title" placeholder="Example: touch doorknob, wait 10 minutes" required />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Difficulty
                <Input name="difficulty" type="number" min="0" max="10" defaultValue="5" />
              </label>
              <label className="grid gap-2 text-sm font-medium md:col-span-2">
                Notes
                <Textarea name="notes" placeholder="Response prevention plan, safety behaviors to avoid..." />
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

      {activeTitle ? (
        <Card>
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active ERP timer</p>
              <p className="text-xl font-semibold">{activeTitle}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-2xl font-semibold">{timerLabel}</span>
              <Button variant="secondary" onClick={() => setActiveTitle(null)}>
                <Pause className="h-4 w-4" aria-hidden />
                Pause
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-3">
        {exercises.map((exercise) => (
          <Card key={exercise.title}>
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
              <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary" onClick={() => startExercise(exercise.title)}>
                  <Clock className="h-4 w-4" aria-hidden />
                  Timer
                </Button>
                <Button
                  onClick={() =>
                    activeTitle === exercise.title ? completeExercise(exercise.title) : startExercise(exercise.title)
                  }
                >
                  <Play className="h-4 w-4" aria-hidden />
                  {activeTitle === exercise.title ? "Complete" : "Start"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
