import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.pinnedProject.findUnique({
    where: { userId_projectId: { userId: session.user.id, projectId: params.id } },
  });

  if (existing) {
    await prisma.pinnedProject.delete({ where: { id: existing.id } });
    return NextResponse.json({ pinned: false });
  } else {
    await prisma.pinnedProject.create({
      data: { userId: session.user.id, projectId: params.id },
    });
    return NextResponse.json({ pinned: true });
  }
}
