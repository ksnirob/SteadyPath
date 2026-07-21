import { z } from "zod";

export const episodeSchema = z.object({
  occurredAt: z.string().min(1, "Date and time are required"),
  intrusiveThought: z.string().min(3, "Add the intrusive thought"),
  trigger: z.string().optional(),
  compulsion: z.string().optional(),
  anxietyLevel: z.coerce.number().min(0).max(10),
  resistedCompulsion: z.boolean(),
  durationMinutes: z.coerce.number().min(0).max(1440).optional(),
  notes: z.string().optional(),
  mood: z.enum(["VERY_LOW", "LOW", "NEUTRAL", "GOOD", "GREAT"])
});

export type EpisodeInput = z.infer<typeof episodeSchema>;

export const journalSchema = z.object({
  mood: z.enum(["VERY_LOW", "LOW", "NEUTRAL", "GOOD", "GREAT"]),
  gratitude: z.string().optional(),
  wins: z.string().optional(),
  challenges: z.string().optional(),
  body: z.string().min(1, "Journal notes cannot be empty")
});

export type JournalInput = z.infer<typeof journalSchema>;
