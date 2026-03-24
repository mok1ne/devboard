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
  setShowInvite: (v: boolean) => void;
  setShowCreateProject: (v: boolean) => void;
  handleProjectSelect: (id: string) => void;
  handlePin: (id: string) => void;
  handleProjectCreated: (p: ProjectWithRelations) => void;
  handleMemberInvited: () => void;
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
  const { setProject } = useBoardStore();

  const [projects, setProjects] = useState<ProjectWithRelations[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [pinnedProjectIds, setPinnedProjectIds] = useState<string[]>([]);
  const [showInvite, setShowInvite] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);

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

  return (
    <ProjectContext.Provider value={{
      projects,
      activeProjectId,
      pinnedProjectIds,
      showInvite,
      showCreateProject,
      setShowInvite,
      setShowCreateProject,
      handleProjectSelect,
      handlePin,
      handleProjectCreated,
      handleMemberInvited,
      refetchProjects,
    }}>
      {children}
    </ProjectContext.Provider>
  );
}