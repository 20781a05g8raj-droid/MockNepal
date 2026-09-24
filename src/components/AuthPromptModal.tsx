"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Eye,
  EyeOff
} from "lucide-react";

interface ExamOption {
  id: string;
  title: string;
  categoryName?: string;
}

interface AuthPromptModalProps {
  user?: { name: string; role: string } | null;
  forceOpen?: boolean;
  onClose?: () => void;
}

export default function AuthPromptModal({ user, forceOpen, onClose }: AuthPromptModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Signup form state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupTargetExamId, setSignupTargetExamId] = useState("");
  const [signupLanguage, setSignupLanguage] = useState("BOTH");
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState("");

  // Exam options for signup
  const [exams, setExams] = useState<ExamOption[]>([]);

  // Check if modal should open automatically on first visit
  useEffect(() => {
    if (user) {
      setIsOpen(false);
      return;
    }

    if (forceOpen) {
      setIsOpen(true);
      return;
    }

    // Check if user has already dismissed modal in this session
    const hasDismissed = typeof window !== "undefined" ? sessionStorage.getItem("mocknepal_guest_dismissed") : null;
    if (!hasDismissed) {
      // Small timeout for smooth appearance
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [user, forceOpen]);

  // Fetch exams for signup dropdown
  useEffect(() => {
    if (tab === "signup" && exams.length === 0) {
      fetch("/api/exams")
        .then((res) => res.json())
        .then((data) => {
          if (data.exams && Array.isArray(data.exams)) {
            setExams(data.exams);
            if (data.exams.length > 0 && !signupTargetExamId) {
              setSignupTargetExamId(data.exams[0].id);
            }
          }
        })
        .catch(() => {});
    }
  }, [tab, exams.length, signupTargetExamId]);

  const handleDismiss = () => {
    setIsOpen(false);
    try {
      sessionStorage.setItem("mocknepal_guest_dismissed", "true");
    } catch {}
    if (onClose) onClose();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || "Login failed");
        setLoginLoading(false);
        return;
      }

      try {
        localStorage.setItem("mocknepal_logged_in", "true");
      } catch {}

      setIsOpen(false);
      router.refresh();
      router.push(data.redirectUrl || "/student/dashboard");
    } catch {
      setLoginError("Network error occurred");
      setLoginLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError("");
    setSignupLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signupName,
          email: signupEmail,
          password: signupPassword,
          targetExamId: signupTargetExamId || (exams[0]?.id ?? null),
          languagePreference: signupLanguage,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSignupError(data.error || "Account creation failed");
        setSignupLoading(false);
        return;
      }

      try {
        localStorage.setItem("mocknepal_logged_in", "true");
      } catch {}

      setIsOpen(false);
      router.refresh();
      router.push(data.redirectUrl || "/student/dashboard");
    } catch {
      setSignupError("Network error occurred");
      setSignupLoading(false);
    }
  };

  const fillQuickLogin = (email: string, pass: string) => {
    setLoginEmail(email);
    setLoginPassword(pass);
    setLoginError("");
  };

  if (user && !forceOpen) return null;
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        animation: "fadeIn 200ms ease",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          backgroundColor: "#FFFFFF",
          borderRadius: "16px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          border: "1px solid #E2E8F0",
          overflow: "hidden",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          maxHeight: "92vh",
        }}
      >
        {/* Top Header Banner */}
        <div
          style={{
            background: "linear-gradient(135deg, #1E3A8A 0%, #0B5ED7 100%)",
            color: "#FFFFFF",
            padding: "1.25rem 1.5rem 1rem 1.5rem",
            position: "relative",
          }}
        >
          <button
            type="button"
            onClick={handleDismiss}
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              background: "rgba(255, 255, 255, 0.15)",
              border: "none",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
              cursor: "pointer",
              transition: "background 150ms",
            }}
            title="Dismiss / Browse as Guest"
          >
            <X className="w-4 h-4" />
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "6px",
                background: "#DC2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span style={{ fontSize: "1.1rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
              Mock Nepal <span style={{ fontSize: "0.8rem", fontWeight: 400, opacity: 0.9 }}>नेपाल परीक्षा</span>
            </span>
          </div>

          <h2 style={{ fontSize: "1.15rem", fontWeight: 700, margin: "0.2rem 0" }}>
            {tab === "login" ? "Welcome Back! लगइन गर्नुहोस्" : "Start Learning! नयाँ खाता खोल्नुहोस्"}
          </h2>
          <p style={{ fontSize: "0.8rem", color: "#E0E7FF", margin: 0, lineHeight: 1.4 }}>
            Save test scores, track daily revision, and practice syllabus MCQs.
          </p>

          {/* Dual Tabs Switcher */}
          <div
            style={{
              display: "flex",
              marginTop: "0.85rem",
              background: "rgba(0, 0, 0, 0.22)",
              borderRadius: "8px",
              padding: "3px",
            }}
          >
            <button
              type="button"
              onClick={() => setTab("login")}
              style={{
                flex: 1,
                padding: "0.4rem 0",
                fontSize: "0.84rem",
                fontWeight: 700,
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                backgroundColor: tab === "login" ? "#FFFFFF" : "transparent",
                color: tab === "login" ? "#0F172A" : "#E2E8F0",
                transition: "all 150ms ease",
              }}
            >
              Sign In (लगइन)
            </button>
            <button
              type="button"
              onClick={() => setTab("signup")}
              style={{
                flex: 1,
                padding: "0.4rem 0",
                fontSize: "0.84rem",
                fontWeight: 700,
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                backgroundColor: tab === "signup" ? "#FFFFFF" : "transparent",
                color: tab === "signup" ? "#0F172A" : "#E2E8F0",
                transition: "all 150ms ease",
              }}
            >
              Sign Up (नयाँ खाता)
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div style={{ padding: "1.25rem 1.5rem", overflowY: "auto", flexGrow: 1 }}>
          {tab === "login" ? (
            /* ================= LOGIN TAB ================= */
            <form onSubmit={handleLogin}>
              {loginError && (
                <div
                  style={{
                    backgroundColor: "#FEF2F2",
                    color: "#DC2626",
                    border: "1px solid #FECACA",
                    borderRadius: "8px",
                    padding: "0.5rem 0.75rem",
                    fontSize: "0.82rem",
                    marginBottom: "0.85rem",
                  }}
                >
                  {loginError}
                </div>
              )}

              <div style={{ marginBottom: "0.85rem" }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "0.25rem" }}>
                  Email Address
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="student@nepalexam.com"
                    style={{
                      width: "100%",
                      padding: "0.55rem 0.75rem 0.55rem 2.2rem",
                      fontSize: "0.88rem",
                      border: "1px solid #CBD5E1",
                      borderRadius: "7px",
                      outline: "none",
                    }}
                  />
                  <Mail
                    className="w-4 h-4 text-slate-400"
                    style={{ position: "absolute", left: "0.65rem", top: "50%", transform: "translateY(-50%)" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "0.85rem" }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "0.25rem" }}>
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: "100%",
                      padding: "0.55rem 2.2rem 0.55rem 2.2rem",
                      fontSize: "0.88rem",
                      border: "1px solid #CBD5E1",
                      borderRadius: "7px",
                      outline: "none",
                    }}
                  />
                  <Lock
                    className="w-4 h-4 text-slate-400"
                    style={{ position: "absolute", left: "0.65rem", top: "50%", transform: "translateY(-50%)" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "0.65rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#64748B",
                      padding: 0,
                    }}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "1rem", fontSize: "0.8rem", color: "#64748B" }}>
                <input type="checkbox" id="modalRemember" defaultChecked style={{ accentColor: "#0B5ED7", cursor: "pointer" }} />
                <label htmlFor="modalRemember" style={{ cursor: "pointer" }}>Stay signed in permanently</label>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                style={{
                  width: "100%",
                  padding: "0.65rem",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  backgroundColor: "#0B5ED7",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "8px",
                  cursor: loginLoading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.4rem",
                  boxShadow: "0 2px 4px rgba(11, 94, 215, 0.25)",
                }}
              >
                <span>{loginLoading ? "Signing in..." : "Sign In & Keep Logged In"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Demo Accounts Quick Fill */}
              <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px dashed #E2E8F0" }}>
                <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "#64748B", display: "block", marginBottom: "0.4rem" }}>
                  Or One-Click Demo Login:
                </span>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem" }}>
                  <button
                    type="button"
                    onClick={() => fillQuickLogin("student@nepalexam.com", "Student@123")}
                    style={{
                      padding: "0.35rem 0.5rem",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      backgroundColor: "#F0FDF4",
                      color: "#166534",
                      border: "1px solid #BBF7D0",
                      borderRadius: "6px",
                      cursor: "pointer",
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                    }}
                  >
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Student Demo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillQuickLogin("admin@nepalexam.com", "Admin@123")}
                    style={{
                      padding: "0.35rem 0.5rem",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      backgroundColor: "#EFF6FF",
                      color: "#1E40AF",
                      border: "1px solid #BFDBFE",
                      borderRadius: "6px",
                      cursor: "pointer",
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                    }}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Admin Demo</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* ================= SIGN UP TAB ================= */
            <form onSubmit={handleSignup}>
              {signupError && (
                <div
                  style={{
                    backgroundColor: "#FEF2F2",
                    color: "#DC2626",
                    border: "1px solid #FECACA",
                    borderRadius: "8px",
                    padding: "0.5rem 0.75rem",
                    fontSize: "0.82rem",
                    marginBottom: "0.85rem",
                  }}
                >
                  {signupError}
                </div>
              )}

              <div style={{ marginBottom: "0.75rem" }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "0.25rem" }}>
                  Full Name (पूरा नाम)
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    required
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="e.g. Ramesh Shrestha"
                    style={{
                      width: "100%",
                      padding: "0.5rem 0.75rem 0.5rem 2.2rem",
                      fontSize: "0.88rem",
                      border: "1px solid #CBD5E1",
                      borderRadius: "7px",
                      outline: "none",
                    }}
                  />
                  <UserIcon
                    className="w-4 h-4 text-slate-400"
                    style={{ position: "absolute", left: "0.65rem", top: "50%", transform: "translateY(-50%)" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "0.75rem" }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "0.25rem" }}>
                  Email Address
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="ramesh@example.com"
                    style={{
                      width: "100%",
                      padding: "0.5rem 0.75rem 0.5rem 2.2rem",
                      fontSize: "0.88rem",
                      border: "1px solid #CBD5E1",
                      borderRadius: "7px",
                      outline: "none",
                    }}
                  />
                  <Mail
                    className="w-4 h-4 text-slate-400"
                    style={{ position: "absolute", left: "0.65rem", top: "50%", transform: "translateY(-50%)" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "0.75rem" }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "0.25rem" }}>
                  Password (न्यूनतम ६ अक्षर)
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: "100%",
                      padding: "0.5rem 0.75rem 0.5rem 2.2rem",
                      fontSize: "0.88rem",
                      border: "1px solid #CBD5E1",
                      borderRadius: "7px",
                      outline: "none",
                    }}
                  />
                  <Lock
                    className="w-4 h-4 text-slate-400"
                    style={{ position: "absolute", left: "0.65rem", top: "50%", transform: "translateY(-50%)" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "0.85rem" }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "0.25rem" }}>
                  Target Exam (तपाईंको तयारी परीक्षा)
                </label>
                <select
                  value={signupTargetExamId}
                  onChange={(e) => setSignupTargetExamId(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.5rem 0.75rem",
                    fontSize: "0.85rem",
                    border: "1px solid #CBD5E1",
                    borderRadius: "7px",
                    backgroundColor: "#FFFFFF",
                    outline: "none",
                  }}
                >
                  {exams.length > 0 ? (
                    exams.map((exam) => (
                      <option key={exam.id} value={exam.id}>
                        {exam.title}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="">Lok Sewa Section Officer (शाखा अधिकृत)</option>
                      <option value="">Lok Sewa Nayab Subba (नायब सुब्बा)</option>
                      <option value="">Banking (NRB, RBB, ADBL)</option>
                      <option value="">NEC Engineering License</option>
                      <option value="">Shikshak Sewa (TSC)</option>
                      <option value="">Computer Operator (PSC)</option>
                    </>
                  )}
                </select>
              </div>

              <button
                type="submit"
                disabled={signupLoading}
                style={{
                  width: "100%",
                  padding: "0.65rem",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  backgroundColor: "#059669",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "8px",
                  cursor: signupLoading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.4rem",
                  boxShadow: "0 2px 4px rgba(5, 150, 105, 0.25)",
                }}
              >
                <span>{signupLoading ? "Creating Account..." : "Create Account & Sign In"}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* Footer / Guest dismissal */}
        <div
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "#F8FAFC",
            borderTop: "1px solid #E2E8F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: "0.78rem", color: "#64748B" }}>
            Free access to thousands of MCQs
          </span>
          <button
            type="button"
            onClick={handleDismiss}
            style={{
              background: "none",
              border: "none",
              color: "#475569",
              fontSize: "0.78rem",
              fontWeight: 600,
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            अहिलेलाई ब्राउज मात्र गर्नुहोस् (Browse as Guest)
          </button>
        </div>
      </div>
    </div>
  );
}
