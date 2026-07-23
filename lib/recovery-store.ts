"use client";

import { useEffect, useMemo, useState } from "react";

export type Mood = "VERY_LOW" | "LOW" | "NEUTRAL" | "GOOD" | "GREAT";
export type ErpStatus = "Planned" | "In progress" | "Completed" | "Skipped";

export type Episode = {
  id: string;
  occurredAt: string;
  intrusiveThought: string;
  trigger?: string;
  compulsion?: string;
  anxietyLevel: number;
  resistedCompulsion: boolean;
  durationMinutes?: number;
  notes?: string;
  mood: Mood;
};

export type CheckIn = {
  id: string;
  date: string;
  anxietyLevel: number;
  mood: Mood;
  sleepHours?: number;
  energyLevel?: number;
  notes?: string;
};

export type ErpExercise = {
  id: string;
  title: string;
  fearedOutcome: string;
  responsePrevention: string;
  difficulty: number;
  hierarchyRank: number;
  completion: number;
  status: ErpStatus;
  notes?: string;
  history: ErpSession[];
};

export type ErpSession = {
  id: string;
  exerciseId: string;
  startedAt: string;
  completedAt?: string;
  durationSeconds: number;
  anxietyBefore: number;
  anxietyAfter?: number;
  successRating?: number;
  notes?: string;
};

export type TriggerItem = {
  id: string;
  label: string;
  context?: string;
  intensity: number;
  createdAt: string;
};

export type JournalEntry = {
  id: string;
  date: string;
  mood: Mood;
  gratitude?: string;
  wins?: string;
  challenges?: string;
  body: string;
  syncedAt?: string | null;
};

export type RecoveryState = {
  episodes: Episode[];
  checkIns: CheckIn[];
  erpExercises: ErpExercise[];
  triggers: TriggerItem[];
  journals: JournalEntry[];
};

const storageKey = "steady-path-recovery-state";
const changedEvent = "steady-path-data-changed";

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function todayAt(hour: number, minute = 0) {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

const seedState: RecoveryState = {
  episodes: [
    {
      id: "episode-1",
      occurredAt: todayAt(8, 15),
      intrusiveThought: "What if I left the door unlocked?",
      trigger: "Leaving the apartment",
      compulsion: "Door checking",
      anxietyLevel: 7,
      resistedCompulsion: true,
      durationMinutes: 12,
      mood: "NEUTRAL",
      notes: "Checked once, then left and allowed uncertainty."
    },
    {
      id: "episode-2",
      occurredAt: todayAt(12, 40),
      intrusiveThought: "What if the email sounded wrong?",
      trigger: "Email from work",
      compulsion: "Re-reading",
      anxietyLevel: 6,
      resistedCompulsion: false,
      durationMinutes: 18,
      mood: "LOW",
      notes: "Re-read several times. Good ERP target."
    }
  ],
  checkIns: [
    {
      id: "checkin-1",
      date: new Date().toISOString(),
      anxietyLevel: 4,
      mood: "GOOD",
      sleepHours: 7,
      energyLevel: 6,
      notes: "Better after morning walk."
    }
  ],
  erpExercises: [
    {
      id: "erp-1",
      title: "Touch doorknob, delay washing",
      fearedOutcome: "I may feel contaminated or unsafe.",
      responsePrevention: "Do not wash for 10 minutes; let anxiety rise and fall naturally.",
      difficulty: 6,
      hierarchyRank: 1,
      completion: 60,
      status: "In progress",
      notes: "Practice with one doorknob first.",
      history: []
    },
    {
      id: "erp-2",
      title: "Send message without re-reading",
      fearedOutcome: "The message may contain a mistake.",
      responsePrevention: "Read once, send, and do not reopen the thread for 20 minutes.",
      difficulty: 5,
      hierarchyRank: 2,
      completion: 25,
      status: "Planned",
      notes: "Start with low-stakes messages.",
      history: []
    }
  ],
  triggers: [
    {
      id: "trigger-1",
      label: "Contamination",
      context: "Touching shared objects",
      intensity: 6,
      createdAt: todayAt(9)
    },
    {
      id: "trigger-2",
      label: "Uncertainty",
      context: "Messages, locks, appliances",
      intensity: 7,
      createdAt: todayAt(10)
    }
  ],
  journals: [
    {
      id: "journal-1",
      date: new Date().toISOString(),
      mood: "GOOD",
      gratitude: "A calmer evening",
      wins: "Delayed one compulsion",
      challenges: "Morning checking urge",
      body: "ERP felt difficult but possible today.",
      syncedAt: new Date().toISOString()
    }
  ]
};

export function getRecoveryState(): RecoveryState {
  if (typeof window === "undefined") return seedState;

  const stored = window.localStorage.getItem(storageKey);
  if (!stored) {
    saveRecoveryState(seedState);
    return seedState;
  }

  try {
    return JSON.parse(stored) as RecoveryState;
  } catch {
    saveRecoveryState(seedState);
    return seedState;
  }
}

export function saveRecoveryState(state: RecoveryState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey, JSON.stringify(state));
  window.dispatchEvent(new Event(changedEvent));
}

export function useRecoveryData() {
  const [state, setState] = useState<RecoveryState>(seedState);

  useEffect(() => {
    const sync = () => setState(getRecoveryState());
    sync();
    window.addEventListener(changedEvent, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(changedEvent, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const actions = useMemo(
    () => ({
      addEpisode(input: Omit<Episode, "id">) {
        const current = getRecoveryState();
        const episode = { id: id("episode"), ...input };
        const nextTriggers = input.trigger
          ? [
              {
                id: id("trigger"),
                label: input.trigger,
                context: input.intrusiveThought,
                intensity: input.anxietyLevel,
                createdAt: input.occurredAt
              },
              ...current.triggers
            ]
          : current.triggers;

        saveRecoveryState({
          ...current,
          episodes: [episode, ...current.episodes],
          triggers: nextTriggers
        });
        return episode;
      },
      addCheckIn(input: Omit<CheckIn, "id" | "date">) {
        const current = getRecoveryState();
        const today = new Date().toDateString();
        const checkIn = { id: id("checkin"), date: new Date().toISOString(), ...input };
        saveRecoveryState({
          ...current,
          checkIns: [checkIn, ...current.checkIns.filter((item) => new Date(item.date).toDateString() !== today)]
        });
        return checkIn;
      },
      addTrigger(input: Omit<TriggerItem, "id" | "createdAt">) {
        const current = getRecoveryState();
        const trigger = { id: id("trigger"), createdAt: new Date().toISOString(), ...input };
        saveRecoveryState({ ...current, triggers: [trigger, ...current.triggers] });
        return trigger;
      },
      addErpExercise(input: Omit<ErpExercise, "id" | "completion" | "status" | "history">) {
        const current = getRecoveryState();
        const exercise = { id: id("erp"), completion: 0, status: "Planned" as ErpStatus, history: [], ...input };
        saveRecoveryState({ ...current, erpExercises: [exercise, ...current.erpExercises] });
        return exercise;
      },
      startErpSession(exerciseId: string, anxietyBefore: number) {
        const current = getRecoveryState();
        const session: ErpSession = {
          id: id("session"),
          exerciseId,
          startedAt: new Date().toISOString(),
          durationSeconds: 0,
          anxietyBefore
        };
        saveRecoveryState({
          ...current,
          erpExercises: current.erpExercises.map((exercise) =>
            exercise.id === exerciseId
              ? { ...exercise, status: "In progress", history: [session, ...exercise.history] }
              : exercise
          )
        });
        return session;
      },
      completeErpSession(exerciseId: string, sessionId: string, durationSeconds: number, anxietyAfter: number, successRating: number, notes?: string) {
        const current = getRecoveryState();
        saveRecoveryState({
          ...current,
          erpExercises: current.erpExercises.map((exercise) => {
            if (exercise.id !== exerciseId) return exercise;
            const completedCount = exercise.history.filter((session) => session.completedAt).length + 1;
            return {
              ...exercise,
              status: "Completed",
              completion: Math.min(100, Math.max(exercise.completion, completedCount * 25)),
              history: exercise.history.map((session) =>
                session.id === sessionId
                  ? {
                      ...session,
                      durationSeconds,
                      anxietyAfter,
                      successRating,
                      notes,
                      completedAt: new Date().toISOString()
                    }
                  : session
              )
            };
          })
        });
      },
      addJournal(input: Omit<JournalEntry, "id" | "date" | "syncedAt">) {
        const current = getRecoveryState();
        const today = new Date().toDateString();
        const journal = {
          id: id("journal"),
          date: new Date().toISOString(),
          syncedAt: navigator.onLine ? new Date().toISOString() : null,
          ...input
        };
        saveRecoveryState({
          ...current,
          journals: [journal, ...current.journals.filter((item) => new Date(item.date).toDateString() !== today)]
        });
        return journal;
      },
      clearAllData() {
        saveRecoveryState({ episodes: [], checkIns: [], erpExercises: [], triggers: [], journals: [] });
      },
      resetDemoData() {
        saveRecoveryState(seedState);
      }
    }),
    []
  );

  return { state, actions };
}

export function moodScore(mood: Mood) {
  return { VERY_LOW: 1, LOW: 3, NEUTRAL: 5, GOOD: 7, GREAT: 9 }[mood];
}

export function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(value));
}

export function formatTimeLabel(value: string) {
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

export function getRecoveryStats(state: RecoveryState) {
  const today = new Date().toDateString();
  const todayEpisodes = state.episodes.filter((episode) => new Date(episode.occurredAt).toDateString() === today);
  const todayCheckIn = state.checkIns.find((checkIn) => new Date(checkIn.date).toDateString() === today);
  const completedSessions = state.erpExercises.flatMap((exercise) => exercise.history).filter((session) => session.completedAt);
  const todayErpSeconds = completedSessions
    .filter((session) => new Date(session.completedAt || session.startedAt).toDateString() === today)
    .reduce((sum, session) => sum + session.durationSeconds, 0);
  const averageAnxiety =
    state.episodes.length === 0
      ? todayCheckIn?.anxietyLevel || 0
      : state.episodes.reduce((sum, episode) => sum + episode.anxietyLevel, 0) / state.episodes.length;
  const resistedCount = state.episodes.filter((episode) => episode.resistedCompulsion).length;

  return {
    todayAnxiety: todayCheckIn?.anxietyLevel ?? todayEpisodes[0]?.anxietyLevel ?? 0,
    todayEpisodes: todayEpisodes.length,
    todayErpMinutes: Math.round(todayErpSeconds / 60),
    averageAnxiety,
    resistedRate: state.episodes.length ? Math.round((resistedCount / state.episodes.length) * 100) : 0,
    completedErp: completedSessions.length,
    currentStreak: calculateCheckInStreak(state.checkIns)
  };
}

export function weeklyTrend(state: RecoveryState) {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return date;
  });

  return days.map((date) => {
    const dayItems = state.checkIns.filter((item) => new Date(item.date).toDateString() === date.toDateString());
    const dayEpisodes = state.episodes.filter((item) => new Date(item.occurredAt).toDateString() === date.toDateString());
    const anxietyValues = [...dayItems.map((item) => item.anxietyLevel), ...dayEpisodes.map((item) => item.anxietyLevel)];
    const moodValues = dayItems.map((item) => moodScore(item.mood));
    return {
      day: new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(date),
      anxiety: anxietyValues.length ? Math.round(anxietyValues.reduce((sum, value) => sum + value, 0) / anxietyValues.length) : 0,
      mood: moodValues.length ? Math.round(moodValues.reduce((sum, value) => sum + value, 0) / moodValues.length) : 0,
      episodes: dayEpisodes.length
    };
  });
}

export function triggerSummary(state: RecoveryState) {
  const counts = new Map<string, { label: string; count: number; totalIntensity: number }>();
  [...state.triggers, ...state.episodes.filter((episode) => episode.trigger).map((episode) => ({
    id: episode.id,
    label: episode.trigger || "",
    intensity: episode.anxietyLevel,
    createdAt: episode.occurredAt
  }))].forEach((trigger) => {
    const key = trigger.label.trim().toLowerCase();
    if (!key) return;
    const current = counts.get(key) || { label: trigger.label, count: 0, totalIntensity: 0 };
    counts.set(key, { ...current, count: current.count + 1, totalIntensity: current.totalIntensity + trigger.intensity });
  });

  return Array.from(counts.values())
    .map((item) => ({ ...item, averageIntensity: Math.round(item.totalIntensity / item.count) }))
    .sort((a, b) => b.count - a.count);
}

function calculateCheckInStreak(checkIns: CheckIn[]) {
  const dateSet = new Set(checkIns.map((checkIn) => new Date(checkIn.date).toDateString()));
  let streak = 0;
  const cursor = new Date();
  while (dateSet.has(cursor.toDateString())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
