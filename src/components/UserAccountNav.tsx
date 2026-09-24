"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";

interface UserAccountNavProps {
  user?: { name: string; role: string; email?: string } | null;
  onOpenAuthModal?: () => void;
}

export default function UserAccountNav({ user, onOpenAuthModal }: UserAccountNavProps) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      try {
        localStorage.removeItem("mocknepal_logged_in");
        sessionStorage.removeItem("mocknepal_guest_dismissed");
      } catch {}
      setDropdownOpen(false);
      router.refresh();
      router.push("/");
    } catch {
      setLoggingOut(false);
    }
  };

  if (user) {
    const dashboardUrl =
      user.role === "ADMIN" || user.role === "CONTENT_EDITOR" || user.role === "OWNER"
        ? "/admin/dashboard"
        : "/student/dashboard";

    return (
      <div style={{ position: "relative" }}>
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.45rem",
            padding: "0.35rem 0.75rem",
            backgroundColor: "#F8FAFC",
            border: "1px solid #CBD5E1",
            borderRadius: "999px",
            color: "#0F172A",
            fontSize: "0.85rem",
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 150ms ease",
          }}
        >
          <div
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              backgroundColor: "#0B5ED7",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.75rem",
            }}
          >
            <User className="w-3.5 h-3.5" />
          </div>
          <span style={{ maxWidth: "100px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user.name.split(" ")[0]}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
        </button>

        {dropdownOpen && (
          <>
            <div
              style={{ position: "fixed", inset: 0, zIndex: 105 }}
              onClick={() => setDropdownOpen(false)}
            />
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 6px)",
                width: "210px",
                backgroundColor: "#FFFFFF",
                borderRadius: "10px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                border: "1px solid #E2E8F0",
                zIndex: 110,
                padding: "0.4rem 0",
                animation: "fadeIn 150ms ease",
              }}
            >
              <div style={{ padding: "0.5rem 0.85rem", borderBottom: "1px solid #F1F5F9" }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0F172A" }}>{user.name}</div>
                <div style={{ fontSize: "0.75rem", color: "#64748B" }}>{user.role}</div>
              </div>

              <Link
                href={dashboardUrl}
                onClick={() => setDropdownOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.5rem 0.85rem",
                  fontSize: "0.84rem",
                  color: "#334155",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                <LayoutDashboard className="w-4 h-4 text-sky-600" />
                <span>My Dashboard</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.5rem 0.85rem",
                  fontSize: "0.84rem",
                  color: "#DC2626",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  textAlign: "left",
                  borderTop: "1px solid #F1F5F9",
                }}
              >
                <LogOut className="w-4 h-4" />
                <span>{loggingOut ? "Signing out..." : "Sign Out (लगआउट)"}</span>
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
      <Link
        href="/login"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.35rem",
          fontSize: "0.82rem",
          fontWeight: 700,
          color: "#334155",
          textDecoration: "none",
          padding: "0.38rem 0.75rem",
          borderRadius: "6px",
          border: "1px solid #CBD5E1",
          whiteSpace: "nowrap",
          backgroundColor: "#FFFFFF",
        }}
      >
        <span>Login</span>
      </Link>
      <Link
        href="/register"
        style={{
          fontSize: "0.82rem",
          fontWeight: 700,
          color: "#FFFFFF",
          backgroundColor: "#0B5ED7",
          textDecoration: "none",
          padding: "0.38rem 0.85rem",
          borderRadius: "6px",
          whiteSpace: "nowrap",
          boxShadow: "0 1px 3px rgba(11, 94, 215, 0.2)",
        }}
      >
        Register
      </Link>
    </div>
  );
}
