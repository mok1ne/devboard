"use client";

import { useState } from "react";
import type { ProjectWithRelations } from "@/lib/types";
import "@/styles/components/_modal.scss";
import "@/styles/components/_button.scss";

const PROJECT_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
  "#f97316", "#f59e0b", "#22c55e", "#14b8a6",
  "#3b82f6", "#06b6d4",
];

interface CreateProjectModalProps {
  onClose: () => void;
  onCreated: (project: ProjectWithRelations) => void;
}

export function CreateProjectModal({ onClose, onCreated }: CreateProjectModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#6366f1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, color }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to create project");
      return;
    }

    onCreated(data.project);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-scale-in" style={{ maxWidth: 440 }}>
        <div className="modal__header">
          <h2 className="modal__title">New Project</h2>
          <button className="modal__close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal__body">
            <div className="form-group">
              <label className="form-label">Project Name *</label>
              <input
                className="form-input"
                placeholder="e.g. Backend API v2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                placeholder="What is this project about?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Color</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
                {PROJECT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: c,
                      border: color === c ? "3px solid white" : "3px solid transparent",
                      boxShadow: color === c ? `0 0 0 2px ${c}` : "none",
                      cursor: "pointer",
                      transition: "all 150ms",
                    }}
                  />
                ))}
              </div>
            </div>

            {error && <p className="form-error">⚠ {error}</p>}
          </div>

          <div className="modal__footer">
            <button type="button" className="btn btn--secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className={`btn btn--primary ${loading ? "btn--loading" : ""}`}
              disabled={loading}
            >
              {!loading && "Create project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
