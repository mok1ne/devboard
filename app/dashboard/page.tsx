"use client";

import { useBoardStore } from "@/store/board.store";
import { useProjectContext } from "@/lib/project-context";
import { Board } from "@/components/board/Board";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import "@/styles/pages/_dashboard.scss";
import "@/styles/components/_button.scss";

export default function DashboardPage() {
  const { project } = useBoardStore();
  const { setShowInvite, setShowCreateProject, setSearchQuery } = useProjectContext();

  return (
    <>
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
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <ThemeToggle />

          {project && (
            <button className="btn btn--secondary btn--sm" onClick={() => setShowInvite(true)}>
              + Invite
            </button>
          )}
          <button className="btn btn--primary btn--sm" onClick={() => setShowCreateProject(true)}>
            + New Project
          </button>
        </div>
      </header>

      <main className="page-content">
        {project ? (
          <>
            <div className="page-header">
              <div className="page-header__title-group">
                <h1 className="page-header__title">
                  <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: project.color, marginRight: 10 }} />
                  {project.name}
                </h1>
                {project.description && (
                  <p className="page-header__subtitle">{project.description}</p>
                )}
              </div>
              <div className="page-header__actions">
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  {project.members.slice(0, 5).map((m) => (
                    <div
                      key={m.user.id}
                      style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--bg-border)", border: "2px solid var(--bg-secondary)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", marginLeft: -6, cursor: "pointer" }}
                      title={m.user.name ?? m.user.email ?? ""}
                      onClick={() => setShowInvite(true)}
                    >
                      {m.user.image
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={m.user.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : m.user.name?.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  <span
                    style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 10, cursor: "pointer" }}
                    onClick={() => setShowInvite(true)}
                  >
                    {project.members.length} member{project.members.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>
            <Board projectId={project.id} />
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, color: "var(--text-muted)" }}>
            <div style={{ fontSize: 48 }}>⊕</div>
            <p style={{ fontSize: 16, fontWeight: 500 }}>No projects yet</p>
            <p style={{ fontSize: 13 }}>Create your first project to get started</p>
            <button className="btn btn--primary" onClick={() => setShowCreateProject(true)}>
              + Create Project
            </button>
          </div>
        )}
      </main>
    </>
  );
}