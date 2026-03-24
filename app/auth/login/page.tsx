"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "@/styles/pages/_auth.scss";
import "@/styles/components/_button.scss";
import "@/styles/components/_modal.scss";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  const handleGitHub = () => signIn("github", { callbackUrl: "/dashboard" });

  return (
    <div className="auth-page">
      {/* Left Hero */}
      <div className="auth-hero">
        <div className="auth-hero__logo">
          <div className="auth-hero__logo-icon">D</div>
          <span className="auth-hero__logo-text">DevBoard</span>
        </div>
        <h1 className="auth-hero__title">
          Ship faster.<br />
          <span>Stay aligned.</span>
        </h1>
        <p className="auth-hero__subtitle">
          A Kanban board built for dev teams — with Markdown tasks, priorities, and real-time drag & drop.
        </p>
        <div className="auth-hero__features">
          {[
            { icon: "⚡", text: "Drag & drop Kanban with 5 stages" },
            { icon: "🏷️", text: "Labels, priorities & due dates" },
            { icon: "👥", text: "Team collaboration with roles" },
            { icon: "🌙", text: "Dark / Light theme support" },
          ].map((f) => (
            <div key={f.text} className="auth-hero__feature">
              <div className="auth-hero__feature-icon">{f.icon}</div>
              <span>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Form */}
      <div className="auth-form-container">
        <div className="auth-form-container__inner">
          <h2 className="auth-form-container__title">Welcome back</h2>
          <p className="auth-form-container__subtitle">Sign in to your account to continue</p>

          <button className="oauth-btn" onClick={handleGitHub} type="button">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Continue with GitHub
          </button>

          <div className="auth-divider">
            <div className="auth-divider__line" />
            <span className="auth-divider__text">or continue with email</span>
            <div className="auth-divider__line" />
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && <p className="form-error">⚠ {error}</p>}

              <button
                type="submit"
                className={`btn btn--primary btn--lg ${loading ? "btn--loading" : ""}`}
                disabled={loading}
                style={{ width: "100%", justifyContent: "center" }}
              >
                {!loading && "Sign in"}
              </button>
            </div>
          </form>

          <div className="auth-footer">
            Don't have an account?{" "}
            <Link href="/auth/register">Create one</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
