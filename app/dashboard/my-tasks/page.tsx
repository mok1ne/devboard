"use client";

import { useState, useEffect } from "react";
import "@/styles/pages/_dashboard.scss";
import "@/styles/components/_task-card.scss";
import "@/styles/components/_button.scss";

type Task = {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  project: { id: string; name: string; color: string };
  labels: { id: string; name: string; color: string }[];
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "#22c55e",
  MEDIUM: "#f59e0b",
  HIGH: "#f97316",
  CRITICAL: "#ef4444",
};

const STATUS_LABELS: Record<string, string> = {
  BACKLOG: "Backlog",
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
};

const STATUS_COLORS: Record<string, string> = {
  BACKLOG: "#55557a",
  TODO: "#3b82f6",
  IN_PROGRESS: "#7c6af7",
  IN_REVIEW: "#f59e0b",
  DONE: "#22c55e",
};

function isOverdue(date: string) {
  return new Date(date) < new Date();
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");

  useEffect(() => {
    fetch("/api/my-tasks")
      .then((r) => r.json())
      .then((data) => {
        setTasks(data.tasks ?? []);
        setLoading(false);
      });
  }, []);

  const filtered =
    filter === "ALL" ? tasks : tasks.filter((t) => t.status === filter);

  const grouped = {
    overdue: filtered.filter((t) => t.dueDate && isOverdue(t.dueDate) && t.status !== "DONE"),
    active: filtered.filter((t) => !t.dueDate || !isOverdue(t.dueDate) ? t.status !== "DONE" : false),
    done: filtered.filter((t) => t.status === "DONE"),
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header__title-group">
          <h1 className="page-header__title">My Tasks</h1>
          <p className="page-header__subtitle">
            {tasks.length} task{tasks.length !== 1 ? "s" : ""} assigned to you
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {["ALL", "BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`filter-bar__chip ${filter === s ? "filter-bar__chip--active" : ""}`}
          >
            {s === "ALL" ? "All" : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ color: "var(--text-muted)", padding: "40px 0", textAlign: "center" }}>
          Loading tasks...
        </div>
      ) : tasks.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
            color: "var(--text-muted)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div style={{ fontSize: 48 }}>✓</div>
          <p style={{ fontSize: 16, fontWeight: 500 }}>No tasks assigned to you</p>
          <p style={{ fontSize: 13 }}>Ask your team to assign tasks, or create some yourself</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {grouped.overdue.length > 0 && (
            <TaskGroup title="⚠ Overdue" tasks={grouped.overdue} titleColor="#ef4444" />
          )}
          {grouped.active.length > 0 && (
            <TaskGroup title="Active" tasks={grouped.active} />
          )}
          {grouped.done.length > 0 && (
            <TaskGroup title="Completed" tasks={grouped.done} titleColor="#22c55e" />
          )}
        </div>
      )}
    </div>
  );
}

function TaskGroup({
  title,
  tasks,
  titleColor,
}: {
  title: string;
  tasks: Task[];
  titleColor?: string;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: titleColor ?? "var(--text-muted)",
          marginBottom: 10,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {title}
        <span
          style={{
            background: "var(--bg-border)",
            padding: "1px 8px",
            borderRadius: 99,
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 11,
          }}
        >
          {tasks.length}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {tasks.map((task) => (
          <div
            key={task.id}
            className="task-card"
            style={{
              ["--priority-color" as string]: PRIORITY_COLORS[task.priority],
              display: "flex",
              alignItems: "center",
              gap: 16,
              opacity: task.status === "DONE" ? 0.6 : 1,
            }}
          >
            {/* Status dot */}
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: STATUS_COLORS[task.status],
                flexShrink: 0,
              }}
            />

            {/* Title */}
            <span
              style={{
                flex: 1,
                fontSize: 13,
                fontWeight: 500,
                color: "var(--text-primary)",
                textDecoration: task.status === "DONE" ? "line-through" : "none",
              }}
            >
              {task.title}
            </span>

            {/* Labels */}
            {task.labels.slice(0, 2).map((l) => (
              <span
                key={l.id}
                className="task-card__label"
                style={{ background: `${l.color}22`, color: l.color, border: `1px solid ${l.color}44` }}
              >
                {l.name}
              </span>
            ))}

            {/* Project */}
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 11,
                color: "var(--text-muted)",
                padding: "2px 8px",
                background: "var(--bg-border)",
                borderRadius: 99,
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: task.project.color,
                }}
              />
              {task.project.name}
            </span>

            {/* Priority */}
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: PRIORITY_COLORS[task.priority],
                flexShrink: 0,
              }}
            >
              {task.priority}
            </span>

            {/* Due date */}
            {task.dueDate && (
              <span
                style={{
                  fontSize: 11,
                  color: isOverdue(task.dueDate) ? "#ef4444" : "var(--text-muted)",
                  fontFamily: "JetBrains Mono, monospace",
                  flexShrink: 0,
                }}
              >
                📅 {formatDate(task.dueDate)}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
