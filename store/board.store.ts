import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { TaskWithRelations, TaskStatus, ProjectWithRelations } from "@/lib/types";

interface BoardState {
  tasks: TaskWithRelations[];
  project: ProjectWithRelations | null;
  isLoading: boolean;
  activeTask: TaskWithRelations | null;
  filterAssignee: string | null;
  filterPriority: string | null;
  searchQuery: string;

  // Actions
  setProject: (project: ProjectWithRelations) => void;
  setTasks: (tasks: TaskWithRelations[]) => void;
  setLoading: (loading: boolean) => void;
  setActiveTask: (task: TaskWithRelations | null) => void;
  addTask: (task: TaskWithRelations) => void;
  updateTask: (taskId: string, updates: Partial<TaskWithRelations>) => void;
  removeTask: (taskId: string) => void;
  moveTask: (taskId: string, newStatus: TaskStatus, newPosition: number) => void;
  setFilter: (key: "filterAssignee" | "filterPriority", value: string | null) => void;
  setSearchQuery: (query: string) => void;
  getFilteredTasks: () => TaskWithRelations[];
}

export const useBoardStore = create<BoardState>()(
  immer((set, get) => ({
    tasks: [],
    project: null,
    isLoading: false,
    activeTask: null,
    filterAssignee: null,
    filterPriority: null,
    searchQuery: "",

    setProject: (project) => set({ project }),
    setTasks: (tasks) => set({ tasks }),
    setLoading: (isLoading) => set({ isLoading }),
    setActiveTask: (activeTask) => set({ activeTask }),

    addTask: (task) =>
      set((state) => {
        state.tasks.push(task);
      }),

    updateTask: (taskId, updates) =>
      set((state) => {
        const idx = state.tasks.findIndex((t) => t.id === taskId);
        if (idx !== -1) Object.assign(state.tasks[idx], updates);
      }),

    removeTask: (taskId) =>
      set((state) => {
        state.tasks = state.tasks.filter((t) => t.id !== taskId);
      }),

    moveTask: (taskId, newStatus, newPosition) =>
      set((state) => {
        const task = state.tasks.find((t) => t.id === taskId);
        if (task) {
          task.status = newStatus;
          task.position = newPosition;
        }
      }),

    setFilter: (key, value) => set({ [key]: value }),
    setSearchQuery: (searchQuery) => set({ searchQuery }),

    getFilteredTasks: () => {
      const { tasks, filterAssignee, filterPriority, searchQuery } = get();
      return tasks.filter((task) => {
        if (filterAssignee && task.assigneeId !== filterAssignee) return false;
        if (filterPriority && task.priority !== filterPriority) return false;
        if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
      });
    },
  }))
);

// UI store
interface UIState {
  sidebarOpen: boolean;
  theme: "light" | "dark";
  taskModalOpen: boolean;
  editingTask: TaskWithRelations | null;
  createTaskStatus: TaskStatus | null;

  toggleSidebar: () => void;
  toggleTheme: () => void;
  openTaskModal: (status?: TaskStatus, task?: TaskWithRelations) => void;
  closeTaskModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  theme: "dark",
  taskModalOpen: false,
  editingTask: null,
  createTaskStatus: null,

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleTheme: () => set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
  openTaskModal: (status, task) =>
    set({ taskModalOpen: true, createTaskStatus: status ?? null, editingTask: task ?? null }),
  closeTaskModal: () =>
    set({ taskModalOpen: false, editingTask: null, createTaskStatus: null }),
}));
