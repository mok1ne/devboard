"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { BoardColumn } from "@/lib/types";
import { TaskCard } from "./TaskCard";
import { useUIStore } from "@/store/board.store";
import "@/styles/components/_board.scss";

const STATUS_LABELS: Record<string, string> = {
  BACKLOG: "Backlog",
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
};

const STATUS_CSS: Record<string, string> = {
  BACKLOG: "column-backlog",
  TODO: "column-todo",
  IN_PROGRESS: "column-in-progress",
  IN_REVIEW: "column-in-review",
  DONE: "column-done",
};

interface KanbanColumnProps {
  column: BoardColumn;
}

export function KanbanColumn({ column }: KanbanColumnProps) {
  const { openTaskModal } = useUIStore();
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div className={`column ${STATUS_CSS[column.id]} ${isOver ? "column--drag-over" : ""}`}>
      <div className="column__header">
        <div className="column__title-group">
          <div className="column__dot" />
          <span className="column__title">{STATUS_LABELS[column.id]}</span>
          <span className="column__count">{column.tasks.length}</span>
        </div>
        <button
          className="column__add-btn"
          onClick={() => openTaskModal(column.id)}
          title="Add task"
        >
          +
        </button>
      </div>

      <SortableContext
        id={column.id}
        items={column.tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div ref={setNodeRef} className="column__tasks">
          {column.tasks.length === 0 && (
            <div className="column__empty">
              <span style={{ fontSize: 24 }}>◌</span>
              <span>No tasks here</span>
              <span>Drop one or click +</span>
            </div>
          )}
          {column.tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
