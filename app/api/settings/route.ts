import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";

const updateSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  bio: z.string().max(300).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, image: true, bio: true, createdAt: true },
  });

  return NextResponse.json({ user });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { name, bio, currentPassword, newPassword } = parsed.data;
    const updateData: Record<string, string> = {};

    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;

    if (newPassword) {
      const user = await prisma.user.findUnique({ where: { id: session.user.id } });
      if (user?.password) {
        if (!currentPassword) {
          return NextResponse.json({ error: "Current password required" }, { status: 400 });
        }
        const valid = await bcrypt.compare(currentPassword, user.password);
        if (!valid) {
          return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
        }
      }
      updateData.password = await bcrypt.hash(newPassword, 12);
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: { id: true, name: true, email: true, image: true, bio: true },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
