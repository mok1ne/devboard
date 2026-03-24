"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useSession } from "next-auth/react";
import { useBoardStore } from "@/store/board.store";
import type { ProjectWithRelations } from "@/lib/types";

interface ProjectContextType {
  projects: ProjectWithRelations[];
  activeProjectId: string | null;
  pinnedProjectIds: string[];
  showInvite: boolean;
  showCreateProject: boolean;
  searchQuery: string;
  setShowInvite: (v: boolean) => void;
  setShowCreateProject: (v: boolean) => void;
  setSearchQuery: (q: string) => void;
  handleProjectSelect: (id: string) => void;
  handlePin: (id: string) => void;
  handleProjectCreated: (p: ProjectWithRelations) => void;
  handleMemberInvited: () => void;
  handleDeleteProject: (id: string) => Promise<void>;
  refetchProjects: () => void;
}

const ProjectContext = createContext<ProjectContextType | null>(null);

export function useProjectContext() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProjectContext must be used within ProjectProvider");
  return ctx;
}

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const { setProject, project } = useBoardStore();

  const [projects, setProjects] = useState<ProjectWithRelations[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [pinnedProjectIds, setPinnedProjectIds] = useState<string[]>([]);
  const [showInvite, setShowInvite] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const refetchProjects = useCallback(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => {
        if (data.projects?.length) {
          setProjects(data.projects);
          setActiveProjectId((prev) => {
            const id = prev ?? data.projects[0].id;
            const found = data.projects.find((p: ProjectWithRelations) => p.id === id);
            if (found) setProject(found);
            return found ? id : data.projects[0].id;
          });
        } else {
          setProjects([]);
          setActiveProjectId(null);
          setProject(null as unknown as ProjectWithRelations);
        }
      });
  }, [setProject]);

  useEffect(() => {
    if (session) refetchProjects();
    try {
      const saved = JSON.parse(localStorage.getItem("pinnedProjects") ?? "[]");
      setPinnedProjectIds(saved);
    } catch {}
  }, [session, refetchProjects]);

  const handleProjectSelect = (id: string) => {
    const p = projects.find((p) => p.id === id);
    if (p) { setActiveProjectId(id); setProject(p); }
  };

  const handlePin = (projectId: string) => {
    setPinnedProjectIds((prev) => {
      const next = prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId];
      localStorage.setItem("pinnedProjects", JSON.stringify(next));
      fetch(`/api/projects/${projectId}/pin`, { method: "POST" });
      return next;
    });
  };

  const handleProjectCreated = (newProject: ProjectWithRelations) => {
    setProjects((prev) => [newProject, ...prev]);
    setActiveProjectId(newProject.id);
    setProject(newProject);
  };

  const handleMemberInvited = () => refetchProjects();

  const handleDeleteProject = async (id: string) => {
    const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error ?? "Failed to delete project");
    }

    const remaining = projects.filter((p) => p.id !== id);
    setProjects(remaining);

    // Remove from pinned if pinned
    setPinnedProjectIds((prev) => {
      const next = prev.filter((pid) => pid !== id);
      localStorage.setItem("pinnedProjects", JSON.stringify(next));
      return next;
    });

    // Switch to another project or clear
    if (activeProjectId === id) {
      if (remaining.length > 0) {
        setActiveProjectId(remaining[0].id);
        setProject(remaining[0]);
      } else {
        setActiveProjectId(null);
        setProject(null as unknown as ProjectWithRelations);
      }
    }
  };

  return (
    <ProjectContext.Provider value={{
      projects,
      activeProjectId,
      pinnedProjectIds,
      showInvite,
      showCreateProject,
      searchQuery,
      setShowInvite,
      setShowCreateProject,
      setSearchQuery,
      handleProjectSelect,
      handlePin,
      handleProjectCreated,
      handleMemberInvited,
      handleDeleteProject,
      refetchProjects,
    }}>
      {children}
    </ProjectContext.Provider>
  );
}