"use client";

import { useState, useEffect } from "react";
import { useBoardStore, useUIStore } from "@/store/board.store";
import type { TaskPriority, TaskStatus } from "@/lib/types";
import "@/styles/components/_modal.scss";
import "@/styles/components/_button.scss";

const PRIORITIES: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const STATUSES: TaskStatus[] = ["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];

const STATUS_LABELS: Record<TaskStatus, string> = {
  BACKLOG: "Backlog",
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
};

export function TaskModal() {
  const { taskModalOpen, closeTaskModal, editingTask, createTaskStatus } = useUIStore();
  const { project, addTask, updateTask, removeTask } = useBoardStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("BACKLOG");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description ?? "");
      setStatus(editingTask.status);
      setPriority(editingTask.priority);
      setDueDate(
        editingTask.dueDate
          ? new Date(editingTask.dueDate).toISOString().split("T")[0]
          : ""
      );
      setAssigneeId(editingTask.assigneeId ?? "");
    } else {
      setTitle("");
      setDescription("");
      setStatus(createTaskStatus ?? "BACKLOG");
      setPriority("MEDIUM");
      setDueDate("");
      setAssigneeId("");
    }
  }, [editingTask, createTaskStatus]);

  if (!taskModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    setLoading(true);

    const body = {
      title,
      description: description || undefined,
      status,
      priority,
      dueDate: dueDate || null,
      assigneeId: assigneeId || null,
      projectId: project.id,
    };

    try {
      if (editingTask) {
        const res = await fetch(`/api/tasks/${editingTask.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (res.ok) updateTask(editingTask.id, data.task);
      } else {
        const res = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (res.ok) addTask(data.task);
      }
      closeTaskModal();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editingTask) return;
    setDeleting(true);
    await fetch(`/api/tasks/${editingTask.id}`, { method: "DELETE" });
    removeTask(editingTask.id);
    closeTaskModal();
    setDeleting(false);
  };

  const members = project?.members ?? [];

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeTaskModal()}>
      <div className="modal animate-scale-in">
        <div className="modal__header">
          <h2 className="modal__title">{editingTask ? "Edit Task" : "New Task"}</h2>
          <button className="modal__close" onClick={closeTaskModal}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal__body">
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input
                className="form-input"
                placeholder="What needs to be done?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description (Markdown)</label>
              <textarea
                className="form-textarea"
                placeholder="Add details, links, code snippets..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  className="form-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Assignee</label>
                <select
                  className="form-select"
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {members.map((m) => (
                    <option key={m.user.id} value={m.user.id}>
                      {m.user.name ?? m.user.email}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="modal__footer">
            {editingTask && (
              <button
                type="button"
                className={`btn btn--danger ${deleting ? "btn--loading" : ""}`}
                onClick={handleDelete}
                disabled={deleting}
              >
                {!deleting && "Delete"}
              </button>
            )}
            <div style={{ flex: 1 }} />
            <button type="button" className="btn btn--secondary" onClick={closeTaskModal}>
              Cancel
            </button>
            <button
              type="submit"
              className={`btn btn--primary ${loading ? "btn--loading" : ""}`}
              disabled={loading}
            >
              {!loading && (editingTask ? "Save changes" : "Create task")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
