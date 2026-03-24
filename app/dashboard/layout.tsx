"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { CreateProjectModal } from "@/components/board/CreateProjectModal";
import { InviteMemberModal } from "@/components/board/InviteMemberModal";
import { ProjectProvider, useProjectContext } from "@/lib/project-context";
import { useUIStore, useBoardStore } from "@/store/board.store";
import "@/styles/pages/_dashboard.scss";
import "@/styles/components/_sidebar.scss";

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const { sidebarOpen } = useUIStore();
  const { project } = useBoardStore();
  const {
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
  } = useProjectContext();

  const router = useRouter();
  const user = session?.user ?? {};

  return (
    <div className="dashboard">
      <Sidebar
        projects={projects}
        activeProjectId={activeProjectId ?? undefined}
        onProjectSelect={(id) => { handleProjectSelect(id); router.push("/dashboard"); }}
        onPinProject={handlePin}
        pinnedProjectIds={pinnedProjectIds}
        user={user}
        onInviteClick={() => setShowInvite(true)}
      />

      <div className={`main-content ${!sidebarOpen ? "main-content--sidebar-collapsed" : ""}`}>
        {children}
      </div>

      {showCreateProject && (
        <CreateProjectModal
          onClose={() => setShowCreateProject(false)}
          onCreated={handleProjectCreated}
        />
      )}

      {showInvite && project && (
        <InviteMemberModal
          projectId={project.id}
          members={project.members}
          onClose={() => setShowInvite(false)}
          onInvited={handleMemberInvited}
        />
      )}
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProjectProvider>
      <DashboardShell>{children}</DashboardShell>
    </ProjectProvider>
  );
}