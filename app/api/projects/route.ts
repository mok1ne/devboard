import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createProjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  description: z.string().max(300).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#6366f1"),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { ownerId: session.user.id },
        { members: { some: { userId: session.user.id } } },
      ],
    },
    include: {
      members: { include: { user: { select: { id: true, name: true, image: true, email: true } } } },
      _count: { select: { tasks: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ projects });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createProjectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        ...parsed.data,
        ownerId: session.user.id,
        members: {
          create: { userId: session.user.id, role: "OWNER" },
        },
      },
      include: {
        members: { include: { user: { select: { id: true, name: true, image: true, email: true } } } },
        _count: { select: { tasks: true } },
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
