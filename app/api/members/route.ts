import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const inviteSchema = z.object({
  email: z.string().email(),
  projectId: z.string(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = inviteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { email, projectId } = parsed.data;

    // Check if requester is owner
    const membership = await prisma.member.findUnique({
      where: { userId_projectId: { userId: session.user.id, projectId } },
    });
    if (!membership || membership.role !== "OWNER") {
      return NextResponse.json({ error: "Only owners can invite members" }, { status: 403 });
    }

    const invitee = await prisma.user.findUnique({ where: { email } });
    if (!invitee) {
      return NextResponse.json({ error: "User with that email not found" }, { status: 404 });
    }

    const existing = await prisma.member.findUnique({
      where: { userId_projectId: { userId: invitee.id, projectId } },
    });
    if (existing) {
      return NextResponse.json({ error: "User is already a member" }, { status: 409 });
    }

    const member = await prisma.member.create({
      data: { userId: invitee.id, projectId, role: "MEMBER" },
      include: { user: { select: { id: true, name: true, image: true, email: true } } },
    });

    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    console.error("Invite member error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
