"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen, UserCheck, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      // Save user indicator in localStorage so UI components immediately know user is logged in
      try {
        localStorage.setItem("mocknepal_logged_in", "true");
      } catch {}

      const returnUrl = searchParams.get("returnUrl");
      const target = returnUrl || data.redirectUrl || "/student/dashboard";
      router.push(target);
      router.refresh();
    } catch {
      setError("An unexpected network error occurred");
      setLoading(false);
    }
  };

  const handleFillCredentials = (fillEmail: string, fillPass: string) => {
    setEmail(fillEmail);
    setPassword(fillPass);
    setError("");
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--color-bg)", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header style={{ height: "64px", backgroundColor: "#FFFFFF", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 1.5rem" }}>
        <Link href="/" className="public-logo">
          <BookOpen className="w-6 h-6 text-primary" />
          <span>नेपाल परीक्षा (Mock Nepal)</span>
        </Link>
        <Link href="/register" className="btn btn-secondary btn-sm">
          Create Account
        </Link>
      </header>

      {/* Login Card */}
      <main style={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1rem" }}>
        <div style={{ width: "100%", maxWidth: "440px" }}>
          <div className="card" style={{ border: "1px solid var(--color-border)", boxShadow: "var(--shadow-md)" }}>
            <div className="text-center mb-6">
              <span className="badge badge-primary mb-2">Secure Access</span>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Sign in to your Account</h1>
              <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
                Enter your registered credentials to continue your preparation.
              </p>
            </div>

            {error && (
              <div className="alert alert-error mb-4" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  placeholder="e.g. student@nepalexam.com"
                />
              </div>

              <div className="form-group">
                <div className="flex justify-between items-center">
                  <label className="form-label" htmlFor="password">Password</label>
                </div>
                <div style={{ position: "relative" }}>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input"
                    placeholder="••••••••"
                    style={{ paddingRight: "2.5rem" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "0.75rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#64748B",
                      padding: 0,
                    }}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", margin: "0.75rem 0", fontSize: "0.85rem", color: "#475569" }}>
                <input type="checkbox" id="rememberMe" defaultChecked style={{ accentColor: "#0B5ED7", cursor: "pointer" }} />
                <label htmlFor="rememberMe" style={{ cursor: "pointer" }}>Stay signed in on this device</label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-full mt-2"
              >
                {loading ? "Signing in..." : "Sign In & Continue"}
              </button>
            </form>

            <div className="text-center mt-4" style={{ fontSize: "0.85rem" }}>
              <span className="text-muted">Don&apos;t have an account? </span>
              <Link href="/register" style={{ fontWeight: 600, color: "#0B5ED7" }}>
                Register here
              </Link>
            </div>

            {/* Quick Demo Credentials */}
            <div style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px dashed var(--color-border)", fontSize: "0.8rem" }}>
              <div style={{ fontWeight: 600, color: "var(--color-text)", marginBottom: "0.5rem" }}>
                Evaluation Quick-Fill Accounts:
              </div>
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => handleFillCredentials("student@nepalexam.com", "Student@123")}
                  className="btn btn-ghost btn-sm"
                  style={{ justifyContent: "flex-start", fontSize: "0.8rem", height: "32px", padding: "0 0.5rem" }}
                >
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span><strong>Student:</strong> student@nepalexam.com</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleFillCredentials("admin@nepalexam.com", "Admin@123")}
                  className="btn btn-ghost btn-sm"
                  style={{ justifyContent: "flex-start", fontSize: "0.8rem", height: "32px", padding: "0 0.5rem" }}
                >
                  <Lock className="w-3.5 h-3.5 text-primary" />
                  <span><strong>Administrator:</strong> admin@nepalexam.com</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleFillCredentials("editor@nepalexam.com", "Editor@123")}
                  className="btn btn-ghost btn-sm"
                  style={{ justifyContent: "flex-start", fontSize: "0.8rem", height: "32px", padding: "0 0.5rem" }}
                >
                  <Lock className="w-3.5 h-3.5 text-teal-600" />
                  <span><strong>Content Editor:</strong> editor@nepalexam.com</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
