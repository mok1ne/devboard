import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { TaskStatus, TaskPriority } from "@prisma/client";

const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus).default("BACKLOG"),
  priority: z.nativeEnum(TaskPriority).default("MEDIUM"),
  dueDate: z.string().optional().nullable(),
  assigneeId: z.string().optional().nullable(),
  labelIds: z.array(z.string()).optional(),
  projectId: z.string(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) return NextResponse.json({ error: "projectId required" }, { status: 400 });

  const tasks = await prisma.task.findMany({
    where: { projectId },
    include: {
      assignee: { select: { id: true, name: true, image: true } },
      creator: { select: { id: true, name: true, image: true } },
      labels: true,
    },
    orderBy: [{ status: "asc" }, { position: "asc" }],
  });

  return NextResponse.json({ tasks });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = createTaskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { labelIds, dueDate, ...data } = parsed.data;

    // Count tasks in the column for position
    const count = await prisma.task.count({
      where: { projectId: data.projectId, status: data.status },
    });

    const task = await prisma.task.create({
      data: {
        ...data,
        dueDate: dueDate ? new Date(dueDate) : null,
        creatorId: session.user.id,
        position: count,
        labels: labelIds ? { connect: labelIds.map((id) => ({ id })) } : undefined,
      },
      include: {
        assignee: { select: { id: true, name: true, image: true } },
        creator: { select: { id: true, name: true, image: true } },
        labels: true,
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error("Create task error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
