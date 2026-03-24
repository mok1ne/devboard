"use client";

import { useState } from "react";
import "@/styles/components/_modal.scss";
import "@/styles/components/_button.scss";

interface Member {
  user: { id: string; name: string | null; email: string | null; image: string | null };
  role: string;
}

interface InviteMemberModalProps {
  projectId: string;
  members: Member[];
  onClose: () => void;
  onInvited: (member: Member) => void;
}

export function InviteMemberModal({ projectId, members, onClose, onInvited }: InviteMemberModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const res = await fetch("/api/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, projectId }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to invite member");
    } else {
      setSuccess(`${data.member.user.name ?? email} added to project!`);
      setEmail("");
      onInvited(data.member);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-scale-in" style={{ maxWidth: 480 }}>
        <div className="modal__header">
          <h2 className="modal__title">Team Members</h2>
          <button className="modal__close" onClick={onClose}>×</button>
        </div>

        <div className="modal__body">
          {/* Current members list */}
          <div>
            <label className="form-label" style={{ marginBottom: 10, display: "block" }}>
              Current Members ({members.length})
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {members.map((m) => (
                <div
                  key={m.user.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 14px",
                    background: "var(--bg-secondary)",
                    borderRadius: 10,
                    border: "1px solid var(--bg-border)",
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      background: "var(--accent-dim)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--accent)",
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                  >
                    {m.user.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.user.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      m.user.name?.charAt(0).toUpperCase() ?? "U"
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>
                      {m.user.name ?? "Unknown"}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{m.user.email}</div>
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      padding: "3px 8px",
                      borderRadius: 99,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      background: m.role === "OWNER" ? "var(--accent-dim)" : "var(--bg-border)",
                      color: m.role === "OWNER" ? "var(--accent)" : "var(--text-muted)",
                    }}
                  >
                    {m.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Invite form */}
          <form onSubmit={handleInvite}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <label className="form-label">Invite by Email</label>
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  type="email"
                  className="form-input"
                  placeholder="teammate@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ flex: 1 }}
                />
                <button
                  type="submit"
                  className={`btn btn--primary ${loading ? "btn--loading" : ""}`}
                  disabled={loading}
                >
                  {!loading && "Invite"}
                </button>
              </div>

              {error && <p className="form-error">⚠ {error}</p>}
              {success && (
                <div
                  style={{
                    fontSize: 13,
                    color: "#22c55e",
                    background: "rgba(34,197,94,0.1)",
                    border: "1px solid rgba(34,197,94,0.3)",
                    padding: "8px 14px",
                    borderRadius: 8,
                  }}
                >
                  ✓ {success}
                </div>
              )}
            </div>
          </form>
        </div>

        <div className="modal__footer">
          <button className="btn btn--secondary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}
