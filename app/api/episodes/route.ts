import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { episodeSchema } from "@/lib/validation";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json([]);

  const episodes = await prisma.ocdEpisode.findMany({
    where: { userId: user.id, deletedAt: null },
    orderBy: { occurredAt: "desc" },
    take: 50
  });

  return NextResponse.json(episodes);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = await request.json();
  const parsed = episodeSchema.safeParse(payload);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const episode = await prisma.ocdEpisode.create({
    data: {
      userId: user.id,
      occurredAt: new Date(parsed.data.occurredAt),
      intrusiveThought: parsed.data.intrusiveThought,
      trigger: parsed.data.trigger,
      compulsion: parsed.data.compulsion,
      anxietyLevel: parsed.data.anxietyLevel,
      resistedCompulsion: parsed.data.resistedCompulsion,
      durationMinutes: parsed.data.durationMinutes,
      notes: parsed.data.notes,
      mood: parsed.data.mood
    }
  });

  return NextResponse.json(episode, { status: 201 });
}
