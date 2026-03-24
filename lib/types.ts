import type { Task, Project, User, Label, Member, MemberRole, TaskStatus, TaskPriority } from "@prisma/client";

export type { TaskStatus, TaskPriority, MemberRole };

export type TaskWithRelations = Task & {
  assignee: Pick<User, "id" | "name" | "image"> | null;
  creator: Pick<User, "id" | "name" | "image">;
  labels: Label[];
};

export type ProjectWithRelations = Project & {
  members: (Member & { user: Pick<User, "id" | "name" | "image" | "email"> })[];
  _count: { tasks: number };
};

export type BoardColumn = {
  id: TaskStatus;
  title: string;
  tasks: TaskWithRelations[];
};

export type CreateTaskInput = {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  assigneeId?: string;
  labelIds?: string[];
  projectId: string;
};

export type UpdateTaskInput = Partial<CreateTaskInput> & {
  id: string;
};
