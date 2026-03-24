"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "@/styles/pages/_auth.scss";
import "@/styles/components/_button.scss";
import "@/styles/components/_modal.scss";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      setLoading(false);
      return;
    }

    await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    router.push("/dashboard");
  };

  return (
    <div className="auth-page">
      <div className="auth-hero">
        <div className="auth-hero__logo">
          <div className="auth-hero__logo-icon">D</div>
          <span className="auth-hero__logo-text">DevBoard</span>
        </div>
        <h1 className="auth-hero__title">
          Your dev workflow,<br />
          <span>elevated.</span>
        </h1>
        <p className="auth-hero__subtitle">
          Join DevBoard and start managing your projects with a tool built by developers, for developers.
        </p>
        <div className="auth-hero__features">
          {[
            { icon: "🚀", text: "Get started in under 2 minutes" },
            { icon: "🔒", text: "Secure auth via GitHub OAuth" },
            { icon: "📋", text: "Unlimited projects & tasks" },
            { icon: "🎨", text: "Beautiful dark & light themes" },
          ].map((f) => (
            <div key={f.text} className="auth-hero__feature">
              <div className="auth-hero__feature-icon">{f.icon}</div>
              <span>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="auth-form-container">
        <div className="auth-form-container__inner">
          <h2 className="auth-form-container__title">Create account</h2>
          <p className="auth-form-container__subtitle">Free forever. No credit card needed.</p>

          <button
            className="oauth-btn"
            onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
            type="button"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Sign up with GitHub
          </button>

          <div className="auth-divider">
            <div className="auth-divider__line" />
            <span className="auth-divider__text">or sign up with email</span>
            <div className="auth-divider__line" />
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  name="name"
                  type="text"
                  className="form-input"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  name="email"
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  name="password"
                  type="password"
                  className="form-input"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>

              {error && <p className="form-error">⚠ {error}</p>}

              <button
                type="submit"
                className={`btn btn--primary btn--lg ${loading ? "btn--loading" : ""}`}
                disabled={loading}
                style={{ width: "100%", justifyContent: "center" }}
              >
                {!loading && "Create account"}
              </button>
            </div>
          </form>

          <div className="auth-footer">
            Already have an account? <Link href="/auth/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
