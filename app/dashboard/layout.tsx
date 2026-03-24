"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Sidebar } from "@/components/layout/Sidebar";
import { useUIStore } from "@/store/board.store";
import { useBoardStore } from "@/store/board.store";
import type { ProjectWithRelations } from "@/lib/types";
import "@/styles/pages/_dashboard.scss";
import "@/styles/components/_sidebar.scss";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const { sidebarOpen } = useUIStore();
  const { setProject } = useBoardStore();

  const [projects, setProjects] = useState<ProjectWithRelations[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [pinnedProjectIds, setPinnedProjectIds] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => {
        if (data.projects?.length) {
          setProjects(data.projects);
          setActiveProjectId(data.projects[0].id);
          setProject(data.projects[0]);
        }
      });
    try {
      const saved = JSON.parse(localStorage.getItem("pinnedProjects") ?? "[]");
      setPinnedProjectIds(saved);
    } catch {}
  }, [setProject]);

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

  const user = session?.user ?? {};

  return (
    <div className="dashboard">
      <Sidebar
        projects={projects}
        activeProjectId={activeProjectId ?? undefined}
        onProjectSelect={handleProjectSelect}
        onPinProject={handlePin}
        pinnedProjectIds={pinnedProjectIds}
        user={user}
        onInviteClick={() => {}}
      />
      <div className={`main-content ${!sidebarOpen ? "main-content--sidebar-collapsed" : ""}`}>
        {children}
      </div>
    </div>
  );
}
