"use client";

import { useEffect, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useBoardStore, useUIStore } from "@/store/board.store";
import { KanbanColumn } from "./KanbanColumn";
import { TaskCard } from "./TaskCard";
import { TaskModal } from "./TaskModal";
import type { TaskStatus, TaskWithRelations, BoardColumn } from "@/lib/types";
import "@/styles/components/_board.scss";

const COLUMNS: TaskStatus[] = ["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];

interface BoardProps {
  projectId: string;
}

export function Board({ projectId }: BoardProps) {
  const { tasks, setTasks, setLoading, activeTask, setActiveTask, getFilteredTasks, moveTask } =
    useBoardStore();
  const { taskModalOpen } = useUIStore();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/tasks?projectId=${projectId}`);
    const data = await res.json();
    if (res.ok) setTasks(data.tasks);
    setLoading(false);
  }, [projectId, setLoading, setTasks]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const filteredTasks = getFilteredTasks();

  const columns: BoardColumn[] = COLUMNS.map((status) => ({
    id: status,
    title: status,
    tasks: filteredTasks
      .filter((t) => t.status === status)
      .sort((a, b) => a.position - b.position),
  }));

  const handleDragStart = (event: DragStartEvent) => {
    const task = event.active.data.current?.task as TaskWithRelations;
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeTask = tasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    const overId = over.id as string;
    const isOverColumn = COLUMNS.includes(overId as TaskStatus);
    const newStatus = isOverColumn
      ? (overId as TaskStatus)
      : tasks.find((t) => t.id === overId)?.status;

    if (newStatus && newStatus !== activeTask.status) {
      moveTask(activeTask.id, newStatus, 0);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeTaskData = tasks.find((t) => t.id === active.id);
    if (!activeTaskData) return;

    const overId = over.id as string;
    const isOverColumn = COLUMNS.includes(overId as TaskStatus);
    const targetStatus = isOverColumn
      ? (overId as TaskStatus)
      : tasks.find((t) => t.id === overId)?.status ?? activeTaskData.status;

    const columnTasks = tasks
      .filter((t) => t.status === targetStatus)
      .sort((a, b) => a.position - b.position);

    let newPosition = 0;
    if (!isOverColumn) {
      const overIndex = columnTasks.findIndex((t) => t.id === overId);
      newPosition = overIndex >= 0 ? overIndex : columnTasks.length;
    } else {
      newPosition = columnTasks.length;
    }

    moveTask(activeTaskData.id, targetStatus, newPosition);

    // Persist to server
    await fetch(`/api/tasks/${activeTaskData.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: targetStatus, position: newPosition }),
    });
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="board">
          {columns.map((column) => (
            <KanbanColumn key={column.id} column={column} />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>

      {taskModalOpen && <TaskModal />}
    </>
  );
}
