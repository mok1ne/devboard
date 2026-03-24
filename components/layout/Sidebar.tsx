"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { useUIStore } from "@/store/board.store";
import { useProjectContext } from "@/lib/project-context";
import type { ProjectWithRelations } from "@/lib/types";
import "@/styles/components/_sidebar.scss";

const NAV_ITEMS = [
  { icon: "⊞", label: "Dashboard", href: "/dashboard" },
  { icon: "◎", label: "My Tasks", href: "/dashboard/my-tasks" },
  { icon: "⚙", label: "Settings", href: "/dashboard/settings" },
];

interface SidebarProps {
  projects: ProjectWithRelations[];
  activeProjectId?: string;
  onProjectSelect: (id: string) => void;
  onPinProject: (id: string) => void;
  pinnedProjectIds: string[];
  user: { id?: string; name?: string | null; email?: string | null; image?: string | null };
  onInviteClick: () => void;
}

export function Sidebar({
  projects,
  activeProjectId,
  onProjectSelect,
  onPinProject,
  pinnedProjectIds,
  user,
  onInviteClick,
}: SidebarProps) {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { handleDeleteProject } = useProjectContext();
  const router = useRouter();
  const pathname = usePathname();

  const pinned = projects.filter((p) => pinnedProjectIds.includes(p.id));
  const unpinned = projects.filter((p) => !pinnedProjectIds.includes(p.id));

  return (
    <aside className={`sidebar ${!sidebarOpen ? "sidebar--collapsed" : ""}`}>
      <div className="sidebar__logo">
        <div className="sidebar__logo-icon">D</div>
        <span className="sidebar__logo-text">DevBoard</span>
      </div>

      <button className="sidebar__toggle" onClick={toggleSidebar} title="Toggle sidebar">
        {sidebarOpen ? "‹" : "›"}
      </button>

      <div className="sidebar__section">
        <div className="sidebar__section-title">Menu</div>
        {NAV_ITEMS.map((item) => (
          <div
            key={item.label}
            className={`sidebar__nav-item ${pathname === item.href ? "sidebar__nav-item--active" : ""}`}
            onClick={() => router.push(item.href)}
          >
            <span className="sidebar__nav-icon">{item.icon}</span>
            <span className="sidebar__label">{item.label}</span>
          </div>
        ))}
      </div>

      {pinned.length > 0 && (
        <div className="sidebar__section">
          <div className="sidebar__section-title">Pinned</div>
          {pinned.map((project) => (
            <ProjectItem
              key={project.id}
              project={project}
              isPinned
              isActive={activeProjectId === project.id}
              onSelect={() => { onProjectSelect(project.id); router.push("/dashboard"); }}
              onPin={() => onPinProject(project.id)}
              onDelete={() => handleDeleteProject(project.id)}
              onInvite={onInviteClick}
              sidebarOpen={sidebarOpen}
            />
          ))}
        </div>
      )}

      <div className="sidebar__section">
        <div className="sidebar__section-title">Projects</div>
      </div>

      <div className="sidebar__projects">
        {unpinned.map((project) => (
          <ProjectItem
            key={project.id}
            project={project}
            isPinned={false}
            isActive={activeProjectId === project.id}
            onSelect={() => { onProjectSelect(project.id); router.push("/dashboard"); }}
            onPin={() => onPinProject(project.id)}
            onDelete={() => handleDeleteProject(project.id)}
            onInvite={onInviteClick}
            sidebarOpen={sidebarOpen}
          />
        ))}

        {projects.length === 0 && sidebarOpen && (
          <div style={{ fontSize: 12, color: "var(--text-muted)", padding: "8px 12px" }}>
            No projects yet
          </div>
        )}
      </div>

      <div className="sidebar__user" onClick={() => router.push("/dashboard/settings")}>
        <div className="sidebar__avatar">
          {user.image ? (
            <Image src={user.image} alt={user.name ?? ""} width={32} height={32} />
          ) : (
            user.name?.charAt(0).toUpperCase() ?? "U"
          )}
        </div>
        <div className="sidebar__user-info sidebar__label">
          <div className="sidebar__user-name">{user.name ?? "User"}</div>
          <div className="sidebar__user-email">{user.email}</div>
        </div>
        <span className="sidebar__label" style={{ fontSize: 16, color: "var(--text-muted)", flexShrink: 0 }}>⚙</span>
      </div>
    </aside>
  );
}

function ProjectItem({
  project,
  isPinned,
  isActive,
  onSelect,
  onPin,
  onDelete,
  sidebarOpen,
}: {
  project: ProjectWithRelations;
  isPinned: boolean;
  isActive: boolean;
  onSelect: () => void;
  onPin: () => void;
  onDelete: () => void;
  onInvite: () => void;
  sidebarOpen: boolean;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    setDeleting(true);
    await onDelete();
    setDeleting(false);
  };

  return (
    <>
      <div
        className={`sidebar__project-item ${isActive ? "sidebar__project-item--active" : ""}`}
        style={{ position: "relative" }}
      >
        <div
          style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, cursor: "pointer", minWidth: 0 }}
          onClick={onSelect}
        >
          <div className="sidebar__project-dot" style={{ background: project.color, flexShrink: 0 }} />
          <span className="sidebar__project-name">{project.name}</span>
        </div>

        {sidebarOpen && (
          <div style={{ display: "flex", gap: 2, flexShrink: 0 }} className="project-actions">
            <button
              onClick={(e) => { e.stopPropagation(); onPin(); }}
              title={isPinned ? "Unpin" : "Pin"}
              style={{ opacity: 0, background: "none", border: "none", cursor: "pointer", fontSize: 11, color: isPinned ? "var(--accent)" : "var(--text-muted)", padding: "2px 3px", borderRadius: 4, transition: "opacity 150ms" }}
              className="pin-btn"
            >
              {isPinned ? "★" : "☆"}
            </button>

            <button
              onClick={handleDelete}
              title={confirmDelete ? "Click again to confirm" : "Delete project"}
              disabled={deleting}
              style={{
                opacity: 0,
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 11,
                color: confirmDelete ? "#ef4444" : "var(--text-muted)",
                padding: "2px 3px",
                borderRadius: 4,
                transition: "opacity 150ms, color 150ms",
                fontWeight: confirmDelete ? 700 : 400,
              }}
              className="delete-btn"
            >
              {deleting ? "…" : confirmDelete ? "✓?" : "✕"}
            </button>
          </div>
        )}
      </div>

      <style>{`
        .sidebar__project-item:hover .pin-btn,
        .sidebar__project-item:hover .delete-btn { opacity: 1 !important; }
      `}</style>
    </>
  );
}