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
  triggerLabel?: string;
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
  pausedAt?: string;
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

const changedEvent = "steady-path-data-changed";
const oldSeedIds = new Set(["episode-1", "episode-2", "checkin-1", "erp-1", "erp-2", "trigger-1", "trigger-2", "journal-1"]);
let syncTimer: number | undefined;
let currentState: RecoveryState | undefined;

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const emptyState: RecoveryState = {
  episodes: [],
  checkIns: [],
  erpExercises: [],
  triggers: [],
  journals: []
};

export function getRecoveryState(): RecoveryState {
  return currentState ?? emptyState;
}

export function saveRecoveryState(state: RecoveryState) {
  if (typeof window === "undefined") return;
  currentState = removeOldSeedData(state);
  window.dispatchEvent(new Event(changedEvent));
  scheduleDatabaseSync(currentState);
}

export function useRecoveryData() {
  const [state, setState] = useState<RecoveryState>(emptyState);

  useEffect(() => {
    const sync = () => setState(getRecoveryState());
    sync();
    window.addEventListener(changedEvent, sync);
    return () => {
      window.removeEventListener(changedEvent, sync);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadDatabaseState() {
      try {
        const response = await fetch("/api/sync");
        if (!response.ok) return;
        const remoteState = removeOldSeedData((await response.json()) as RecoveryState);
        if (cancelled) return;
        currentState = remoteState;
        window.dispatchEvent(new Event(changedEvent));
        setState(remoteState);
      } catch {
        currentState = emptyState;
      }
    }

    void loadDatabaseState();
    return () => {
      cancelled = true;
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
      updateEpisode(episodeId: string, input: Omit<Episode, "id">) {
        const current = getRecoveryState();
        let previousTrigger: string | undefined;
        const episodes = current.episodes.map((episode) => {
          if (episode.id !== episodeId) return episode;
          previousTrigger = episode.trigger;
          return { id: episode.id, ...input };
        });
        const nextTriggerLabel = input.trigger?.trim();
        const shouldAddTrigger =
          nextTriggerLabel &&
          nextTriggerLabel.toLowerCase() !== previousTrigger?.trim().toLowerCase();

        saveRecoveryState({
          ...current,
          episodes,
          triggers: shouldAddTrigger
            ? [
              {
                id: id("trigger"),
                label: nextTriggerLabel,
                context: input.intrusiveThought,
                  intensity: input.anxietyLevel,
                  createdAt: input.occurredAt
                },
                ...current.triggers
              ]
            : current.triggers
        });
      },
      deleteEpisode(episodeId: string) {
        const current = getRecoveryState();
        saveRecoveryState({
          ...current,
          episodes: current.episodes.filter((episode) => episode.id !== episodeId)
        });
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
      updateTriggerLabel(
        oldLabel: string,
        input: { label: string; intensity?: number; context?: string }
      ) {
        const current = getRecoveryState();
        const oldKey = oldLabel.trim().toLowerCase();
        const nextLabel = input.label.trim();
        if (!oldKey || !nextLabel) return null;
        let firstManualUpdated = false;

        saveRecoveryState({
          ...current,
          triggers: current.triggers.map((trigger) => {
            if (trigger.label.trim().toLowerCase() !== oldKey) return trigger;
            const shouldUpdateDetails = !firstManualUpdated;
            firstManualUpdated = true;
            return {
              ...trigger,
              label: nextLabel,
              intensity: shouldUpdateDetails && input.intensity !== undefined ? input.intensity : trigger.intensity,
              context: shouldUpdateDetails && input.context !== undefined ? input.context : trigger.context
            };
          }),
          episodes: current.episodes.map((episode) =>
            episode.trigger?.trim().toLowerCase() === oldKey ? { ...episode, trigger: nextLabel } : episode
          ),
          erpExercises: current.erpExercises.map((exercise) =>
            exercise.triggerLabel?.trim().toLowerCase() === oldKey ? { ...exercise, triggerLabel: nextLabel } : exercise
          )
        });
        return nextLabel;
      },
      deleteTriggerLabel(label: string) {
        const current = getRecoveryState();
        const key = label.trim().toLowerCase();
        saveRecoveryState({
          ...current,
          triggers: current.triggers.filter((trigger) => trigger.label.trim().toLowerCase() !== key),
          episodes: current.episodes.map((episode) =>
            episode.trigger?.trim().toLowerCase() === key ? { ...episode, trigger: undefined } : episode
          ),
          erpExercises: current.erpExercises.map((exercise) =>
            exercise.triggerLabel?.trim().toLowerCase() === key ? { ...exercise, triggerLabel: undefined } : exercise
          )
        });
      },
      addErpExercise(input: Omit<ErpExercise, "id" | "completion" | "status" | "history">) {
        const current = getRecoveryState();
        const exercise = { id: id("erp"), completion: 0, status: "Planned" as ErpStatus, history: [], ...input };
        saveRecoveryState({ ...current, erpExercises: [exercise, ...current.erpExercises] });
        return exercise;
      },
      updateErpExercise(exerciseId: string, input: Omit<ErpExercise, "id" | "completion" | "status" | "history">) {
        const current = getRecoveryState();
        saveRecoveryState({
          ...current,
          erpExercises: current.erpExercises.map((exercise) =>
            exercise.id === exerciseId ? { ...exercise, ...input } : exercise
          )
        });
      },
      deleteErpExercise(exerciseId: string) {
        const current = getRecoveryState();
        saveRecoveryState({
          ...current,
          erpExercises: current.erpExercises.filter((exercise) => exercise.id !== exerciseId)
        });
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
      pauseErpSession(exerciseId: string, sessionId: string, durationSeconds: number) {
        const current = getRecoveryState();
        saveRecoveryState({
          ...current,
          erpExercises: current.erpExercises.map((exercise) =>
            exercise.id === exerciseId
              ? {
                  ...exercise,
                  history: exercise.history.map((session) =>
                    session.id === sessionId
                      ? { ...session, durationSeconds, pausedAt: new Date().toISOString() }
                      : session
                  )
                }
              : exercise
          )
        });
      },
      resumeErpSession(exerciseId: string, sessionId: string) {
        const current = getRecoveryState();
        saveRecoveryState({
          ...current,
          erpExercises: current.erpExercises.map((exercise) =>
            exercise.id === exerciseId
              ? {
                  ...exercise,
                  history: exercise.history.map((session) =>
                    session.id === sessionId ? { ...session, startedAt: new Date().toISOString(), pausedAt: undefined } : session
                  )
                }
              : exercise
          )
        });
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
                      pausedAt: undefined,
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
        const journal = {
          id: id("journal"),
          date: new Date().toISOString(),
          syncedAt: navigator.onLine ? new Date().toISOString() : null,
          ...input
        };
        saveRecoveryState({
          ...current,
          journals: [journal, ...current.journals]
        });
        return journal;
      },
      updateJournal(journalId: string, input: Omit<JournalEntry, "id" | "date" | "syncedAt">) {
        const current = getRecoveryState();
        let updated: JournalEntry | null = null;
        saveRecoveryState({
          ...current,
          journals: current.journals.map((journal) => {
            if (journal.id !== journalId) return journal;
            updated = {
              ...journal,
              ...input,
              syncedAt: navigator.onLine ? new Date().toISOString() : null
            };
            return updated;
          })
        });
        return updated;
      },
      deleteJournal(journalId: string) {
        const current = getRecoveryState();
        saveRecoveryState({
          ...current,
          journals: current.journals.filter((journal) => journal.id !== journalId)
        });
      },
      clearAllData() {
        saveRecoveryState({ episodes: [], checkIns: [], erpExercises: [], triggers: [], journals: [] });
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

function removeOldSeedData(state: RecoveryState) {
  const normalized: RecoveryState = {
    episodes: state.episodes.filter((item) => !oldSeedIds.has(item.id)),
    checkIns: state.checkIns.filter((item) => !oldSeedIds.has(item.id)),
    erpExercises: state.erpExercises.filter((item) => !oldSeedIds.has(item.id)),
    triggers: state.triggers.filter((item) => !oldSeedIds.has(item.id)),
    journals: state.journals.filter((item) => !oldSeedIds.has(item.id))
  };

  const changed =
    normalized.episodes.length !== state.episodes.length ||
    normalized.checkIns.length !== state.checkIns.length ||
    normalized.erpExercises.length !== state.erpExercises.length ||
    normalized.triggers.length !== state.triggers.length ||
    normalized.journals.length !== state.journals.length;

  return changed ? normalized : state;
}

function scheduleDatabaseSync(state: RecoveryState) {
  if (!navigator.onLine) return;
  window.clearTimeout(syncTimer);
  syncTimer = window.setTimeout(() => {
    void fetch("/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state),
      keepalive: true
    }).catch(() => undefined);
  }, 700);
}
