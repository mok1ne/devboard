import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tasks = await prisma.task.findMany({
    where: { assigneeId: session.user.id },
    include: {
      assignee: { select: { id: true, name: true, image: true } },
      creator: { select: { id: true, name: true, image: true } },
      labels: true,
      project: { select: { id: true, name: true, color: true } },
    },
    orderBy: [{ dueDate: "asc" }, { priority: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ tasks });
}
