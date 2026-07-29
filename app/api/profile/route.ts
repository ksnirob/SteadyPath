import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const profileSchema = z.object({
  name: z.string().trim().max(80).optional(),
  email: z.string().trim().email(),
  timezone: z.string().trim().min(1).max(80)
});

const passwordSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8),
  confirmPassword: z.string().min(8)
});

async function getCurrentUser() {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase() || "local@steady-path.app";

  return prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: session?.user?.name || "Local Steady Path User",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
    }
  });
}

export async function GET() {
  const user = await getCurrentUser();

  return NextResponse.json({
    name: user.name || "",
    email: user.email,
    timezone: user.timezone
  });
}

export async function PATCH(request: Request) {
  const payload = await request.json();
  const parsed = profileSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Please enter a valid profile." }, { status: 400 });
  }

  const currentUser = await getCurrentUser();
  const nextEmail = parsed.data.email.toLowerCase();
  const emailOwner = await prisma.user.findUnique({ where: { email: nextEmail } });

  if (emailOwner && emailOwner.id !== currentUser.id) {
    return NextResponse.json({ error: "That email is already used by another account." }, { status: 409 });
  }

  const user = await prisma.user.update({
    where: { id: currentUser.id },
    data: {
      name: parsed.data.name || null,
      email: nextEmail,
      timezone: parsed.data.timezone
    }
  });

  return NextResponse.json({
    name: user.name || "",
    email: user.email,
    timezone: user.timezone
  });
}

export async function PUT(request: Request) {
  const payload = await request.json();
  const parsed = passwordSchema.safeParse(payload);

  if (!parsed.success || parsed.data.newPassword !== parsed.data.confirmPassword) {
    return NextResponse.json({ error: "Passwords must match and be at least 8 characters." }, { status: 400 });
  }

  const user = await getCurrentUser();

  if (user.passwordHash) {
    const validCurrentPassword = await bcrypt.compare(parsed.data.currentPassword || "", user.passwordHash);
    if (!validCurrentPassword) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
    }
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash }
  });

  return NextResponse.json({ ok: true });
}
