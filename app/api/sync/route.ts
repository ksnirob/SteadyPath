import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const moodSchema = z.enum(["VERY_LOW", "LOW", "NEUTRAL", "GOOD", "GREAT"]);

const recoveryStateSchema = z.object({
  episodes: z.array(
    z.object({
      id: z.string(),
      occurredAt: z.string(),
      intrusiveThought: z.string(),
      trigger: z.string().optional(),
      compulsion: z.string().optional(),
      anxietyLevel: z.number(),
      resistedCompulsion: z.boolean(),
      durationMinutes: z.number().optional(),
      notes: z.string().optional(),
      mood: moodSchema
    })
  ),
  checkIns: z.array(
    z.object({
      id: z.string(),
      date: z.string(),
      anxietyLevel: z.number(),
      mood: moodSchema,
      sleepHours: z.number().optional(),
      energyLevel: z.number().optional(),
      notes: z.string().optional()
    })
  ),
  erpExercises: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      triggerLabel: z.string().optional(),
      fearedOutcome: z.string(),
      responsePrevention: z.string(),
      difficulty: z.number(),
      hierarchyRank: z.number(),
      completion: z.number(),
      status: z.enum(["Planned", "In progress", "Completed", "Skipped"]),
      notes: z.string().optional(),
      history: z.array(
        z.object({
          id: z.string(),
          exerciseId: z.string(),
          startedAt: z.string(),
          pausedAt: z.string().optional(),
          completedAt: z.string().optional(),
          durationSeconds: z.number(),
          anxietyBefore: z.number(),
          anxietyAfter: z.number().optional(),
          successRating: z.number().optional(),
          notes: z.string().optional()
        })
      )
    })
  ),
  triggers: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      context: z.string().optional(),
      intensity: z.number(),
      createdAt: z.string()
    })
  ),
  journals: z.array(
    z.object({
      id: z.string(),
      date: z.string(),
      mood: moodSchema,
      gratitude: z.string().optional(),
      wins: z.string().optional(),
      challenges: z.string().optional(),
      body: z.string(),
      syncedAt: z.string().nullable().optional()
    })
  )
});

const statusMap = {
  Planned: "PLANNED",
  "In progress": "IN_PROGRESS",
  Completed: "COMPLETED",
  Skipped: "SKIPPED"
} as const;

function asDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = recoveryStateSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const state = parsed.data;
  const user = await prisma.user.upsert({
    where: { email: "local@steady-path.app" },
    update: { name: "Local Steady Path User", timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC" },
    create: { email: "local@steady-path.app", name: "Local Steady Path User" }
  });

  await prisma.$transaction([
    prisma.ocdEpisode.deleteMany({ where: { userId: user.id } }),
    prisma.dailyCheckIn.deleteMany({ where: { userId: user.id } }),
    prisma.erpExercise.deleteMany({ where: { userId: user.id } }),
    prisma.journalEntry.deleteMany({ where: { userId: user.id } }),
    prisma.triggerEvent.deleteMany({ where: { userId: user.id } })
  ]);

  const createOperations = [];

  if (state.episodes.length) {
    createOperations.push(
      prisma.ocdEpisode.createMany({
        data: state.episodes.map((episode) => ({
          id: episode.id,
          userId: user.id,
          occurredAt: asDate(episode.occurredAt),
          intrusiveThought: episode.intrusiveThought,
          trigger: episode.trigger,
          compulsion: episode.compulsion,
          anxietyLevel: episode.anxietyLevel,
          resistedCompulsion: episode.resistedCompulsion,
          durationMinutes: episode.durationMinutes,
          notes: episode.notes,
          mood: episode.mood
        }))
      })
    );
  }

  if (state.checkIns.length) {
    createOperations.push(
      prisma.dailyCheckIn.createMany({
        data: state.checkIns.map((checkIn) => ({
          id: checkIn.id,
          userId: user.id,
          date: asDate(checkIn.date),
          anxietyLevel: checkIn.anxietyLevel,
          mood: checkIn.mood,
          sleepHours: checkIn.sleepHours,
          energyLevel: checkIn.energyLevel,
          notes: checkIn.notes
        }))
      })
    );
  }

  if (state.erpExercises.length) {
    createOperations.push(
      prisma.erpExercise.createMany({
        data: state.erpExercises.map((exercise) => {
          const completedSessions = exercise.history.filter((session) => session.completedAt);
          const latestCompleted = completedSessions[0];
          const totalSeconds = completedSessions.reduce((sum, session) => sum + session.durationSeconds, 0);
          const sessionNotes = exercise.history.length
            ? `\n\nSession history:\n${JSON.stringify(exercise.history, null, 2)}`
            : "";

          return {
            id: exercise.id,
            userId: user.id,
            title: exercise.title,
            description: `${exercise.triggerLabel ? `Trigger practiced: ${exercise.triggerLabel}\n\n` : ""}${exercise.fearedOutcome}\n\nResponse prevention: ${exercise.responsePrevention}`,
            hierarchyRank: exercise.hierarchyRank,
            difficulty: exercise.difficulty,
            status: statusMap[exercise.status],
            completionPercent: exercise.completion,
            successRating: latestCompleted?.successRating,
            timerSeconds: totalSeconds || undefined,
            notes: `${exercise.notes || ""}${sessionNotes}`.trim() || undefined,
            completedAt: latestCompleted?.completedAt ? asDate(latestCompleted.completedAt) : undefined
          };
        })
      })
    );
  }

  if (state.journals.length) {
    createOperations.push(
      prisma.journalEntry.createMany({
        data: state.journals.map((journal) => ({
          id: journal.id,
          userId: user.id,
          date: asDate(journal.date),
          mood: journal.mood,
          gratitude: journal.gratitude,
          wins: journal.wins,
          challenges: journal.challenges,
          body: journal.body,
          syncedAt: new Date()
        }))
      })
    );
  }

  if (state.triggers.length) {
    createOperations.push(
      prisma.triggerEvent.createMany({
        data: state.triggers.map((trigger) => ({
          id: trigger.id,
          userId: user.id,
          label: trigger.label,
          context: trigger.context,
          intensity: trigger.intensity,
          createdAt: asDate(trigger.createdAt)
        }))
      })
    );
  }

  if (createOperations.length) {
    await prisma.$transaction(createOperations);
  }

  return NextResponse.json({
    user: user.email,
    counts: {
      episodes: state.episodes.length,
      checkIns: state.checkIns.length,
      erpExercises: state.erpExercises.length,
      triggers: state.triggers.length,
      journals: state.journals.length
    }
  });
}
