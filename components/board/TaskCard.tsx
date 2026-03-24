"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { TaskWithRelations } from "@/lib/types";
import { useUIStore } from "@/store/board.store";
import "@/styles/components/_task-card.scss";

const PRIORITY_ICONS: Record<string, string> = {
  LOW: "▽",
  MEDIUM: "◇",
  HIGH: "▲",
  CRITICAL: "⬆",
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "#22c55e",
  MEDIUM: "#f59e0b",
  HIGH: "#f97316",
  CRITICAL: "#ef4444",
};

function formatDate(date: Date | null) {
  if (!date) return null;
  const d = new Date(date);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  const label = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });

  if (days < 0) return { label, cls: "task-card__due-date--overdue" };
  if (days <= 2) return { label, cls: "task-card__due-date--soon" };
  return { label, cls: "" };
}

interface TaskCardProps {
  task: TaskWithRelations;
}

export function TaskCard({ task }: TaskCardProps) {
  const { openTaskModal } = useUIStore();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id, data: { task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const due = task.dueDate ? formatDate(task.dueDate) : null;
  const priorityCls = `priority-${task.priority.toLowerCase()}`;

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        ["--priority-color" as string]: PRIORITY_COLORS[task.priority],
      }}
      className={`task-card ${priorityCls} ${isDragging ? "task-card--dragging" : ""}`}
      onClick={() => openTaskModal(undefined, task)}
      {...attributes}
      {...listeners}
    >
      <div className="task-card__header">
        <span className="task-card__title">{task.title}</span>
        <span
          className="task-card__priority"
          style={{
            background: `${PRIORITY_COLORS[task.priority]}22`,
            color: PRIORITY_COLORS[task.priority],
          }}
          title={task.priority}
        >
          {PRIORITY_ICONS[task.priority]}
        </span>
      </div>

      {task.labels.length > 0 && (
        <div className="task-card__labels">
          {task.labels.map((label) => (
            <span
              key={label.id}
              className="task-card__label"
              style={{
                background: `${label.color}22`,
                color: label.color,
                border: `1px solid ${label.color}44`,
              }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      <div className="task-card__footer">
        {due ? (
          <span className={`task-card__due-date ${due.cls}`}>
            📅 {due.label}
          </span>
        ) : (
          <span />
        )}

        {task.assignee && (
          <div className="task-card__assignee" title={task.assignee.name ?? ""}>
            {task.assignee.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={task.assignee.image}
                alt={task.assignee.name ?? ""}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              task.assignee.name?.charAt(0).toUpperCase()
            )}
          </div>
        )}
      </div>
    </div>
  );
}
