import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  name: z.string().trim().max(80).optional(),
  email: z.string().trim().email(),
  password: z.string().min(8)
});

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = registerSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Please enter a valid email and an 8+ character password." }, { status: 400 });
  }

  const { email, name, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();
  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (existingUser) {
    return NextResponse.json({ error: "An account already exists for that email." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      name: name || undefined,
      passwordHash,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
    },
    select: {
      id: true,
      email: true
    }
  });

  return NextResponse.json({ user }, { status: 201 });
}
