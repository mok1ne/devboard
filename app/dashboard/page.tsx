"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Board } from "@/components/board/Board";
import { CreateProjectModal } from "@/components/board/CreateProjectModal";
import { useBoardStore, useUIStore } from "@/store/board.store";
import type { ProjectWithRelations } from "@/lib/types";
import "@/styles/pages/_dashboard.scss";
import "@/styles/components/_button.scss";
import "@/styles/components/_sidebar.scss";

export default function DashboardPage() {
  const { data: session } = useSession();
  const { sidebarOpen, toggleTheme } = useUIStore();
  const { setProject, project } = useBoardStore();

  const [projects, setProjects] = useState<ProjectWithRelations[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { setSearchQuery: setStoreSearch } = useBoardStore();

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
  }, [setProject]);

  const handleProjectSelect = (id: string) => {
    const p = projects.find((p) => p.id === id);
    if (p) {
      setActiveProjectId(id);
      setProject(p);
    }
  };

  const handleProjectCreated = (newProject: ProjectWithRelations) => {
    setProjects((prev) => [newProject, ...prev]);
    setActiveProjectId(newProject.id);
    setProject(newProject);
  };

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    setStoreSearch(q);
  };

  const user = session?.user ?? {};

  return (
    <div className="dashboard" data-theme={useUIStore.getState().theme}>
      <Sidebar
        projects={projects}
        activeProjectId={activeProjectId ?? undefined}
        onProjectSelect={handleProjectSelect}
        user={user}
      />

      <div className={`main-content ${!sidebarOpen ? "main-content--sidebar-collapsed" : ""}`}>
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar__left">
            <nav className="topbar__breadcrumb">
              <span>Projects</span>
              {project && (
                <>
                  <span className="topbar__breadcrumb-sep">/</span>
                  <span className="topbar__breadcrumb-current">{project.name}</span>
                </>
              )}
            </nav>
          </div>

          <div className="topbar__right">
            <div className="topbar__search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            <button className="topbar__icon-btn" onClick={toggleTheme} title="Toggle theme">
              ◑
            </button>

            <button
              className="btn btn--primary btn--sm"
              onClick={() => setShowCreateProject(true)}
            >
              + New Project
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="page-content">
          {project ? (
            <>
              <div className="page-header">
                <div className="page-header__title-group">
                  <h1 className="page-header__title">
                    <span
                      style={{
                        display: "inline-block",
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: project.color,
                        marginRight: 10,
                      }}
                    />
                    {project.name}
                  </h1>
                  {project.description && (
                    <p className="page-header__subtitle">{project.description}</p>
                  )}
                </div>

                <div className="page-header__actions">
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {project.members.slice(0, 4).map((m) => (
                      <div
                        key={m.user.id}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          background: "var(--bg-border)",
                          border: "2px solid var(--bg-secondary)",
                          overflow: "hidden",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 11,
                          fontWeight: 600,
                          color: "var(--text-secondary)",
                          marginLeft: -6,
                        }}
                        title={m.user.name ?? m.user.email ?? ""}
                      >
                        {m.user.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={m.user.image}
                            alt={m.user.name ?? ""}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          m.user.name?.charAt(0).toUpperCase()
                        )}
                      </div>
                    ))}
                    <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 6 }}>
                      {project.members.length} member{project.members.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>

              <Board projectId={project.id} />
            </>
          ) : (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 16,
                color: "var(--text-muted)",
              }}
            >
              <div style={{ fontSize: 48 }}>⊕</div>
              <p style={{ fontSize: 16, fontWeight: 500 }}>No projects yet</p>
              <p style={{ fontSize: 13 }}>Create your first project to get started</p>
              <button
                className="btn btn--primary"
                onClick={() => setShowCreateProject(true)}
              >
                + Create Project
              </button>
            </div>
          )}
        </main>
      </div>

      {showCreateProject && (
        <CreateProjectModal
          onClose={() => setShowCreateProject(false)}
          onCreated={handleProjectCreated}
        />
      )}
    </div>
  );
}
