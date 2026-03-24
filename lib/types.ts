import type { Task, Project, User, Label, Member, MemberRole, TaskStatus, TaskPriority } from "@prisma/client";

export type { TaskStatus, TaskPriority, MemberRole };

export type UserPreview = {
  id: string;
  name: string | null;
  image: string | null;
  email: string | null;
};

export type MemberWithUser = Member & {
  user: UserPreview;
};

export type TaskWithRelations = Task & {
  assignee: UserPreview | null;
  creator: UserPreview;
  labels: Label[];
};

export type ProjectWithRelations = Project & {
  members: MemberWithUser[];
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