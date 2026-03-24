import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { TaskStatus, TaskPriority } from "@prisma/client";

const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional().nullable(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  dueDate: z.string().optional().nullable(),
  assigneeId: z.string().optional().nullable(),
  labelIds: z.array(z.string()).optional(),
  position: z.number().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = updateTaskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { labelIds, dueDate, ...data } = parsed.data;

    const task = await prisma.task.update({
      where: { id: params.id },
      data: {
        ...data,
        dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : undefined,
        labels: labelIds ? { set: labelIds.map((id) => ({ id })) } : undefined,
      },
      include: {
        assignee: { select: { id: true, name: true, image: true } },
        creator: { select: { id: true, name: true, image: true } },
        labels: true,
      },
    });

    return NextResponse.json({ task });
  } catch (error) {
    console.error("Update task error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.task.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
