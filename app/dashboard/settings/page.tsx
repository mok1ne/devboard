"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import "@/styles/pages/_settings.scss";
import "@/styles/pages/_dashboard.scss";
import "@/styles/components/_button.scss";
import "@/styles/components/_modal.scss";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [joinedAt, setJoinedAt] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setName(data.user.name ?? "");
          setBio(data.user.bio ?? "");
          setJoinedAt(
            new Date(data.user.createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          );
        }
      });
  }, []);

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setError("");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, bio }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) setError(data.error ?? "Failed to update");
    else showSuccess("Profile updated successfully");
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setError("");

    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await res.json();
    setPasswordLoading(false);

    if (!res.ok) setError(data.error ?? "Failed to update password");
    else {
      showSuccess("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
    }
  };

  const user = session?.user;

  return (
    <div className="page-content">
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div className="page-header__title-group">
          <h1 className="page-header__title">Settings</h1>
          <p className="page-header__subtitle">Manage your account preferences</p>
        </div>
      </div>

      <div className="settings-page">
        {success && (
          <div className="success-toast">✓ {success}</div>
        )}
        {error && <p className="form-error" style={{ marginBottom: 8 }}>⚠ {error}</p>}

        {/* Profile Section */}
        <div className="settings-page__section">
          <div className="settings-page__section-header">
            <div className="settings-page__section-title">Profile</div>
            <div className="settings-page__section-desc">Your public identity on DevBoard</div>
          </div>

          <form onSubmit={handleProfile}>
            <div className="settings-page__section-body">
              {/* Avatar */}
              <div className="settings-page__avatar-row">
                <div className="settings-page__avatar">
                  {user?.image ? (
                    <Image src={user.image} alt={user.name ?? ""} width={72} height={72} />
                  ) : (
                    name?.charAt(0)?.toUpperCase() ?? "U"
                  )}
                </div>
                <div className="settings-page__avatar-info">
                  <div className="settings-page__avatar-name">{name || "Your Name"}</div>
                  <div className="settings-page__avatar-email">{user?.email}</div>
                  {joinedAt && (
                    <div className="settings-page__avatar-joined">Joined {joinedAt}</div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Display Name</label>
                <input
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  required
                  minLength={2}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea
                  className="form-textarea"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell your team something about yourself..."
                  rows={3}
                  style={{ fontFamily: "inherit", fontSize: 14 }}
                />
              </div>
            </div>

            <div className="settings-page__section-footer">
              <button
                type="submit"
                className={`btn btn--primary ${loading ? "btn--loading" : ""}`}
                disabled={loading}
              >
                {!loading && "Save changes"}
              </button>
            </div>
          </form>
        </div>

        {/* Password Section */}
        <div className="settings-page__section">
          <div className="settings-page__section-header">
            <div className="settings-page__section-title">Password</div>
            <div className="settings-page__section-desc">
              {user?.image
                ? "You signed in with GitHub — password login is not set"
                : "Update your account password"}
            </div>
          </div>

          <form onSubmit={handlePassword}>
            <div className="settings-page__section-body">
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  minLength={6}
                />
              </div>
            </div>

            <div className="settings-page__section-footer">
              <button
                type="submit"
                className={`btn btn--primary ${passwordLoading ? "btn--loading" : ""}`}
                disabled={passwordLoading}
              >
                {!passwordLoading && "Update password"}
              </button>
            </div>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="settings-page__section settings-page__danger-zone">
          <div className="settings-page__section-header">
            <div className="settings-page__section-title" style={{ color: "var(--color-danger, #ef4444)" }}>
              Danger Zone
            </div>
            <div className="settings-page__section-desc">Irreversible actions</div>
          </div>
          <div className="settings-page__section-body">
            <div className="settings-page__danger-row">
              <div>
                <div className="settings-page__section-title" style={{ fontSize: 13 }}>
                  Sign out of all devices
                </div>
                <div className="settings-page__danger-text">
                  This will end all active sessions
                </div>
              </div>
              <button
                className="btn btn--danger"
                onClick={() => signOut({ callbackUrl: "/auth/login" })}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
