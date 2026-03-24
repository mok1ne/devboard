"use client";

import { signOut } from "next-auth/react";
import Image from "next/image";
import { useUIStore } from "@/store/board.store";
import type { ProjectWithRelations } from "@/lib/types";
import "@/styles/components/_sidebar.scss";

const NAV_ITEMS = [
  { icon: "⊞", label: "Dashboard", href: "/dashboard" },
  { icon: "◎", label: "My Tasks", href: "/dashboard/tasks" },
  { icon: "⚙", label: "Settings", href: "/dashboard/settings" },
];

interface SidebarProps {
  projects: ProjectWithRelations[];
  activeProjectId?: string;
  onProjectSelect: (id: string) => void;
  user: { name?: string | null; email?: string | null; image?: string | null };
}

export function Sidebar({ projects, activeProjectId, onProjectSelect, user }: SidebarProps) {
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <aside className={`sidebar ${!sidebarOpen ? "sidebar--collapsed" : ""}`}>
      {/* Logo */}
      <div className="sidebar__logo">
        <div className="sidebar__logo-icon">D</div>
        <span className="sidebar__logo-text">DevBoard</span>
      </div>

      {/* Toggle */}
      <button className="sidebar__toggle" onClick={toggleSidebar} title="Toggle sidebar">
        {sidebarOpen ? "‹" : "›"}
      </button>

      {/* Nav */}
      <div className="sidebar__section">
        <div className="sidebar__section-title">Menu</div>
        {NAV_ITEMS.map((item) => (
          <div key={item.label} className="sidebar__nav-item">
            <span className="sidebar__nav-icon">{item.icon}</span>
            <span className="sidebar__label">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Projects */}
      <div className="sidebar__section">
        <div className="sidebar__section-title">Projects</div>
      </div>

      <div className="sidebar__projects">
        {projects.map((project) => (
          <div
            key={project.id}
            className={`sidebar__project-item ${activeProjectId === project.id ? "sidebar__project-item--active" : ""}`}
            onClick={() => onProjectSelect(project.id)}
          >
            <div
              className="sidebar__project-dot"
              style={{ background: project.color }}
            />
            <span className="sidebar__project-name">{project.name}</span>
          </div>
        ))}
      </div>

      {/* User */}
      <div className="sidebar__user" onClick={() => signOut({ callbackUrl: "/auth/login" })}>
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
      </div>
    </aside>
  );
}
